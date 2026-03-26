import { useNavigate, Link } from 'react-router-dom'
import { useWeeks, useSquadWeek } from '../hooks/useWeeklyData'
import { useTeams } from '../hooks/useTeams'
import { useState, useEffect } from 'react'
import { generateWeeklyHTML, downloadHTML, downloadPDF } from '../lib/exportReport'
import { INDEX_DEFS } from '../lib/barin360/constructs'
import { classifyConfidence } from '../lib/barin360/confidence'

// Format score: 0-100 scale, 50 = baseline
function fmtScore(val) {
  if (val == null) return '—'
  return Math.round(val)
}

// Legacy format for backward compat (divides by 10)
function fmtLegacy(val) {
  if (val == null) return '—'
  return (val / 10).toFixed(1)
}

// Score color: deviation from 50 (baseline)
function scoreColor(val, higherIsBetter = true) {
  if (val == null) return 'var(--text-muted)'
  const dev = higherIsBetter ? val - 50 : 50 - val
  if (dev >= 10) return '#10B981'
  if (dev >= 0) return 'var(--text-primary)'
  if (dev >= -10) return '#F59E0B'
  return '#EF4444'
}

// IR color: higher = more risk = worse
function irColor(val) {
  if (val == null) return 'var(--text-muted)'
  // In weekly_aggregates, injury_risk is inverted (100=safest)
  // Convert to 360 IR (100=most risky) for coloring
  const ir360 = 100 - val
  if (ir360 >= 70) return '#EF4444'
  if (ir360 >= 55) return '#F59E0B'
  return '#10B981'
}

function tpiColor(val) {
  if (val == null) return 'var(--text-muted)'
  const score = val / 10
  if (score >= 7) return '#10B981'
  if (score >= 5) return '#F59E0B'
  return '#EF4444'
}

