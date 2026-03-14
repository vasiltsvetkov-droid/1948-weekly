const typeColors = {
  alert:    { dot: '#EF4444', bg: 'rgba(239,68,68,.06)',   border: 'rgba(239,68,68,.15)' },
  caution:  { dot: '#D97706', bg: 'rgba(217,119,6,.06)',   border: 'rgba(217,119,6,.15)' },
  info:     { dot: '#3B82F6', bg: 'rgba(59,130,246,.06)',  border: 'rgba(59,130,246,.12)' },
  positive: { dot: '#10B981', bg: 'rgba(16,185,129,.06)',  border: 'rgba(16,185,129,.12)' },
}

export default function RecommendationCard({ rec }) {
  const colors = typeColors[rec.type] || typeColors.info

  return (
    <div
      className="rec-item"
      style={{
        background: colors.bg,
        borderLeft: `3px solid ${colors.dot}`,
        borderRadius: '8px',
        padding: '0.875rem 1.25rem',
      }}
    >
      <div className="rec-dot" style={{ background: colors.dot }} />
      <div style={{ flex: 1 }}>
        <div className="rec-title" style={{ color: colors.dot }}>{rec.title}</div>
        <div className="rec-text">{rec.text}</div>
        <span className="rec-ref">Ref: {rec.ref}</span>
      </div>
    </div>
  )
}
