import { OPTIMAL_LOAD_PCT } from '../constants/matchDefaults'

export default function LoadBar({ metricKey, label, value, refValue, pct }) {
  const optimal = OPTIMAL_LOAD_PCT[metricKey]
  const displayPct = pct != null ? pct.toFixed(0) : '—'

  let barColor = '#22c55e' // green
  if (pct != null && optimal) {
    if (pct >= optimal.min && pct <= optimal.max) {
      barColor = '#22c55e'
    } else if (
      (pct >= optimal.min * 0.8 && pct < optimal.min) ||
      (pct > optimal.max && pct <= optimal.max * 1.2)
    ) {
      barColor = '#f59e0b'
    } else {
      barColor = '#ef4444'
    }
  }

  const barWidth = pct != null ? Math.min(pct / 4, 100) : 0

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">
          {value != null ? value.toFixed(0) : '—'} / {refValue != null ? refValue.toFixed(0) : '—'} ({displayPct}%)
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${barWidth}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
