/**
 * Speed Exposure Gauge — shows top_speed / personalMaxSpeed as a percentage
 * with color zones: <80% danger (red), 80-90% caution (yellow), >90% good (green)
 */
export default function GaugeChart({ title, value, maxLabel }) {
  if (value == null) return null

  const pct = Math.min(Math.max(value * 100, 0), 120)
  const displayPct = (value * 100).toFixed(0)

  const zoneColor = pct >= 90 ? '#10B981' : pct >= 80 ? '#F59E0B' : '#EF4444'
  const zoneLabel = pct >= 90 ? 'Adequate' : pct >= 80 ? 'Caution' : 'Deficit'

  return (
    <div className="glass-card p-5 mb-6">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {title || 'Speed Exposure Gauge'}
      </div>
      <div className="flex items-center gap-6">
        {/* Gauge visual */}
        <div style={{ position: 'relative', width: 140, height: 80 }}>
          <svg width="140" height="80" viewBox="0 0 140 80">
            {/* Background arc */}
            <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="12" strokeLinecap="round" />
            {/* Red zone (0-80%) */}
            <path d="M 10 75 A 60 60 0 0 1 58 19" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="12" strokeLinecap="round" />
            {/* Yellow zone (80-90%) */}
            <path d="M 58 19 A 60 60 0 0 1 82 15" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="12" strokeLinecap="round" />
            {/* Green zone (90-100%) */}
            <path d="M 82 15 A 60 60 0 0 1 130 75" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="12" strokeLinecap="round" />
            {/* Needle */}
            {(() => {
              const angle = Math.PI - (Math.min(pct, 110) / 110) * Math.PI
              const nx = 70 + 50 * Math.cos(angle)
              const ny = 75 - 50 * Math.sin(angle)
              return <line x1="70" y1="75" x2={nx} y2={ny} stroke={zoneColor} strokeWidth="3" strokeLinecap="round" />
            })()}
            <circle cx="70" cy="75" r="4" fill={zoneColor} />
          </svg>
        </div>
        {/* Value display */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.8rem', color: zoneColor }}>
            {displayPct}%
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: zoneColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {zoneLabel}
          </div>
          {maxLabel && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {maxLabel}
            </div>
          )}
        </div>
      </div>
      {/* Zone legend */}
      <div className="flex gap-4 mt-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-muted)' }}>
        <span><span style={{ color: '#EF4444' }}>●</span> {'<80% Deficit'}</span>
        <span><span style={{ color: '#F59E0B' }}>●</span> 80–90% Caution</span>
        <span><span style={{ color: '#10B981' }}>●</span> {'>90% Adequate'}</span>
      </div>
    </div>
  )
}
