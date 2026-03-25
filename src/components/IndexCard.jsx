import CircularGauge from './CircularGauge'

function scoreColor(v) {
  if (v >= 7.5) return '#10B981'
  if (v >= 5.5) return '#F59E0B'
  if (v >= 3.5) return '#F97316'
  return '#EF4444'
}

const interpretations = {
  api: (v) => v >= 7 ? 'Excellent status' : v >= 5 ? 'Moderate status' : 'Needs attention',
  rtt: (v) => v >= 7 ? 'Ready to train' : v >= 5 ? 'Caution advised' : 'Rest recommended',
  rs: (v) => v >= 7 ? 'Well recovered' : v >= 5 ? 'Moderate recovery' : 'Recovery deficit',
  tmi: (v) => v >= 7 ? 'Good load variety' : v >= 5 ? 'Moderate variety' : 'Low variety',
  injury_risk: (v) => v >= 7 ? 'Low risk' : v >= 5 ? 'Moderate risk' : 'High risk',
}

export default function IndexCard({ label, dbKey, value, inverted = false, explanation, isOpen = false, onToggle }) {
  const showExplanation = isOpen
  const displayVal = value != null ? (value / 10).toFixed(1) : '—'
  const numVal = value != null ? value / 10 : 0
  const interpret = interpretations[dbKey]
  const color = scoreColor(numVal)

  return (
    <div
      className="index-card p-5 min-w-[160px] flex-1 relative cursor-default"
      style={{ '--ic-color': color }}
    >
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        marginBottom: '1rem',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
      }}>
        {label}
        {explanation && (
          <button
            onClick={() => onToggle && onToggle(dbKey)}
            className="transition-all"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: showExplanation ? 'var(--color-primary)' : 'rgba(227,6,19,0.12)',
              color: showExplanation ? 'white' : 'var(--color-primary)',
              border: showExplanation ? '1px solid var(--color-primary)' : '1px solid rgba(227,6,19,0.35)',
              cursor: 'pointer',
              boxShadow: showExplanation ? '0 0 8px rgba(227,6,19,0.4)' : 'none',
            }}
            title="View explanation"
          >
            ?
          </button>
        )}
      </div>
      <div className="relative flex items-center justify-center mb-2">
        <CircularGauge value={numVal} color={color} />
        <div className="absolute" style={{
          fontFamily: 'var(--font-main)',
          fontWeight: 700,
          fontSize: '1.8rem',
          lineHeight: 1,
          color,
        }}>
          {displayVal}
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-main)',
        fontWeight: 600,
        fontSize: '0.95rem',
        color,
        textAlign: 'center',
        marginTop: '0.75rem',
      }}>
        {interpret ? interpret(numVal) : ''}
      </div>
      {showExplanation && explanation && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 min-w-[300px] max-w-[380px]"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '2px',
            padding: '1rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex justify-between items-start mb-1.5">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-primary)' }}>{label} Explanation</span>
            <button
              onClick={() => onToggle && onToggle(null)}
              className="transition-colors"
              style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ✕
            </button>
          </div>
          <p style={{ fontFamily: 'var(--font-data)', fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{explanation}</p>
        </div>
      )}
    </div>
  )
}
