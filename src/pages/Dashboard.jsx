import { useNavigate, Link } from 'react-router-dom'
import { useWeeks, useSquadWeek } from '../hooks/useWeeklyData'
import { useState, useEffect } from 'react'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const { weeks, loading: weeksLoading } = useWeeks()
  const [selectedWeek, setSelectedWeek] = useState(null)
  const { data: squad, loading: squadLoading } = useSquadWeek(selectedWeek)

  useEffect(() => {
    if (weeks.length && !selectedWeek) setSelectedWeek(weeks[0])
  }, [weeks])

  const tpi = squad.length
    ? squad.reduce((sum, s) => sum + (s.api || 0), 0) / squad.length
    : null

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.9rem', color: 'var(--text-primary)' }}>Dashboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedWeek || ''}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-2 rounded-lg"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
              letterSpacing: '0.5px',
            }}
          >
            {weeks.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
            {!weeks.length && <option value="">No data</option>}
          </select>
          <Link to="/upload" className="btn-primary">Upload</Link>
        </div>
      </div>

      {/* TPI Card */}
      <div className="glass-card p-6 mb-6">
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          marginBottom: '0.5rem',
        }}>Team Performance Index (avg)</div>
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '3rem', lineHeight: 1, color: tpiColor(tpi) }}>
          {tpi != null ? (tpi / 10).toFixed(1) : '—'}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/10</span>
        </div>
      </div>

      {/* Squad Table */}
      {(weeksLoading || squadLoading) ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '1.5px' }}>Loading...</div>
      ) : squad.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '0.75rem' }}>📊</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '1.5px' }}>No data for this week.</p>
          <Link to="/upload" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }} className="underline mt-2 inline-block">Upload CSV data</Link>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full" style={{ fontFamily: 'var(--font-data)', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Player', 'Pos', 'PI', 'RTT', 'RS', 'TMI', 'Injury Risk'].map((h, i) => (
                  <th key={h} className={`p-3 ${i < 2 ? 'text-left' : 'text-right'}`} style={{
                    fontFamily: 'var(--font-mono)',
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
              {squad.map(row => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/player/${row.player_id}`)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    background: injuryBg(row.injury_risk),
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = injuryBg(row.injury_risk) || 'rgba(255,255,255,0.01)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = injuryBg(row.injury_risk) }}
                >
                  <td className="p-3" style={{ fontFamily: 'var(--font-main)', fontWeight: 600, color: 'var(--text-primary)' }}>{row.players?.name || '—'}</td>
                  <td className="p-3"><span className="pos-badge">{row.players?.position || '—'}</span></td>
                  <td className="text-right p-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{fmt(row.api)}</td>
                  <td className="text-right p-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{fmt(row.rtt)}</td>
                  <td className="text-right p-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{fmt(row.rs)}</td>
                  <td className="text-right p-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{fmt(row.tmi)}</td>
                  <td className="text-right p-3" style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: row.injury_risk != null && row.injury_risk / 10 > 6 ? '#EF4444'
                      : row.injury_risk != null && row.injury_risk / 10 > 4 ? '#F59E0B'
                      : '#10B981'
                  }}>
                    {fmt(row.injury_risk)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
