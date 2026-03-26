import { useState } from 'react'
import { classifyConfidence } from '../lib/barin360/confidence'

/**
 * ScoreCard360 — Displays one index score with confidence.
 *
 * Score: 0-100 (50 = baseline, shown on circular gauge)
 * Confidence: 0-100% with color band
 * Click to expand construct breakdown
 */
export default function ScoreCard360({
  label,
  abbrev,
  score,
  confidence,
  color,
  higherIsBetter = true,
  constructs,
  irCoverage,
  irUpperBound,
  fatigueSuppressed,
  onClick,
}) {
  const [expanded, setExpanded] = useState(false)
  const confBand = classifyConfidence(confidence || 0)

  // Score color based on deviation from 50
  const getScoreColor = () => {
    if (score == null) return 'var(--text-muted)'
    const deviation = higherIsBetter ? score - 50 : 50 - score
    if (deviation >= 10) return '#10b981'
    if (deviation >= 0) return 'var(--text-primary)'
    if (deviation >= -10) return '#f59e0b'
    return '#ef4444'
  }

  const scoreDisplay = score != null ? score : '--'
  const confDisplay = confidence != null ? `${confidence}%` : '--%'

  // Gauge: ring showing score position (0-100)
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const progress = ((score || 50) / 100) * circumference
  const baselinePos = 0.5 * circumference // 50/100 mark

  return (
    <div
      className="rounded-xl p-4 transition-all cursor-pointer hover:scale-[1.02]"
      style={{
        background: 'var(--glass-bg)',
        border: `1px solid var(--glass-border)`,
        borderTop: `3px solid ${color}`,
        minWidth: '160px',
      }}
      onClick={() => { setExpanded(!expanded); onClick?.() }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
        {fatigueSuppressed && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.55rem' }}>
            fatigue-suppressed
          </span>
        )}
      </div>

      {/* Score + Gauge */}
      <div className="flex items-center gap-3">
        <div className="relative" style={{ width: '84px', height: '84px' }}>
          <svg viewBox="0 0 88 88" className="w-full h-full">
            {/* Background ring */}
            <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--glass-border)" strokeWidth="5"
              transform="rotate(-90 44 44)" />
            {/* Score arc */}
            <circle cx="44" cy="44" r={radius} fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={circumference} strokeDashoffset={circumference - progress}
              strokeLinecap="round" transform="rotate(-90 44 44)" opacity="0.8" />
            {/* Baseline marker at 50 */}
            <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--text-muted)" strokeWidth="2"
              strokeDasharray={`2 ${circumference - 2}`} strokeDashoffset={circumference - baselinePos}
              transform="rotate(-90 44 44)" opacity="0.5" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: getScoreColor(), lineHeight: 1 }}>
              {scoreDisplay}
            </span>
            <span className="text-xs font-bold" style={{ color, letterSpacing: '0.05em' }}>
              {abbrev}
            </span>
          </div>
        </div>

        <div className="flex-1">
          {/* Confidence */}
          <div className="mb-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: confBand.color }} />
              <span className="text-sm font-semibold" style={{ color: confBand.color }}>
                {confDisplay}
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
              {confBand.label}
            </span>
          </div>

          {/* IR Coverage */}
          {irCoverage && (
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
              {irCoverage}
              {irUpperBound && <span> (could be up to {irUpperBound})</span>}
            </div>
          )}
        </div>
      </div>

      {/* Expanded: Construct Breakdown */}
      {expanded && constructs && (
        <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid var(--glass-border)' }}>
          {Object.entries(constructs).map(([cId, c]) => (
            <div key={cId} className="flex items-center gap-2">
              <span className="text-xs font-mono w-6" style={{ color, fontSize: '0.6rem' }}>{cId}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                    {c.name}
                  </span>
                  <span className="text-xs font-mono" style={{
                    color: c.hasData ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '0.65rem',
                  }}>
                    {c.hasData ? c.score : '50'} <span style={{ color: 'var(--text-muted)' }}>({c.confidencePct}%)</span>
                  </span>
                </div>
                {/* Weight bar */}
                <div className="h-1 rounded-full mt-0.5" style={{ background: 'var(--glass-border)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${(c.weight || 0.2) * 100}%`,
                    background: c.hasData ? color : 'var(--text-muted)',
                    opacity: c.hasData ? 0.6 : 0.2,
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
