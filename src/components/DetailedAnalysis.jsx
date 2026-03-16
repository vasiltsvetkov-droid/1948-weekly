import { useState, createContext, useContext } from 'react'

const AccordionContext = createContext({ openId: null, setOpenId: () => {} })

const topicColors = {
  'load-management': '#3B82F6',
  'fatigue-monitoring': '#a855f7',
  'mechanical-load': '#F59E0B',
  'speed-exposure': '#10B981',
  'training-monotony': '#EF4444',
  'injury-risk': '#EF4444',
  'recovery-protocols': '#06B6D4',
  'periodization': '#8B5CF6',
  'match-demands': '#E30613',
  'position-demands': '#F97316',
}

const topicLabels = {
  'load-management': 'Load Management',
  'fatigue-monitoring': 'Fatigue Monitoring',
  'mechanical-load': 'Mechanical Load',
  'speed-exposure': 'Speed Exposure',
  'training-monotony': 'Training Monotony',
  'injury-risk': 'Injury Risk',
  'recovery-protocols': 'Recovery',
  'periodization': 'Periodization',
  'match-demands': 'Match Demands',
  'position-demands': 'Position Demands',
}

function PostulatesList({ postulates, id }) {
  const { openId, setOpenId } = useContext(AccordionContext)
  const postId = `post-${id}`
  const open = openId === postId
  if (!postulates || !postulates.length) return null

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpenId(open ? null : postId)}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          letterSpacing: '1px',
          color: 'var(--color-primary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {open ? '▾' : '▸'} KEY POSTULATES ({postulates.length})
      </button>
      {open && (
        <ul style={{
          margin: '0.5rem 0 0 1rem',
          padding: 0,
          listStyle: 'disc',
          fontFamily: 'var(--font-data)',
          fontSize: '0.85rem',
          lineHeight: '1.65',
          color: 'var(--text-secondary)',
        }}>
          {postulates.slice(0, 8).map((p, i) => (
            <li key={i} style={{ marginBottom: '0.25rem' }}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AnalysisItem({ rec, id }) {
  const { openId, setOpenId } = useContext(AccordionContext)
  const expanded = openId === `analysis-${id}`
  const color = topicColors[rec.topic] || 'var(--text-secondary)'
  const label = topicLabels[rec.topic] || rec.topic

  return (
    <div style={{
      padding: '1rem 1.25rem',
      borderLeft: `3px solid ${color}`,
      background: `${color}08`,
      marginBottom: '0.5rem',
    }}>
      <div className="flex items-center gap-2 mb-1">
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5rem',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color,
          padding: '0.125rem 0.5rem',
          border: `1px solid ${color}40`,
          background: `${color}10`,
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-data)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          {rec.title}
        </span>
      </div>

      {rec.detailedAnalysis && (
        <>
          <button
            onClick={() => setOpenId(expanded ? null : `analysis-${id}`)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '1px',
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.25rem',
            }}
          >
            {expanded ? '▾ HIDE ANALYSIS' : '▸ DETAILED ANALYSIS'}
          </button>
          {expanded && (
            <div style={{
              fontFamily: 'var(--font-data)',
              fontSize: '0.9rem',
              lineHeight: '1.7',
              color: 'var(--text-secondary)',
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(148,163,184,0.08)',
            }}>
              {rec.detailedAnalysis}
            </div>
          )}
        </>
      )}

      <PostulatesList postulates={rec.postulates} id={id} />
    </div>
  )
}

export default function DetailedAnalysis({ recommendations }) {
  const [openId, setOpenId] = useState(null)

  if (!recommendations || !recommendations.length) return null

  // Group by topic
  const grouped = {}
  for (const rec of recommendations) {
    const topic = rec.topic || 'general'
    if (!grouped[topic]) grouped[topic] = []
    grouped[topic].push(rec)
  }

  let globalIdx = 0

  return (
    <AccordionContext.Provider value={{ openId, setOpenId }}>
      <div className="section-label">Detailed Analysis</div>
      <div className="glass-card p-4 mb-6">
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
        }}>
          Knowledge-Grounded Analysis — {recommendations.length} findings across {Object.keys(grouped).length} topics
        </div>
        {Object.entries(grouped).map(([topic, recs]) => (
          <div key={topic} style={{ marginBottom: '0.75rem' }}>
            {recs.map((rec, i) => {
              const id = globalIdx++
              return <AnalysisItem key={`${topic}-${i}`} rec={rec} id={id} />
            })}
          </div>
        ))}
      </div>
    </AccordionContext.Provider>
  )
}
