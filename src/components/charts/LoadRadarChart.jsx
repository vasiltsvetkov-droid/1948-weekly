import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
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

const METRICS = [
  { key: 'load_pct_total_distance', label: 'Total Dist' },
  { key: 'load_pct_hsr', label: 'HSR' },
  { key: 'load_pct_sprint', label: 'Sprint' },
  { key: 'load_pct_hmld', label: 'HMLD' },
  { key: 'load_pct_nrg', label: 'NRG' },
  { key: 'load_pct_acc', label: 'Accel' },
  { key: 'load_pct_dec', label: 'Decel' },
]

export default function LoadRadarChart({ title, latest }) {
  if (!latest) return null

  const data = METRICS.map(m => ({
    metric: m.label,
    value: latest[m.key] != null ? Math.round(latest[m.key]) : 0,
    fullMark: 200,
  }))

  return (
    <div className="glass-card p-5 mb-6">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {title || 'Load Achievement Radar'}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(148,163,184,0.15)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'DM Mono, monospace' }} />
          <PolarRadiusAxis angle={90} domain={[0, 200]} tick={{ fontSize: 8, fill: 'var(--text-muted)' }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Load %']} />
          <Radar
            name="Load % of Match Ref"
            dataKey="value"
            stroke="#E30613"
            fill="#E30613"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
        <span>100% = Match Reference Target</span>
      </div>
    </div>
  )
}
