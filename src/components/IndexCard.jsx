import { useState } from 'react'
import CircularGauge from './CircularGauge'

const interpretations = {
  api: (v) => v >= 7 ? 'Excellent status' : v >= 5 ? 'Moderate status' : 'Needs attention',
  rtt: (v) => v >= 7 ? 'Ready to train' : v >= 5 ? 'Caution advised' : 'Rest recommended',
  rs: (v) => v >= 7 ? 'Well recovered' : v >= 5 ? 'Moderate recovery' : 'Recovery deficit',
  tmi: (v) => v >= 7 ? 'Good load variety' : v >= 5 ? 'Moderate variety' : 'Low variety',
  injury_risk: (v) => v <= 3 ? 'Low risk' : v <= 6 ? 'Moderate risk' : 'High risk',
}

export default function IndexCard({ label, dbKey, value, inverted = false, explanation }) {
  const [showExplanation, setShowExplanation] = useState(false)
  const displayVal = value != null ? (value / 10).toFixed(1) : '—'
  const numVal = value != null ? value / 10 : 0
  const interpret = interpretations[dbKey]

  return (
    <div className="glass-card p-4 flex flex-col items-center min-w-[140px] relative cursor-default">
      <div className="text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.06em' }}>
        {label}
        {explanation && (
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center transition-all"
            style={{
              background: showExplanation ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
              color: showExplanation ? 'white' : 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            title="View explanation"
          >
            ?
          </button>
        )}
      </div>
      <div className="relative flex items-center justify-center mb-2">
        <CircularGauge value={numVal} inverted={inverted} />
        <div className="absolute text-2xl font-bold" style={{
          color: inverted
            ? (numVal >= 6 ? '#ef4444' : numVal >= 3 ? '#f59e0b' : '#22c55e')
            : (numVal >= 8 ? '#22c55e' : numVal >= 6 ? '#3b82f6' : numVal >= 4 ? '#f59e0b' : '#ef4444')
        }}>
          {displayVal}
        </div>
      </div>
      <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        {interpret ? interpret(numVal) : ''}
      </div>
      {showExplanation && explanation && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 min-w-[300px] max-w-[380px]"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '0.875rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex justify-between items-start mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>{label} Explanation</span>
            <button
              onClick={() => setShowExplanation(false)}
              className="text-xs ml-2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              x
            </button>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{explanation}</p>
        </div>
      )}
    </div>
  )
}
