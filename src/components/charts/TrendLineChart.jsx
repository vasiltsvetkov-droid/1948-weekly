import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
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

const COLORS = ['#E30613', '#3B82F6', '#10B981', '#a855f7', '#F59E0B']

export default function TrendLineChart({ title, data, dataKeys, referenceLines = [], yDomain }) {
  if (!data || !data.length) return null

  return (
    <div className="glass-card p-5 mb-6">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="week" tick={axisTickStyle} />
          <YAxis domain={yDomain || ['auto', 'auto']} tick={axisTickStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} />
          {referenceLines.map((rl, i) => (
            <ReferenceLine
              key={i}
              y={rl.value}
              stroke={rl.color || '#F59E0B'}
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: String(rl.value), fill: rl.color || '#F59E0B', fontSize: 9 }}
            />
          ))}
          {dataKeys.map((dk, i) => (
            <Line
              key={dk}
              type="monotone"
              dataKey={dk}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 2, fill: COLORS[i % COLORS.length] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