// Small confidence dot
function ConfDot({ confidence }) {
  if (confidence == null) return null
  const band = classifyConfidence(confidence)
  return (
    <span className="inline-block w-1.5 h-1.5 rounded-full ml-1" style={{ background: band.color }}
      title={`${confidence}% confidence — ${band.label}`} />
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { weeks, loading: weeksLoading } = useWeeks()
  const { teams } = useTeams()
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [viewMode, setViewMode] = useState('360') // '360' | 'legacy'
  const { data: squad, loading: squadLoading } = useSquadWeek(selectedWeek, selectedTeamId || null)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (weeks.length && !selectedWeek) setSelectedWeek(weeks[0])
  }, [weeks])

  const teamName = teams.find(t => t.id === selectedTeamId)?.name || ''

  const handleExportHTML = () => {
    const html = generateWeeklyHTML(squad, selectedWeek, teamName)
    downloadHTML(html, `microcycle-report-${selectedWeek}.html`)
    setExportMenuOpen(false)
  }

  const handleExportPDF = async () => {
    setExporting(true)
    const html = generateWeeklyHTML(squad, selectedWeek, teamName)
    await downloadPDF(html, `microcycle-report-${selectedWeek}.pdf`)
    setExporting(false)
    setExportMenuOpen(false)
  }

  const tpi = squad.length
    ? squad.reduce((sum, s) => sum + (s.api || 0), 0) / squad.length
    : null

  return (
    <div className="min-h-screen flex flex-col" style={{ padding: 'clamp(1.5rem, 3vw, 3rem)' }}>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '2.2rem', color: 'var(--text-primary)' }}>Microcycle</h1>
        <div className="flex items-center gap-3">
          {teams.length > 0 && (
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="px-4 py-2"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '2px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
          <select
            value={selectedWeek || ''}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-4 py-2"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '2px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
            }}
          >
            {weeks.map(w => <option key={w} value={w}>{w}</option>)}
            {!weeks.length && <option value="">No data</option>}
          </select>

          {/* View Toggle */}
          <div className="flex rounded" style={{ border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('360')}
              className="px-3 py-1.5 text-xs"
              style={{
                fontFamily: 'var(--font-mono)',
                background: viewMode === '360' ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: viewMode === '360' ? '#10b981' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer',
              }}
            >360</button>
            <button
              onClick={() => setViewMode('legacy')}
              className="px-3 py-1.5 text-xs"
              style={{
                fontFamily: 'var(--font-mono)',
                background: viewMode === 'legacy' ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: viewMode === 'legacy' ? '#a5b4fc' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', borderLeft: '1px solid var(--border-color)',
              }}
            >Legacy</button>
          </div>

          <Link to="/data-hub" className="btn-primary" style={{ fontSize: '0.8rem' }}>Data Hub</Link>
          {squad.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                disabled={exporting}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.5px',
                  padding: '0.5rem 1rem', borderRadius: '2px', cursor: 'pointer',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                {exporting ? 'Exporting...' : 'Export'}
              </button>
              {exportMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 30,
                  background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                  border: '1px solid var(--glass-border)', borderRadius: '4px', overflow: 'hidden', minWidth: 160,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                }}>
                  <button onClick={handleExportHTML} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Export HTML</button>
                  <button onClick={handleExportPDF} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Export PDF</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TPI Card */}
      <div className="glass-card p-8 mb-8">
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem',
        }}>Team Performance Index (avg)</div>
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '3.5rem', lineHeight: 1, color: tpiColor(tpi) }}>
          {tpi != null ? (tpi / 10).toFixed(1) : '—'}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/10</span>
        </div>
      </div>

      {/* Squad Table */}
      {(weeksLoading || squadLoading) ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading...</div>
      ) : squad.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>No data for this week.</p>
          <Link to="/upload" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} className="underline mt-2 inline-block">Upload CSV data</Link>
        </div>
      ) : (
        <div className="glass-card flex-1 overflow-hidden">
          <div className="overflow-x-auto">
            {viewMode === '360' ? (
              /* ─── 360 VIEW: 5 new indexes ─── */
              <table className="w-full" style={{ fontFamily: 'var(--font-data)', fontSize: '1rem', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Player', 'Pos', 'RTT', 'RS', 'IR', 'NMS', 'MS', ''].map((h, i) => (
                      <th key={h || 'arrow'} className={`px-5 py-4 ${i < 2 ? 'text-left' : 'text-right'}`} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '2px',
                        textTransform: 'uppercase', color: i >= 2 && i <= 6
                          ? ['#10b981','#3b82f6','#ef4444','#f59e0b','#8b5cf6'][i-2]
                          : 'var(--text-muted)',
                        fontWeight: 400,
                        ...(i === 7 ? { width: '2rem' } : {}),
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {squad.map(row => {
                    const conf = row.confidence_data || {}
                    return (
                      <tr
                        key={row.id}
                        onClick={() => navigate(`/player/${row.player_id}`)}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td className="px-5 py-4" style={{ fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{row.players?.name || '—'}</td>
                        <td className="px-5 py-4"><span className="pos-badge">{row.players?.position || '—'}</span></td>
                        <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: scoreColor(row.rtt) }}>
                          {fmtScore(row.rtt)}<ConfDot confidence={conf.rtt} />
                        </td>
                        <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: scoreColor(row.rs) }}>
                          {fmtScore(row.rs)}<ConfDot confidence={conf.rs} />
                        </td>
                        <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600, color: irColor(row.injury_risk) }}>
                          {row.injury_risk != null ? fmtScore(100 - row.injury_risk) : '—'}<ConfDot confidence={conf.ir} />
                        </td>
                        <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: scoreColor(row.nms) }}>
                          {row.nms != null ? fmtScore(row.nms) : '—'}<ConfDot confidence={conf.nms} />
                        </td>
                        <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: scoreColor(row.ms) }}>
                          {row.ms != null ? fmtScore(row.ms) : '—'}<ConfDot confidence={conf.ms} />
                        </td>
                        <td className="text-right px-3 py-4" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              /* ─── LEGACY VIEW: original columns ─── */
              <table className="w-full" style={{ fontFamily: 'var(--font-data)', fontSize: '1rem', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Player', 'Pos', 'PI', 'RTT', 'RS', 'TMI', 'Injury Risk', ''].map((h, i) => (
                      <th key={h || 'arrow'} className={`px-5 py-4 ${i < 2 ? 'text-left' : 'text-right'}`} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '2px',
                        textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 400,
                        ...(i === 7 ? { width: '2rem' } : {}),
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {squad.map(row => (
                    <tr
                      key={row.id}
                      onClick={() => navigate(`/player/${row.player_id}`)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td className="px-5 py-4" style={{ fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{row.players?.name || '—'}</td>
                      <td className="px-5 py-4"><span className="pos-badge">{row.players?.position || '—'}</span></td>
                      <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmtLegacy(row.api)}</td>
                      <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmtLegacy(row.rtt)}</td>
                      <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmtLegacy(row.rs)}</td>
                      <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmtLegacy(row.tmi)}</td>
                      <td className="text-right px-5 py-4" style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600,
                        color: row.injury_risk != null && row.injury_risk / 10 >= 7 ? '#10B981'
                          : row.injury_risk != null && row.injury_risk / 10 >= 5 ? '#F59E0B' : '#EF4444'
                      }}>{fmtLegacy(row.injury_risk)}</td>
                      <td className="text-right px-3 py-4" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
