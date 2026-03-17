import { OPTIMAL_LOAD_PCT } from '../constants/matchDefaults'

export default function LoadBar({ metricKey, label, value, refValue, pct }) {
  const optimal = OPTIMAL_LOAD_PCT[metricKey]
  const displayPct = pct != null ? pct.toFixed(0) : '—'

  let barColor = '#10B981'
  if (pct != null && optimal) {
    if (pct >= optimal.min && pct <= optimal.max) {
      barColor = '#10B981' // green — optimal
    } else if (pct < optimal.min) {
      barColor = '#F59E0B' // yellow — underload
    } else {
      barColor = '#EF4444' // red — overload
    }
  }

  const barWidth = pct != null ? Math.min(pct / 4, 100) : 0

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ fontFamily: 'var(--font-data)', color: 'var(--text-primary)', fontWeight: 500 }}>
          {label}
          {optimal && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 400 }}>
              target {optimal.min}–{optimal.max}%
            </span>
          )}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {value != null ? value.toFixed(0) : '—'} / {refValue != null ? refValue.toFixed(0) : '—'} <span style={{ color: barColor, fontWeight: 500 }}>({displayPct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${barWidth}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
