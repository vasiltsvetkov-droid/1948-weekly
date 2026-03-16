import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
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

/**
 * Position Benchmark Comparison — grouped bar showing current metrics vs position-average match demands.
 * data format: [{ metric: 'TD', current: 42000, benchmark: 50000 }, ...]
 */
export default function GroupedBarChart({ title, data }) {
  if (!data || !data.length) return null

  return (
    <div className="glass-card p-5 mb-6">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {title || 'Position Benchmark Comparison'}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barGap={2} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="metric" tick={axisTickStyle} />
          <YAxis tick={axisTickStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} />
          <ReferenceLine y={100} stroke="rgba(148,163,184,0.3)" strokeDasharray="4 4" label={{ value: '100%', fill: 'var(--text-muted)', fontSize: 9 }} />
          <Bar dataKey="current" name="This Week %" fill="#E30613" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
          <Bar dataKey="benchmark" name="Match Ref %" fill="rgba(148,163,184,0.25)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
