import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useWeeks } from '../hooks/useWeeklyData'
import { useTeams } from '../hooks/useTeams'
import { useSquadMesocycle } from '../hooks/useMesocycle'

function fmt(val) {
  if (val == null) return '—'
  return (val / 10).toFixed(1)
}

function injuryBg(val) {
  if (val == null) return ''
  const score = val / 10
  if (score >= 6) return 'rgba(239,68,68,0.06)'
  if (score >= 4) return 'rgba(217,119,6,0.06)'
  return ''
}

function tpiColor(val) {
  if (val == null) return 'var(--text-muted)'
  const score = val / 10
  if (score >= 7) return '#10B981'
  if (score >= 5) return '#F59E0B'
  return '#EF4444'
}

function trendArrow(trend) {
  if (trend === 'increasing') return { symbol: '↑', color: '#10B981' }
  if (trend === 'decreasing') return { symbol: '↓', color: '#EF4444' }
  return { symbol: '→', color: 'var(--text-muted)' }
}

export default function Mesocycle() {
  const navigate = useNavigate()
  const { weeks, loading: weeksLoading } = useWeeks()
  const { teams } = useTeams()
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(0)

  // Build 4-week period options from available weeks
  const periods = []
  const sortedWeeks = [...weeks].sort((a, b) => a.localeCompare(b))
  for (let i = 0; i + 3 < sortedWeeks.length; i += 4) {
    periods.push({
      label: `${sortedWeeks[i]} — ${sortedWeeks[i + 3]}`,
      weeks: sortedWeeks.slice(i, i + 4),
    })
  }
  periods.reverse() // newest first

  const currentPeriod = periods[selectedPeriodIdx] || null
  const { data: squad, loading: squadLoading } = useSquadMesocycle(
    currentPeriod?.weeks || null,
    selectedTeamId || null,
  )

  const tpi = squad.length
    ? squad.reduce((sum, s) => sum + (s.api || 0), 0) / squad.length
    : null

  return (
    <div className="min-h-screen flex flex-col" style={{ padding: 'clamp(1.5rem, 3vw, 3rem)' }}>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '2.2rem', color: 'var(--text-primary)' }}>Mesocycle</h1>
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
            value={selectedPeriodIdx}
            onChange={(e) => setSelectedPeriodIdx(Number(e.target.value))}
            className="px-4 py-2"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '2px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
            }}
          >
            {periods.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
            {!periods.length && <option value="">Not enough data (need 4+ weeks)</option>}
          </select>
        </div>
      </div>

      {/* TPI Card */}
      <div className="glass-card p-8 mb-8">
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem',
        }}>Mesocycle Team Performance Index (avg)</div>
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '3.5rem', lineHeight: 1, color: tpiColor(tpi) }}>
          {tpi != null ? (tpi / 10).toFixed(1) : '—'}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/10</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem', letterSpacing: '0.5px' }}>
          Averaged across 4 microcycles
        </div>
      </div>

      {/* Squad Table */}
      {(weeksLoading || squadLoading) ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '1.5px' }}>Loading...</div>
      ) : !periods.length ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '1.5px' }}>Need at least 4 weeks of data for mesocycle analysis.</p>
        </div>
      ) : squad.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '1.5px' }}>No data for this period.</p>
        </div>
      ) : (
        <>
          <div className="glass-card flex-1 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ fontFamily: 'var(--font-data)', fontSize: '1rem', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Player', 'Pos', 'PI', 'RTT', 'RS', 'TMI', 'Injury Risk', 'Trend', ''].map((h, i) => (
                      <th key={h || 'arrow'} className={`px-5 py-4 ${i < 2 ? 'text-left' : 'text-right'}`} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '2px',
                        textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 400,
                        ...(i === 8 ? { width: '2rem' } : {}),
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {squad.map(row => {
                    const perfTrend = row.summary?.trends?.performance
                    const { symbol, color } = trendArrow(perfTrend)
                    return (
                      <tr
                        key={row.player_id}
                        onClick={() => navigate(`/player/${row.player_id}`)}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: injuryBg(row.injury_risk) }}
                        onMouseEnter={e => { e.currentTarget.style.background = injuryBg(row.injury_risk) || 'rgba(255,255,255,0.01)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = injuryBg(row.injury_risk) }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {row.player?.photo_url ? (
                              <img src={row.player.photo_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : null}
                            <span style={{ fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{row.player?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className="pos-badge">{row.player?.position || '—'}</span></td>
                        <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmt(row.api)}</td>
                        <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmt(row.rtt)}</td>
                        <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmt(row.rs)}</td>
                        <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmt(row.tmi)}</td>
                        <td className="text-right px-5 py-4" style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600,
                          color: row.injury_risk != null && row.injury_risk / 10 > 6 ? '#EF4444'
                            : row.injury_risk != null && row.injury_risk / 10 > 4 ? '#F59E0B' : '#10B981'
                        }}>{fmt(row.injury_risk)}</td>
                        <td className="text-right px-5 py-4" style={{ color, fontSize: '1.1rem' }}>{symbol}</td>
                        <td className="text-right px-3 py-4" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mesocycle Summary Cards */}
          <div className="section-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Player Mesocycle Summaries</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {squad.filter(s => s.summary).map(row => (
              <div key={row.player_id} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  {row.player?.photo_url ? (
                    <img src={row.player.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {row.player?.name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: 'var(--font-main)', fontWeight: 600, color: 'var(--text-primary)' }}>{row.player?.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="pos-badge" style={{ fontSize: '0.6rem' }}>{row.player?.position}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.5px',
                        color: row.summary.overallAssessment === 'Good' ? '#10B981' : row.summary.overallAssessment === 'Moderate' ? '#F59E0B' : '#EF4444',
                      }}>{row.summary.overallAssessment}</span>
                    </div>
                  </div>
                </div>

                {/* Microcycle overview mini-table */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Microcycle Overview</div>
                  <div className="grid grid-cols-4 gap-1" style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                    {(row.summary.weekOverviews || []).map((w, i) => (
                      <div key={i} style={{ padding: '0.35rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.55rem' }}>Wk {w.week}</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{w.pi}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Positives */}
                {row.summary.positives?.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#10B981', marginBottom: '0.3rem' }}>Positives</div>
                    {row.summary.positives.map((p, i) => (
                      <div key={i} style={{ fontFamily: 'var(--font-data)', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.2rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(16,185,129,0.3)' }}>{p}</div>
                    ))}
                  </div>
                )}

                {/* Concerns */}
                {row.summary.concerns?.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#EF4444', marginBottom: '0.3rem' }}>Concerns</div>
                    {row.summary.concerns.map((c, i) => (
                      <div key={i} style={{ fontFamily: 'var(--font-data)', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.2rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(239,68,68,0.3)' }}>{c}</div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {row.summary.recommendations?.length > 0 && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#3B82F6', marginBottom: '0.3rem' }}>Recommendations</div>
                    {row.summary.recommendations.map((r, i) => (
                      <div key={i} style={{ fontFamily: 'var(--font-data)', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.2rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(59,130,246,0.3)' }}>{r}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
