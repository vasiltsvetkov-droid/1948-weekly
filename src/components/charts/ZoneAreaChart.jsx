import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea,
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

export default function ZoneAreaChart({ title, data, dataKey, yDomain }) {
  if (!data || !data.length) return null

  return (
    <div className="glass-card p-5 mb-6">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="rsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="week" tick={axisTickStyle} />
          <YAxis domain={yDomain || [0, 100]} tick={axisTickStyle} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}/10`, dataKey]} />
          {/* Zone backgrounds */}
          <ReferenceArea y1={0} y2={3} fill="#EF4444" fillOpacity={0.06} />
          <ReferenceArea y1={3} y2={6} fill="#F59E0B" fillOpacity={0.04} />
          <ReferenceArea y1={6} y2={10} fill="#10B981" fillOpacity={0.04} />
          <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#10B981"
            fill="url(#rsGrad)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#10B981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-muted)' }}>
        <span><span style={{ color: '#EF4444' }}>●</span> 0–3 Poor</span>
        <span><span style={{ color: '#F59E0B' }}>●</span> 3–6 Moderate</span>
        <span><span style={{ color: '#10B981' }}>●</span> 6–10 Good</span>
      </div>
    </div>
  )
}
