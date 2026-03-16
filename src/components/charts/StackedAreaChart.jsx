import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'

const tooltipStyle = {
  backgroundColor: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  borderRadius: 2,
  color: 'var(--text-primary)',
  backdropFilter: 'blur(8px)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
}
const axisTickStyle = { fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'DM Mono, monospace' }
const gridStroke = 'rgba(148,163,184,0.08)'

export default function StackedAreaChart({ title, data, dataKeys, colors }) {
  if (!data || !data.length) return null

  const palette = colors || ['#E30613', '#3B82F6', '#10B981', '#a855f7']

  return (
    <div className="glass-card p-5 mb-6">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            {dataKeys.map((dk, i) => (
              <linearGradient key={dk} id={`grad-${dk}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={palette[i % palette.length]} stopOpacity={0.25} />
                <stop offset="95%" stopColor={palette[i % palette.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="week" tick={axisTickStyle} />
          <YAxis tick={axisTickStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} />
          {dataKeys.map((dk, i) => (
            <Area
              key={dk}
              type="monotone"
              dataKey={dk}
              stackId="1"
              stroke={palette[i % palette.length]}
              fill={`url(#grad-${dk})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
