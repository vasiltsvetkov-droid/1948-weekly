import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { supabase } from '../lib/supabaseClient'
import { computeMetrics } from '../lib/computeMetrics'
import { generateRecommendations } from '../lib/generateRecommendations'
import { CSV_COLUMNS } from '../constants/csvColumns'

// Normalize a header string for fuzzy matching: lowercase, strip non-ascii, collapse whitespace
function normalizeHeader(h) {
  return h
    .replace(/[^\x20-\x7E]/g, '') // strip non-ASCII (handles mojibake)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// Build a mapping from actual CSV headers to our expected column names
function buildHeaderMap(actualHeaders) {
  const expectedEntries = Object.values(CSV_COLUMNS)
  const normalizedExpected = expectedEntries.map(h => ({ original: h, normalized: normalizeHeader(h) }))

  const map = {} // actual header -> expected header
  for (const actual of actualHeaders) {
    const norm = normalizeHeader(actual)
    const match = normalizedExpected.find(e => e.normalized === norm)
    if (match) {
      map[actual] = match.original
    }
  }
  return map
}

// Remap a CSV row's keys from actual (possibly mangled) headers to expected column names
function remapRow(row, headerMap) {
  const out = {}
  for (const [actualKey, value] of Object.entries(row)) {
    const mappedKey = headerMap[actualKey] || actualKey
    out[mappedKey] = value
  }
  return out
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'NA') return null
  const s = dateStr.trim()

  // DD.MM or DD/MM (no year — assume current year)
  const shortMatch = s.match(/^(\d{1,2})[\/.](\d{1,2})$/)
  if (shortMatch) {
    const d = new Date(new Date().getFullYear(), Number(shortMatch[2]) - 1, Number(shortMatch[1]))
    if (!isNaN(d)) return d
  }

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s)
    if (!isNaN(d)) return d
  }

  // European formats: DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
  const euro = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/)
  if (euro) {
    const d = new Date(Number(euro[3]), Number(euro[2]) - 1, Number(euro[1]))
    if (!isNaN(d)) return d
  }

  // Fallback
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
  const [parsedData, setParsedData] = useState(null)
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
          const actualHeaders = results.meta?.fields || []
          const headerMap = buildHeaderMap(actualHeaders)
          results.data.forEach(rawRow => {
            const row = remapRow(rawRow, headerMap)
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

      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .in('name', playerNames)

      const playerMap = {}
      for (const p of (existingPlayers || [])) {
        playerMap[p.name] = p
      }

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

    const playerNames = Object.keys(parsedData)
    const { data: allPlayers } = await supabase
      .from('players')
      .select('*')
      .in('name', playerNames)

    const playerMap = {}
    for (const p of (allPlayers || [])) {
      playerMap[p.name] = p
    }

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

        const { data: refRows } = await supabase
          .from('match_references')
          .select('*')
          .eq('player_id', player.id)

        const matchRefs = {}
        for (const r of (refRows || [])) {
          matchRefs[r.metric_key] = r.value_per90
        }

        const { data: historyRows } = await supabase
          .from('weekly_aggregates')
          .select('*')
          .eq('player_id', player.id)
          .lt('week_start_date', weekStart)
          .order('week_start_date', { ascending: false })
          .limit(4)

        const history = (historyRows || []).reverse()

        const { data: speedRows } = await supabase
          .from('weekly_aggregates')
          .select('top_speed')
          .eq('player_id', player.id)
          .order('top_speed', { ascending: false })
          .limit(1)

        const personalMaxSpeed = speedRows?.[0]?.top_speed || null

        const metrics = computeMetrics({
          sessions,
          matchRefs,
          history,
          position: player.position,
          personalMaxSpeed,
        })

        const sessionRows = sessions.map(s => ({
          player_id: player.id,
          week_start_date: weekStart,
          session_date: (() => { const pd = parseDate(s[CSV_COLUMNS.date]); return pd ? pd.toISOString().split('T')[0] : null })(),
          data: s,
        }))

        const { error: sessErr } = await supabase.from('weekly_sessions').insert(sessionRows)
        if (sessErr) throw new Error(`weekly_sessions insert: ${sessErr.message}`)

        const num = v => (typeof v === 'number' && isFinite(v)) ? v : null

        const aggregateRow = {
          player_id: player.id,
          week_start_date: weekStart,
          total_distance: num(metrics.total_distance),
          hsr_distance: num(metrics.hsr_distance),
          sprint_distance: num(metrics.sprint_distance),
          hmld: num(metrics.hmld),
          total_nrg: num(metrics.total_nrg),
          nrg_above_th: num(metrics.nrg_above_th),
          total_accelerations: num(metrics.total_accelerations),
          total_decelerations: num(metrics.total_decelerations),
          mechanical_load: num(metrics.mechanical_load),
          equivalent_distance: num(metrics.equivalent_distance),
          high_efforts: num(metrics.high_efforts),
          avg_metabolic_power: num(metrics.avg_metabolic_power),
          max_metabolic_power: num(metrics.max_metabolic_power),
          top_speed: num(metrics.top_speed),
          avg_speed: num(metrics.avg_speed),
          intensity_indicator: num(metrics.intensity_indicator),
          avg_hr: num(metrics.avg_hr),
          max_hr: num(metrics.max_hr),
          heart_exertion: num(metrics.heart_exertion),
          heart_exertion_above_th: num(metrics.heart_exertion_above_th),
          acwr_total_distance: num(metrics.acwr_total_distance),
          acwr_sprint: num(metrics.acwr_sprint),
          acwr_mechanical: num(metrics.acwr_mechanical),
          acwr_nrg: num(metrics.acwr_nrg),
          api: num(metrics.api),
          rtt: num(metrics.rtt),
          rs: num(metrics.rs),
          tmi: num(metrics.tmi),
          injury_risk: num(metrics.injury_risk),
          fatigue_index: num(metrics.fatigue_index),
          monotony: num(metrics.monotony),
          load_pct_total_distance: num(metrics.load_pct_total_distance),
          load_pct_hsr: num(metrics.load_pct_hsr),
          load_pct_sprint: num(metrics.load_pct_sprint),
          load_pct_hmld: num(metrics.load_pct_hmld),
          load_pct_nrg: num(metrics.load_pct_nrg),
          load_pct_acc: num(metrics.load_pct_acc),
          load_pct_dec: num(metrics.load_pct_dec),
          daily_loads: metrics.daily_loads,
          explanations: metrics.explanations || null,
        }

        const { error: aggErr } = await supabase
          .from('weekly_aggregates')
          .upsert(aggregateRow, { onConflict: 'player_id,week_start_date' })
        if (aggErr) throw new Error(`weekly_aggregates upsert: ${aggErr.message}`)

        processedIds.push(player.id)
      }

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
    <div className="p-6 md:p-10">
      <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.9rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Upload CSV Data</h1>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="upload-zone"
        onClick={() => document.getElementById('file-input').click()}
      >
        <div style={{ fontSize: '2.5rem', opacity: 0.35, marginBottom: '0.75rem' }}>📂</div>
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Drop CSV files or click to upload
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', letterSpacing: '0.5px' }}>
          One or more Barin Sports PRO weekly summary exports
        </div>
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
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1" style={{
              background: 'rgba(227,6,19,.1)',
              border: '1px solid rgba(227,6,19,.3)',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: '#ff6677',
            }}>
              ✓ {f.name}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4" style={{
          padding: '0.625rem 1rem',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: '#EF4444',
        }}>{error}</div>
      )}

      {/* Session Preview */}
      {parsedData && (
        <div className="mt-6 space-y-4">
          {Object.entries(parsedData).map(([name, { sessions, weekStart }]) => (
            <div key={name} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '0.95rem' }}>{name}</h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Week: {weekStart}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {['Date', 'Total Dist', 'HSR', 'Sprint', 'HMLD', 'NRG'].map((h, i) => (
                        <th key={h} className={`py-2 px-3 ${i === 0 ? 'text-left' : 'text-right'}`} style={{
                          fontSize: '0.55rem',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                          fontWeight: 400,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td className="py-1.5 px-3">{s[CSV_COLUMNS.date] || '—'}</td>
                        <td className="text-right px-3">{Number(s[CSV_COLUMNS.total_distance] || 0).toFixed(0)}</td>
                        <td className="text-right px-3">{Number(s[CSV_COLUMNS.zone4plus5] || 0).toFixed(0)}</td>
                        <td className="text-right px-3">{Number(s[CSV_COLUMNS.zone5_distance] || 0).toFixed(0)}</td>
                        <td className="text-right px-3">{Number(s[CSV_COLUMNS.hmld] || 0).toFixed(0)}</td>
                        <td className="text-right px-3">{Number(s[CSV_COLUMNS.total_nrg] || 0).toFixed(0)}</td>
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
            className="btn-primary w-full py-3 disabled:opacity-50"
            style={{ fontSize: '1.1rem', letterSpacing: '2px', textTransform: 'uppercase' }}
          >
            {processing ? 'Processing...' : 'Confirm & Process'}
          </button>
        </div>
      )}

      {/* New Player Modal */}
      {newPlayerModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card p-6 max-w-sm w-full" style={{ background: 'var(--glass-bg)' }}>
            <h3 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>New Player Detected</h3>
            <p style={{ fontFamily: 'var(--font-data)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Player "{newPlayerModal}" not found. Create a new player record:
            </p>
            <div className="space-y-3">
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Name</label>
                <input
                  type="text"
                  value={newPlayerModal}
                  readOnly
                  className="w-full px-3 py-2 rounded-none"
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '0.85rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Position</label>
                <select
                  value={newPlayerPosition}
                  onChange={(e) => setNewPlayerPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-none"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {['CB', 'FB', 'CM', 'WM', 'ST', 'GK'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setNewPlayerModal(null); setProcessing(false) }}
                  className="flex-1 py-2 rounded-none btn-icon"
                  style={{ fontFamily: 'var(--font-main)', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={createPlayerAndContinue}
                  className="flex-1 py-2 rounded-none btn-primary"
                  style={{ fontSize: '0.85rem' }}
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
