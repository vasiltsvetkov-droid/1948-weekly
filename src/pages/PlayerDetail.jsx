import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { supabase } from '../lib/supabaseClient'
import { usePlayer } from '../hooks/usePlayer'
import { useHistory, usePersonalMaxSpeed } from '../hooks/useHistory'
import { generateRecommendations } from '../lib/generateRecommendations'
import { MATCH_DEFAULTS, METRIC_LABELS } from '../constants/matchDefaults'
import IndexCard from '../components/IndexCard'
import LoadBar from '../components/LoadBar'
import RecommendationCard from '../components/RecommendationCard'

export default function PlayerDetail() {
  const { id } = useParams()
  const { player, loading: playerLoading } = usePlayer(id)
  const { history, loading: historyLoading } = useHistory(id, 12)
  const personalMaxSpeed = usePersonalMaxSpeed(id)
  const [matchRefs, setMatchRefs] = useState(null)
  const pageRef = useRef(null)

  const latest = history.length ? history[history.length - 1] : null
  const explanations = latest?.explanations || null

  useEffect(() => {
    if (!id) return
    supabase
      .from('match_references')
      .select('*')
      .eq('player_id', id)
      .then(({ data }) => {
        const refs = {}
        for (const r of (data || [])) {
          refs[r.metric_key] = r.value_per90
        }
        setMatchRefs(refs)
      })
  }, [id])

  const resolvedRefs = (() => {
    if (!player) return {}
    const defaults = MATCH_DEFAULTS[player.position] || MATCH_DEFAULTS['CM']
    return {
      total_distance: matchRefs?.total_distance || defaults.total_distance,
      hsr: matchRefs?.hsr || defaults.hsr,
      sprint: matchRefs?.sprint || defaults.sprint,
      hmld: matchRefs?.hmld || defaults.hmld,
      nrg: matchRefs?.nrg || defaults.nrg,
      acc: matchRefs?.acc || defaults.acc,
      dec: matchRefs?.dec || defaults.dec,
    }
  })()

  const recommendations = latest
    ? generateRecommendations(latest, personalMaxSpeed)
    : []

  const handleExportPDF = async () => {
    if (!pageRef.current) return
    const canvas = await html2canvas(pageRef.current, { backgroundColor: '#0f172a', scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${player?.name || 'player'}-report.pdf`)
  }

  if (playerLoading || historyLoading) {
    return <div className="p-8 text-slate-400">Loading...</div>
  }

  if (!player) {
    return <div className="p-8 text-slate-400">Player not found.</div>
  }

  // Chart data
  const chartData = history.map(h => ({
    week: h.week_start_date,
    Performance: h.api != null ? (h.api / 10).toFixed(1) : null,
    RTT: h.rtt != null ? (h.rtt / 10).toFixed(1) : null,
    RS: h.rs != null ? (h.rs / 10).toFixed(1) : null,
    TMI: h.tmi != null ? (h.tmi / 10).toFixed(1) : null,
  }))

  const riskChartData = history.map(h => ({
    week: h.week_start_date,
    'Injury Risk': h.injury_risk != null ? (h.injury_risk / 10).toFixed(1) : null,
    'ACWR TD': h.acwr_total_distance != null ? Number(h.acwr_total_distance).toFixed(2) : null,
  }))

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto" ref={pageRef}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{player.name}</h1>
          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
            {player.position}
          </span>
        </div>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: '#E8530A' }}
        >
          Export PDF
        </button>
      </div>

      {!latest ? (
        <div className="text-slate-400 py-12 text-center">No weekly data available for this player.</div>
      ) : (
        <>
          {/* Section A: Index Hero Cards */}
          <div className="flex flex-wrap gap-3 mb-6">
            <IndexCard label="Performance" dbKey="api" value={latest.api} explanation={explanations?.performance} />
            <IndexCard label="RTT" dbKey="rtt" value={latest.rtt} explanation={explanations?.rtt} />
            <IndexCard label="RS" dbKey="rs" value={latest.rs} explanation={explanations?.rs} />
            <IndexCard label="TMI" dbKey="tmi" value={latest.tmi} explanation={explanations?.tmi} />
            <IndexCard label="Injury Risk" dbKey="injury_risk" value={latest.injury_risk} inverted />
          </div>

          {/* Fatigue Index & ACWR NRG Summary */}
          {(latest.fatigue_index != null || latest.acwr_nrg != null) && (
            <div className="bg-slate-800 rounded-xl p-4 mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Internal/External Load Balance</h2>
              <div className="flex flex-wrap gap-6 text-sm">
                {latest.acwr_nrg != null && (
                  <div>
                    <span className="text-slate-400">ACWR NRG: </span>
                    <span className="font-semibold" style={{
                      color: latest.acwr_nrg >= 0.8 && latest.acwr_nrg <= 1.3 ? '#22c55e'
                        : latest.acwr_nrg > 1.5 ? '#ef4444' : '#f59e0b'
                    }}>
                      {Number(latest.acwr_nrg).toFixed(2)}
                    </span>
                  </div>
                )}
                {latest.fatigue_index != null && (
                  <div>
                    <span className="text-slate-400">Fatigue Index: </span>
                    <span className="font-semibold" style={{
                      color: latest.fatigue_index <= -0.1 ? '#22c55e'
                        : latest.fatigue_index <= 5.0 ? '#f59e0b' : '#ef4444'
                    }}>
                      {Number(latest.fatigue_index).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      ({latest.fatigue_index <= -0.1 ? 'Low fatigue'
                        : latest.fatigue_index <= 0.5 ? 'Neutral'
                        : latest.fatigue_index <= 5.0 ? 'Mild fatigue' : 'High fatigue'})
                    </span>
                  </div>
                )}
                {latest.monotony != null && (
                  <div>
                    <span className="text-slate-400">Monotony: </span>
                    <span className="font-semibold" style={{
                      color: latest.monotony <= 1.5 ? '#22c55e'
                        : latest.monotony <= 2.0 ? '#f59e0b' : '#ef4444'
                    }}>
                      {isFinite(latest.monotony) ? Number(latest.monotony).toFixed(2) : 'INF'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section B: Load Achievement Panel */}
          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">Load Achievement</h2>
            <LoadBar metricKey="total_distance" label="Total Distance" value={latest.total_distance} refValue={resolvedRefs.total_distance} pct={latest.load_pct_total_distance} />
            <LoadBar metricKey="hsr" label="HSR (Zone 4+5)" value={latest.hsr_distance} refValue={resolvedRefs.hsr} pct={latest.load_pct_hsr} />
            <LoadBar metricKey="sprint" label="Sprint (Zone 5)" value={latest.sprint_distance} refValue={resolvedRefs.sprint} pct={latest.load_pct_sprint} />
            <LoadBar metricKey="hmld" label="HMLD" value={latest.hmld} refValue={resolvedRefs.hmld} pct={latest.load_pct_hmld} />
            <LoadBar metricKey="nrg" label="NRG Expenditure" value={latest.total_nrg} refValue={resolvedRefs.nrg} pct={latest.load_pct_nrg} />
            <LoadBar metricKey="acc" label="Accelerations" value={latest.total_accelerations} refValue={resolvedRefs.acc} pct={latest.load_pct_acc} />
            <LoadBar metricKey="dec" label="Decelerations" value={latest.total_decelerations} refValue={resolvedRefs.dec} pct={latest.load_pct_dec} />
          </div>

          {/* Section C: 12-Week Trend Charts */}
          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">12-Week Index Trends</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="Performance" stroke="#E8530A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="RTT" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="RS" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="TMI" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">Injury Risk & ACWR Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="left" domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 3]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Injury Risk" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="ACWR TD" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Section D: Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">Load Management Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((rec, i) => (
                  <RecommendationCard key={i} rec={rec} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
