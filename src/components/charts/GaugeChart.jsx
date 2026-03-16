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
      <div className="flex flex-col items-center">
        {/* Gauge visual */}
        <div style={{ position: 'relative', width: 200, height: 110 }}>
          <svg width="200" height="110" viewBox="0 0 200 110">
            {/* Background arc */}
            <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="14" strokeLinecap="round" />
            {/* Red zone (0-80%) */}
            <path d="M 15 100 A 85 85 0 0 1 80 22" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="14" strokeLinecap="round" />
            {/* Yellow zone (80-90%) */}
            <path d="M 80 22 A 85 85 0 0 1 115 16" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="14" strokeLinecap="round" />
            {/* Green zone (90-100%) */}
            <path d="M 115 16 A 85 85 0 0 1 185 100" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="14" strokeLinecap="round" />
            {/* Needle */}
            {(() => {
              const angle = Math.PI - (Math.min(pct, 110) / 110) * Math.PI
              const nx = 100 + 70 * Math.cos(angle)
              const ny = 100 - 70 * Math.sin(angle)
              return <line x1="100" y1="100" x2={nx} y2={ny} stroke={zoneColor} strokeWidth="3" strokeLinecap="round" />
            })()}
            <circle cx="100" cy="100" r="5" fill={zoneColor} />
          </svg>
        </div>
        {/* Value display */}
        <div className="text-center" style={{ marginTop: '-0.25rem' }}>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '2rem', color: zoneColor }}>
            {displayPct}%
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: zoneColor, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {zoneLabel}
          </div>
          {maxLabel && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {maxLabel}
            </div>
          )}
        </div>
      </div>
      {/* Zone legend */}
      <div className="flex justify-center gap-4 mt-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
        <span><span style={{ color: '#EF4444' }}>●</span> {'<80% Deficit'}</span>
        <span><span style={{ color: '#F59E0B' }}>●</span> 80–90% Caution</span>
        <span><span style={{ color: '#10B981' }}>●</span> {'>90% Adequate'}</span>
      </div>
    </div>
  )
}
