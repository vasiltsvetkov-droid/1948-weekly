import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { supabase } from '../lib/supabaseClient'
import { computeMetrics } from '../lib/computeMetrics'
import { generateRecommendations } from '../lib/generateRecommendations'
import { CSV_COLUMNS } from '../constants/csvColumns'

function parseDate(dateStr) {
  if (!dateStr) return null
  const s = dateStr.trim()

  // Try ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s)
    if (!isNaN(d)) return d
  }

  // Try European formats: DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
  const euro = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/)
  if (euro) {
    const d = new Date(Number(euro[3]), Number(euro[2]) - 1, Number(euro[1]))
    if (!isNaN(d)) return d
  }

  // Try US format: MM/DD/YYYY (fallback)
  const us = new Date(s)
  if (!isNaN(us)) return us

  return null
}

function getMonday(dateStr) {
  const d = parseDate(dateStr)
  if (!d) return null
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export default function Upload() {
  const [files, setFiles] = useState([])
  const [parsedData, setParsedData] = useState(null) // { playerName: { sessions, weekStart } }
  const [processing, setProcessing] = useState(false)
  const [newPlayerModal, setNewPlayerModal] = useState(null)
  const [newPlayerPosition, setNewPlayerPosition] = useState('CM')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'))
    if (dropped.length) parseFiles(dropped)
  }, [])

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files)
    if (selected.length) parseFiles(selected)
  }

  const parseFiles = (fileList) => {
    setFiles(fileList)
    setError(null)
    const allSessions = {}

    let remaining = fileList.length
    fileList.forEach(file => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          results.data.forEach(row => {
            const name = row[CSV_COLUMNS.player]
            if (!name) return
            if (!allSessions[name]) allSessions[name] = []
            allSessions[name].push(row)
          })
          remaining--
          if (remaining === 0) {
            const grouped = {}
            for (const [name, sessions] of Object.entries(allSessions)) {
              const dates = sessions
                .map(s => s[CSV_COLUMNS.date])
                .filter(Boolean)
                .sort()
              const weekStart = dates.length ? getMonday(dates[0]) : null
              grouped[name] = { sessions, weekStart }
            }
            setParsedData(grouped)
          }
        },
        error: () => {
          setError(`Failed to parse ${file.name}`)
        }
      })
    })
  }

  const handleConfirm = async () => {
    if (!parsedData) return
    setProcessing(true)
    setError(null)

    try {
      const playerNames = Object.keys(parsedData)

      // Look up or create players
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .in('name', playerNames)

      const playerMap = {}
      for (const p of (existingPlayers || [])) {
        playerMap[p.name] = p
      }

      // Check for unknown players
      for (const name of playerNames) {
        if (!playerMap[name]) {
          setNewPlayerModal(name)
          setProcessing(false)
          return
        }
      }

      await processAllPlayers(playerMap)
    } catch (err) {
      setError(err.message)
      setProcessing(false)
    }
  }

  const createPlayerAndContinue = async () => {
    const { data: newPlayer, error: createError } = await supabase
      .from('players')
      .insert({ name: newPlayerModal, position: newPlayerPosition })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      return
    }

    setNewPlayerModal(null)
    setProcessing(true)

    // Rebuild player map and check again
    const playerNames = Object.keys(parsedData)
    const { data: allPlayers } = await supabase
      .from('players')
      .select('*')
      .in('name', playerNames)

    const playerMap = {}
    for (const p of (allPlayers || [])) {
      playerMap[p.name] = p
    }

    // Check for more unknown players
    for (const name of playerNames) {
      if (!playerMap[name]) {
        setNewPlayerModal(name)
        setProcessing(false)
        return
      }
    }

    await processAllPlayers(playerMap)
  }

  const processAllPlayers = async (playerMap) => {
    try {
      const processedIds = []

      for (const [name, { sessions, weekStart }] of Object.entries(parsedData)) {
        const player = playerMap[name]
        if (!player || !weekStart) continue

        // Get match references
        const { data: refRows } = await supabase
          .from('match_references')
          .select('*')
          .eq('player_id', player.id)

        const matchRefs = {}
        for (const r of (refRows || [])) {
          matchRefs[r.metric_key] = r.value_per90
        }

        // Get history (up to 4 prior weeks)
        const { data: historyRows } = await supabase
          .from('weekly_aggregates')
          .select('*')
          .eq('player_id', player.id)
          .lt('week_start_date', weekStart)
          .order('week_start_date', { ascending: false })
          .limit(4)

        const history = (historyRows || []).reverse()

        // Get personal max speed
        const { data: speedRows } = await supabase
          .from('weekly_aggregates')
          .select('top_speed')
          .eq('player_id', player.id)
          .order('top_speed', { ascending: false })
          .limit(1)

        const personalMaxSpeed = speedRows?.[0]?.top_speed || null

        // Compute metrics
        const metrics = computeMetrics({
          sessions,
          matchRefs,
          history,
          position: player.position,
          personalMaxSpeed,
        })

        // Write weekly_sessions
        const sessionRows = sessions.map(s => ({
          player_id: player.id,
          week_start_date: weekStart,
          session_date: (() => { const pd = parseDate(s[CSV_COLUMNS.date]); return pd ? pd.toISOString().split('T')[0] : null })(),
          data: s,
        }))

        await supabase.from('weekly_sessions').insert(sessionRows)

        // Upsert weekly_aggregates
        const aggregateRow = {
          player_id: player.id,
          week_start_date: weekStart,
          total_distance: metrics.total_distance,
          hsr_distance: metrics.hsr_distance,
          sprint_distance: metrics.sprint_distance,
          hmld: metrics.hmld,
          total_nrg: metrics.total_nrg,
          nrg_above_th: metrics.nrg_above_th,
          total_accelerations: metrics.total_accelerations,
          total_decelerations: metrics.total_decelerations,
          mechanical_load: metrics.mechanical_load,
          equivalent_distance: metrics.equivalent_distance,
          high_efforts: metrics.high_efforts,
          avg_metabolic_power: metrics.avg_metabolic_power,
          max_metabolic_power: metrics.max_metabolic_power,
          top_speed: metrics.top_speed,
          avg_speed: metrics.avg_speed,
          intensity_indicator: metrics.intensity_indicator,
          avg_hr: metrics.avg_hr,
          max_hr: metrics.max_hr,
          heart_exertion: metrics.heart_exertion,
          heart_exertion_above_th: metrics.heart_exertion_above_th,
          acwr_total_distance: metrics.acwr_total_distance,
          acwr_sprint: metrics.acwr_sprint,
          acwr_mechanical: metrics.acwr_mechanical,
          api: metrics.api,
          rtt: metrics.rtt,
          rs: metrics.rs,
          tmi: metrics.tmi,
          injury_risk: metrics.injury_risk,
          monotony: isFinite(metrics.monotony) ? metrics.monotony : null,
          load_pct_total_distance: metrics.load_pct_total_distance,
          load_pct_hsr: metrics.load_pct_hsr,
          load_pct_sprint: metrics.load_pct_sprint,
          load_pct_hmld: metrics.load_pct_hmld,
          load_pct_nrg: metrics.load_pct_nrg,
          load_pct_acc: metrics.load_pct_acc,
          load_pct_dec: metrics.load_pct_dec,
          daily_loads: metrics.daily_loads,
        }

        await supabase
          .from('weekly_aggregates')
          .upsert(aggregateRow, { onConflict: 'player_id,week_start_date' })

        processedIds.push(player.id)
      }

      // Update team snapshot
      const weekStarts = [...new Set(Object.values(parsedData).map(d => d.weekStart).filter(Boolean))]
      for (const ws of weekStarts) {
        const { data: weekAggs } = await supabase
          .from('weekly_aggregates')
          .select('api, player_id')
          .eq('week_start_date', ws)

        const apis = (weekAggs || []).map(a => a.api).filter(v => v != null)
        const tpi = apis.length ? apis.reduce((a, b) => a + b, 0) / apis.length : null

        await supabase
          .from('team_snapshots')
          .upsert({ week_start_date: ws, tpi, squad_data: weekAggs }, { onConflict: 'week_start_date' })
      }

      if (processedIds.length === 1) {
        navigate(`/player/${processedIds[0]}`)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload CSV Data</h1>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-[#E8530A] transition-colors cursor-pointer"
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="text-slate-400 text-lg mb-2">Drop CSV files here or click to browse</div>
        <div className="text-slate-500 text-sm">Accepts multiple Barin Sports PRO GPS export files</div>
        <input
          id="file-input"
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 text-sm text-slate-400">
          {files.length} file(s) selected: {files.map(f => f.name).join(', ')}
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-400 bg-red-400/10 rounded-lg px-4 py-2 text-sm">{error}</div>
      )}

      {/* Session Preview */}
      {parsedData && (
        <div className="mt-6 space-y-4">
          {Object.entries(parsedData).map(([name, { sessions, weekStart }]) => (
            <div key={name} className="bg-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">{name}</h3>
                <span className="text-xs text-slate-400">Week: {weekStart}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-1 pr-3">Date</th>
                      <th className="text-right py-1 px-2">Total Dist</th>
                      <th className="text-right py-1 px-2">HSR</th>
                      <th className="text-right py-1 px-2">Sprint</th>
                      <th className="text-right py-1 px-2">HMLD</th>
                      <th className="text-right py-1 px-2">NRG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={i} className="border-b border-slate-700/50">
                        <td className="py-1 pr-3">{s[CSV_COLUMNS.date] || '—'}</td>
                        <td className="text-right px-2">{Number(s[CSV_COLUMNS.total_distance] || 0).toFixed(0)}</td>
                        <td className="text-right px-2">{Number(s[CSV_COLUMNS.zone4plus5] || 0).toFixed(0)}</td>
                        <td className="text-right px-2">{Number(s[CSV_COLUMNS.zone5_distance] || 0).toFixed(0)}</td>
                        <td className="text-right px-2">{Number(s[CSV_COLUMNS.hmld] || 0).toFixed(0)}</td>
                        <td className="text-right px-2">{Number(s[CSV_COLUMNS.total_nrg] || 0).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <button
            onClick={handleConfirm}
            disabled={processing}
            className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#E8530A' }}
          >
            {processing ? 'Processing...' : 'Confirm & Process'}
          </button>
        </div>
      )}

      {/* New Player Modal */}
      {newPlayerModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-4">New Player Detected</h3>
            <p className="text-sm text-slate-400 mb-4">
              Player "{newPlayerModal}" not found. Create a new player record:
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={newPlayerModal}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Position</label>
                <select
                  value={newPlayerPosition}
                  onChange={(e) => setNewPlayerPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                >
                  {['CB', 'FB', 'CM', 'WM', 'ST', 'GK'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setNewPlayerModal(null); setProcessing(false) }}
                  className="flex-1 py-2 rounded-lg bg-slate-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={createPlayerAndContinue}
                  className="flex-1 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: '#E8530A' }}
                >
                  Create & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
