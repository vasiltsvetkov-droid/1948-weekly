import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
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

const tooltipStyle = {
  backgroundColor: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  borderRadius: 2,
  color: 'var(--text-primary)',
  backdropFilter: 'blur(8px)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
}
const axisTickStyle = { fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'DM Mono, monospace' }
const gridStroke = 'rgba(148,163,184,0.08)'

function ACWRZoneBar({ value, label }) {
  if (value == null) return null
  const pct = Math.min(Math.max(value / 2.0, 0), 1) * 100
  const zoneColor = value >= 0.8 && value <= 1.3 ? '#10B981'
    : value > 1.5 ? '#EF4444'
    : value > 1.3 ? '#F59E0B'
    : '#3B82F6'

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span className="acwr-badge" style={{ color: zoneColor, borderColor: `${zoneColor}40`, background: `${zoneColor}18` }}>
          {value.toFixed(2)}
        </span>
      </div>
      <div className="acwr-zone-bar">
        <div className="acwr-zone under"><span>{'<0.8'}</span></div>
        <div className="acwr-zone sweet"><span>0.8–1.3</span></div>
        <div className="acwr-zone caution"><span>1.3–1.5</span></div>
        <div className="acwr-zone danger"><span>{'>1.5'}</span></div>
        <div className="acwr-marker" style={{ left: `${pct}%` }} />
      </div>
    </div>
  )
}

