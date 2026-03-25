export default function CircularGauge({ value, max = 10, size = 90, color }) {
  const pct = Math.min(value / max, 1)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)
  const cx = size / 2
  const cy = size / 2

  if (!color) {
    if (value >= 7.5) color = '#10B981'
    else if (value >= 5.5) color = '#F59E0B'
    else if (value >= 3.5) color = '#F97316'
    else color = '#EF4444'
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="6"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
      />
    </svg>
  )
}
