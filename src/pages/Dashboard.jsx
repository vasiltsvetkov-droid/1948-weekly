import { useNavigate, Link } from 'react-router-dom'
import { useWeeks, useSquadWeek } from '../hooks/useWeeklyData'
import { useState, useEffect } from 'react'

function fmt(val) {
  if (val == null) return '—'
  return (val / 10).toFixed(1)
}

function injuryColor(val) {
  if (val == null) return ''
  const score = val / 10
  if (score >= 6) return 'rgba(127, 29, 29, 0.4)'
  if (score >= 4) return 'rgba(120, 53, 15, 0.3)'
  return ''
}

function tpiColor(val) {
  if (val == null) return 'var(--text-muted)'
  const score = val / 10
  if (score >= 7) return '#22c55e'
  if (score >= 5) return '#f59e0b'
  return '#ef4444'
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedWeek || ''}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
            }}
          >
            {weeks.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
            {!weeks.length && <option value="">No data</option>}
          </select>
          <Link
            to="/upload"
            className="btn-primary text-sm"
          >
            Upload
          </Link>
        </div>
      </div>

      {/* TPI Card */}
      <div className="glass-card p-6 mb-6">
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>Team Performance Index (avg)</div>
        <div className="text-4xl font-bold" style={{ color: tpiColor(tpi) }}>
          {tpi != null ? (tpi / 10).toFixed(1) : '—'}
          <span className="text-lg" style={{ color: 'var(--text-muted)' }}> / 10</span>
        </div>
      </div>

      {/* Squad Table */}
      {(weeksLoading || squadLoading) ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : squad.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <p className="mb-2">No data for this week.</p>
          <Link to="/upload" style={{ color: 'var(--color-primary)' }} className="underline">Upload CSV data</Link>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide" style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                <th className="text-left p-3">Player</th>
                <th className="text-left p-3">Pos</th>
                <th className="text-right p-3">PI</th>
                <th className="text-right p-3">RTT</th>
                <th className="text-right p-3">RS</th>
                <th className="text-right p-3">TMI</th>
                <th className="text-right p-3">Injury Risk</th>
              </tr>
            </thead>
            <tbody>
              {squad.map(row => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/player/${row.player_id}`)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: injuryColor(row.injury_risk),
                  }}
                  onMouseEnter={e => { if (!injuryColor(row.injury_risk)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = injuryColor(row.injury_risk) }}
                >
                  <td className="p-3 font-medium" style={{ color: 'var(--text-primary)' }}>{row.players?.name || '—'}</td>
                  <td className="p-3" style={{ color: 'var(--text-muted)' }}>{row.players?.position || '—'}</td>
                  <td className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>{fmt(row.api)}</td>
                  <td className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>{fmt(row.rtt)}</td>
                  <td className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>{fmt(row.rs)}</td>
                  <td className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>{fmt(row.tmi)}</td>
                  <td className="text-right p-3 font-semibold" style={{
                    color: row.injury_risk != null && row.injury_risk / 10 > 6 ? '#ef4444'
                      : row.injury_risk != null && row.injury_risk / 10 > 4 ? '#f59e0b'
                      : '#22c55e'
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