function ExplanationBox({ title, text }) {
  const [open, setOpen] = useState(false)
  if (!text) return null
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="transition-colors"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '1px',
          color: 'var(--color-primary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {open ? '▾' : '▸'} {title || 'Why this score?'}
      </button>
      {open && (
        <div className="explanation-panel mt-2">{text}</div>
      )}
    </div>
  )
}

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
    const canvas = await html2canvas(pageRef.current, { backgroundColor: '#0A0A0A', scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${player?.name || 'player'}-report.pdf`)
  }

  if (playerLoading || historyLoading) {
    return <div className="p-8" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>Loading...</div>
  }

  if (!player) {
    return <div className="p-8" style={{ fontFamily: 'var(--font-data)', color: 'var(--text-secondary)' }}>Player not found.</div>
  }

  // Chart data
  const chartData = history.map(h => ({
    week: h.week_start_date,
    Performance: h.api != null ? Number((h.api / 10).toFixed(1)) : null,
    RTT: h.rtt != null ? Number((h.rtt / 10).toFixed(1)) : null,
    RS: h.rs != null ? Number((h.rs / 10).toFixed(1)) : null,
    TMI: h.tmi != null ? Number((h.tmi / 10).toFixed(1)) : null,
  }))

  const riskChartData = history.map(h => ({
    week: h.week_start_date,
    'Injury Risk': h.injury_risk != null ? Number((h.injury_risk / 10).toFixed(1)) : null,
    'ACWR TD': h.acwr_total_distance != null ? Number(Number(h.acwr_total_distance).toFixed(2)) : null,
  }))

  const acwrNrgChartData = history.map(h => ({
    week: h.week_start_date,
    'ACWR NRG': h.acwr_nrg != null ? Number(Number(h.acwr_nrg).toFixed(2)) : null,
    'Fatigue Index': h.fatigue_index != null ? Number(Number(h.fatigue_index).toFixed(2)) : null,
  }))

  const dailyLoadData = (latest?.daily_loads || []).map((load, i) => ({
    day: `Day ${i + 1}`,
    NRG: Number(load) || 0,
  }))

  const nrgTrendData = history.map(h => ({
    week: h.week_start_date,
    'Total NRG': h.total_nrg != null ? Math.round(h.total_nrg) : null,
    'Monotony': h.monotony != null && isFinite(h.monotony) ? Number(Number(h.monotony).toFixed(2)) : null,
  }))

  return (
    <div className="p-6 md:p-10" ref={pageRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '2rem', letterSpacing: '0.5px', color: 'var(--text-primary)' }}>{player.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="pos-badge">{player.position}</span>
            {latest && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Week: {latest.week_start_date}
              </span>
            )}
          </div>
        </div>
        <button onClick={handleExportPDF} className="btn-primary">Export PDF</button>
      </div>

      {!latest ? (
        <div className="py-12 text-center" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>No weekly data available for this player.</div>
      ) : (
        <>
          {/* Section A: Index Hero Cards */}
          <div className="section-label">Performance Indexes</div>
          <div className="flex flex-wrap gap-3 mb-6">
            <IndexCard label="Performance" dbKey="api" value={latest.api} explanation={explanations?.performance} />
            <IndexCard label="RTT" dbKey="rtt" value={latest.rtt} explanation={explanations?.rtt} />
            <IndexCard label="RS" dbKey="rs" value={latest.rs} explanation={explanations?.rs} />
            <IndexCard label="TMI" dbKey="tmi" value={latest.tmi} explanation={explanations?.tmi} />
            <IndexCard label="Injury Risk" dbKey="injury_risk" value={latest.injury_risk} inverted explanation={explanations?.injury_risk} />
          </div>

          {/* ACWR NRG Visualization */}
          <div className="section-label">ACWR & Recovery</div>
          <div className="glass-card p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ACWRZoneBar value={latest.acwr_nrg} label="ACWR NRG (Acute:Chronic Workload Ratio)" />
                <ACWRZoneBar value={latest.acwr_total_distance} label="ACWR Total Distance" />
                <ACWRZoneBar value={latest.acwr_mechanical} label="ACWR Mechanical Load" />

                <div className="flex flex-wrap gap-4 mt-4">
                  {latest.fatigue_index != null && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-none" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(148,163,184,0.12)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Fatigue Index</span>
                      <span style={{
                        fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '0.85rem',
                        color: latest.fatigue_index <= -0.1 ? '#10B981' : latest.fatigue_index <= 5.0 ? '#F59E0B' : '#EF4444'
                      }}>
                        {Number(latest.fatigue_index).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {latest.monotony != null && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-none" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(148,163,184,0.12)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Monotony</span>
                      <span style={{
                        fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '0.85rem',
                        color: latest.monotony <= 1.5 ? '#10B981' : latest.monotony <= 2.0 ? '#F59E0B' : '#EF4444'
                      }}>
                        {isFinite(latest.monotony) ? Number(latest.monotony).toFixed(2) : 'INF'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>ACWR NRG & Fatigue Index — 12 Week Trend</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={acwrNrgChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="week" tick={axisTickStyle} />
                    <YAxis yAxisId="left" domain={[0, 2.5]} tick={axisTickStyle} />
                    <YAxis yAxisId="right" orientation="right" tick={axisTickStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} />
                    <ReferenceLine yAxisId="left" y={0.8} stroke="#3B82F6" strokeDasharray="4 4" strokeOpacity={0.5} />
                    <ReferenceLine yAxisId="left" y={1.3} stroke="#10B981" strokeDasharray="4 4" strokeOpacity={0.5} />
                    <ReferenceLine yAxisId="left" y={1.5} stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.5} />
                    <Line yAxisId="left" type="monotone" dataKey="ACWR NRG" stroke="#E30613" strokeWidth={2.5} dot={{ r: 3, fill: '#E30613' }} />
                    <Line yAxisId="right" type="monotone" dataKey="Fatigue Index" stroke="#a855f7" strokeWidth={2} dot={{ r: 2, fill: '#a855f7' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <ExplanationBox title="ACWR & Recovery Explanation" text={explanations?.rs} />
          </div>

          {/* Section B: Load Achievement Panel */}
          <div className="section-label">Load Achievement</div>
          <div className="glass-card p-5 mb-6">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Weekly Load vs Match Reference
            </div>
            <LoadBar metricKey="total_distance" label="Total Distance" value={latest.total_distance} refValue={resolvedRefs.total_distance} pct={latest.load_pct_total_distance} />
            <LoadBar metricKey="hsr" label="HSR (Zone 4+5)" value={latest.hsr_distance} refValue={resolvedRefs.hsr} pct={latest.load_pct_hsr} />
            <LoadBar metricKey="sprint" label="Sprint (Zone 5)" value={latest.sprint_distance} refValue={resolvedRefs.sprint} pct={latest.load_pct_sprint} />
            <LoadBar metricKey="hmld" label="HMLD" value={latest.hmld} refValue={resolvedRefs.hmld} pct={latest.load_pct_hmld} />
            <LoadBar metricKey="nrg" label="NRG Expenditure" value={latest.total_nrg} refValue={resolvedRefs.nrg} pct={latest.load_pct_nrg} />
            <LoadBar metricKey="acc" label="Accelerations" value={latest.total_accelerations} refValue={resolvedRefs.acc} pct={latest.load_pct_acc} />
            <LoadBar metricKey="dec" label="Decelerations" value={latest.total_decelerations} refValue={resolvedRefs.dec} pct={latest.load_pct_dec} />
          </div>

          {/* Daily Load Distribution */}
          {dailyLoadData.length > 0 && (
            <>
              <div className="section-label">Daily Load</div>
              <div className="glass-card p-5 mb-6">
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Daily NRG Distribution (J/kg)
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyLoadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="day" tick={axisTickStyle} />
                    <YAxis tick={axisTickStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="NRG" radius={[6, 6, 0, 0]}>
                      {dailyLoadData.map((entry, i) => {
                        const max = Math.max(...dailyLoadData.map(d => d.NRG))
                        const ratio = max > 0 ? entry.NRG / max : 0
                        return <Cell key={i} fill={ratio > 0.8 ? 'rgba(227,6,19,0.6)' : ratio > 0.5 ? 'rgba(245,158,11,0.6)' : 'rgba(16,185,129,0.6)'} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <ExplanationBox title="Monotony Explanation" text={explanations?.tmi} />
              </div>
            </>
          )}

          {/* 12-Week Performance Trends */}
          <div className="section-label">Trends</div>
          <div className="glass-card p-5 mb-6">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              12-Week Index Trends
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E30613" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E30613" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rttGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="week" tick={axisTickStyle} />
                <YAxis domain={[0, 10]} tick={axisTickStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} />
                <Area type="monotone" dataKey="Performance" stroke="#E30613" strokeWidth={2.5} fill="url(#perfGrad)" dot={{ r: 3, fill: '#E30613' }} />
                <Area type="monotone" dataKey="RTT" stroke="#3B82F6" strokeWidth={2} fill="url(#rttGrad)" dot={{ r: 2, fill: '#3B82F6' }} />
                <Line type="monotone" dataKey="RS" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="TMI" stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
            <ExplanationBox title="Performance Index Explanation" text={explanations?.performance} />
          </div>

          {/* Injury Risk & ACWR Trend */}
          <div className="glass-card p-5 mb-6">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Injury Risk & ACWR Trend
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="week" tick={axisTickStyle} />
                <YAxis yAxisId="left" domain={[0, 10]} tick={axisTickStyle} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 3]} tick={axisTickStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} />
                <ReferenceLine yAxisId="right" y={1.3} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: '1.3', fill: '#F59E0B', fontSize: 9 }} />
                <ReferenceLine yAxisId="right" y={1.5} stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: '1.5', fill: '#EF4444', fontSize: 9 }} />
                <Line yAxisId="left" type="monotone" dataKey="Injury Risk" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: '#EF4444' }} />
                <Line yAxisId="right" type="monotone" dataKey="ACWR TD" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2, fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
            <ExplanationBox title="Injury Risk Explanation" text={explanations?.injury_risk} />
          </div>

          {/* Weekly NRG & Monotony Trend */}
          <div className="glass-card p-5 mb-6">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Weekly NRG Expenditure & Monotony
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={nrgTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="week" tick={axisTickStyle} />
                <YAxis yAxisId="left" tick={axisTickStyle} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 4]} tick={axisTickStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} />
                <Line yAxisId="left" type="monotone" dataKey="Total NRG" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} />
                <Line yAxisId="right" type="monotone" dataKey="Monotony" stroke="#a855f7" strokeWidth={2} dot={{ r: 2, fill: '#a855f7' }} />
                <ReferenceLine yAxisId="right" y={2.0} stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'Mon 2.0', fill: '#EF4444', fontSize: 9 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <>
              <div className="section-label">Recommendations</div>
              <div className="rec-panel">
                <div className="rec-panel-header">
                  <span className="rec-panel-title">Load Management Recommendations</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Based on KB v1.0</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {recommendations.map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
