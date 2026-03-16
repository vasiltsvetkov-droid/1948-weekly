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

export default function DualAxisChart({ title, data, leftKey, rightKey, leftDomain, rightDomain, referenceLines = [] }) {
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
          <YAxis yAxisId="left" domain={leftDomain || ['auto', 'auto']} tick={axisTickStyle} />
          <YAxis yAxisId="right" orientation="right" domain={rightDomain || ['auto', 'auto']} tick={axisTickStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} />
          {referenceLines.map((rl, i) => (
            <ReferenceLine
              key={i}
              yAxisId={rl.axis || 'left'}
              y={rl.value}
              stroke={rl.color || '#EF4444'}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              label={{ value: String(rl.value), fill: rl.color || '#EF4444', fontSize: 9 }}
            />
          ))}
          <Line yAxisId="left" type="monotone" dataKey={leftKey} stroke="#E30613" strokeWidth={2.5} dot={{ r: 3, fill: '#E30613' }} />
          <Line yAxisId="right" type="monotone" dataKey={rightKey} stroke="#a855f7" strokeWidth={2} dot={{ r: 2, fill: '#a855f7' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
