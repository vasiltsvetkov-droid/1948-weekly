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
  if (score >= 6) return 'bg-red-900/40'
  if (score >= 4) return 'bg-amber-900/30'
  return ''
}

function tpiColor(val) {
  if (val == null) return 'text-slate-400'
  const score = val / 10
  if (score >= 7) return 'text-green-400'
  if (score >= 5) return 'text-amber-400'
  return 'text-red-400'
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedWeek || ''}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
          >
            {weeks.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
            {!weeks.length && <option value="">No data</option>}
          </select>
          <Link
            to="/upload"
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#E8530A' }}
          >
            Upload
          </Link>
        </div>
      </div>

      {/* TPI Card */}
      <div className="bg-slate-800 rounded-xl p-6 mb-6">
        <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Team Performance Index</div>
        <div className={`text-4xl font-bold ${tpiColor(tpi)}`}>
          {tpi != null ? (tpi / 10).toFixed(1) : '—'}
          <span className="text-lg text-slate-400"> / 10</span>
        </div>
      </div>

      {/* Squad Table */}
      {(weeksLoading || squadLoading) ? (
        <div className="text-slate-400 text-center py-12">Loading...</div>
      ) : squad.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="mb-2">No data for this week.</p>
          <Link to="/upload" className="text-[#E8530A] underline">Upload CSV data</Link>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700 text-xs uppercase tracking-wide">
                <th className="text-left p-3">Player</th>
                <th className="text-left p-3">Pos</th>
                <th className="text-right p-3">API</th>
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
                  className={`border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-colors ${injuryColor(row.injury_risk)}`}
                >
                  <td className="p-3 font-medium">{row.players?.name || '—'}</td>
                  <td className="p-3 text-slate-400">{row.players?.position || '—'}</td>
                  <td className="text-right p-3">{fmt(row.api)}</td>
                  <td className="text-right p-3">{fmt(row.rtt)}</td>
                  <td className="text-right p-3">{fmt(row.rs)}</td>
                  <td className="text-right p-3">{fmt(row.tmi)}</td>
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
