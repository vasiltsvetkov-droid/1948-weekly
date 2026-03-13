const typeColors = {
  alert: '#ef4444',
  caution: '#f59e0b',
  info: '#3b82f6',
  positive: '#22c55e',
}

export default function RecommendationCard({ rec }) {
  const borderColor = typeColors[rec.type] || '#64748b'

  return (
    <div
      className="glass-card p-4"
      style={{ borderLeft: `4px solid ${borderColor}`, borderRadius: '12px' }}
    >
      <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{rec.title}</h4>
      <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{rec.text}</p>
      <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{rec.ref}</p>
    </div>
  )
}
