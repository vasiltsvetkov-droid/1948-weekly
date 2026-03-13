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
      className="bg-slate-800 rounded-lg p-4 shadow-sm"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <h4 className="font-semibold text-sm mb-2">{rec.title}</h4>
      <p className="text-sm text-slate-300 leading-relaxed mb-2">{rec.text}</p>
      <p className="text-xs text-slate-500 italic">{rec.ref}</p>
    </div>
  )
}
