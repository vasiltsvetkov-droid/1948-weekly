import { useParams, Link } from 'react-router-dom'
import { usePlayer } from '../hooks/usePlayer'
import { useHistory } from '../hooks/useHistory'

function fmt(val, decimals = 0) {
  if (val == null) return '—'
  return Number(val).toFixed(decimals)
}

function fmtIdx(val) {
  if (val == null) return '—'
  return (val / 10).toFixed(1)
}

function trendArrow(history, key) {
  const recent = history.slice(-4).map(h => h[key]).filter(v => v != null)
  if (recent.length < 2) return '→'
  const first = recent[0]
  const last = recent[recent.length - 1]
  const diff = last - first
  const threshold = Math.abs(first) * 0.05
  if (diff > threshold) return '↑'
  if (diff < -threshold) return '↓'
  return '→'
}

export default function History() {
  const { id } = useParams()
  const { player, loading: playerLoading } = usePlayer(id)
  const { history, loading: historyLoading } = useHistory(id, 12)

  const handleExportCSV = () => {
    if (!history.length) return
    const headers = ['Week', 'TD', 'HSR', 'Sprint', 'HMLD', 'Mech Load', 'API', 'RTT', 'RS', 'TMI', 'Injury Risk']
    const rows = history.map(h => [
      h.week_start_date,
      fmt(h.total_distance),
      fmt(h.hsr_distance),
      fmt(h.sprint_distance),
      fmt(h.hmld),
      fmt(h.mechanical_load),
      fmtIdx(h.api),
      fmtIdx(h.rtt),
      fmtIdx(h.rs),
      fmtIdx(h.tmi),
      fmtIdx(h.injury_risk),
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${player?.name || 'player'}-history.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (playerLoading || historyLoading) {
    return <div className="p-8 text-slate-400">Loading...</div>
  }

  if (!player) {
    return <div className="p-8 text-slate-400">Player not found.</div>
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{player.name}</h1>
          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
            {player.position}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/player/${id}`}
            className="px-4 py-2 rounded-lg bg-slate-700 text-sm text-slate-300 hover:text-white"
          >
            Back to Report
          </Link>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#E8530A' }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-slate-400 py-12 text-center">No history data available.</div>
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700 text-xs uppercase tracking-wide">
                <th className="text-left p-3">Week</th>
                <th className="text-right p-3">TD</th>
                <th className="text-right p-3">HSR</th>
                <th className="text-right p-3">Sprint</th>
                <th className="text-right p-3">HMLD</th>
                <th className="text-right p-3">Mech Load</th>
                <th className="text-right p-3">API</th>
                <th className="text-right p-3">RTT</th>
                <th className="text-right p-3">RS</th>
                <th className="text-right p-3">TMI</th>
                <th className="text-right p-3">Injury Risk</th>
                <th className="text-right p-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-3">{h.week_start_date}</td>
                  <td className="text-right p-3">{fmt(h.total_distance)}</td>
                  <td className="text-right p-3">{fmt(h.hsr_distance)}</td>
                  <td className="text-right p-3">{fmt(h.sprint_distance)}</td>
                  <td className="text-right p-3">{fmt(h.hmld)}</td>
                  <td className="text-right p-3">{fmt(h.mechanical_load)}</td>
                  <td className="text-right p-3">{fmtIdx(h.api)}</td>
                  <td className="text-right p-3">{fmtIdx(h.rtt)}</td>
                  <td className="text-right p-3">{fmtIdx(h.rs)}</td>
                  <td className="text-right p-3">{fmtIdx(h.tmi)}</td>
                  <td className="text-right p-3">{fmtIdx(h.injury_risk)}</td>
                  <td className="text-right p-3 text-slate-400">
                    {trendArrow(history.slice(0, i + 1), 'api')}
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
