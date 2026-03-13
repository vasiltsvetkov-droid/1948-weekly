export default function CircularGauge({ value, max = 10, size = 80, inverted = false }) {
  const pct = Math.min(value / max, 1)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)

  let color
  if (inverted) {
    if (value >= 8) color = '#7f1d1d'
    else if (value >= 6) color = '#ef4444'
    else if (value >= 3) color = '#f59e0b'
    else color = '#22c55e'
  } else {
    if (value >= 8) color = '#22c55e'
    else if (value >= 6) color = '#3b82f6'
    else if (value >= 4) color = '#f59e0b'
    else color = '#ef4444'
  }

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#334155"
        strokeWidth="6"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}
