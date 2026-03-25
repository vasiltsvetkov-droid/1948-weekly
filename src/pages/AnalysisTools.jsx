const tools = [
  {
    tag: 'Biomechanics',
    name: 'F/V Profiles',
    desc: 'Force-velocity profiling.',
    href: 'https://claude.ai/public/artifacts/1d6ec248-76f7-4b31-adc6-d107b7e92fd0',
  },
  {
    tag: 'Anaerobic Capacity',
    name: 'RAST Data',
    desc: 'Running Anaerobic Sprint Test analysis.',
    href: 'https://claude.ai/public/artifacts/2d7011d6-9e30-4b3e-8bf5-376a8bbd9f95',
  },
  {
    tag: 'GPS / Load Monitoring',
    name: 'GPS Data Extractor',
    desc: 'Process and extract GPS session data.',
    href: 'https://claude.ai/public/artifacts/53d92bf8-0849-4f6a-81ba-bd8cf2cf71ac',
  },
  {
    tag: 'Data Pipeline',
    name: 'RAW Data Consolidator',
    desc: 'Merge and consolidate raw VALD export files.',
    href: 'https://claude.ai/public/artifacts/1e459ffb-3696-4182-9082-dbd5be8bbfd3',
  },
  {
    tag: 'Football',
    name: 'Analysis Builder',
    desc: 'Build full performance analysis reports for football athletes.',
    href: 'https://claude.ai/public/artifacts/1ac29839-4414-4f26-9936-a4c9cd36dde9',
  },
  {
    tag: 'Reporting',
    name: 'Reports Builder',
    desc: 'Generate branded athlete performance reports.',
    href: 'https://claude.ai/public/artifacts/05878c06-8282-44f7-8115-d0308d5566a0',
  },
]

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

export default function AnalysisTools() {
  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-primary)',
          border: '1px solid rgba(227, 6, 19, 0.35)',
          padding: '0.35rem 1rem',
          borderRadius: '999px',
          marginBottom: '1rem',
          background: 'rgba(227, 6, 19, 0.06)',
        }}>
          Tools Hub
        </span>
        <h2 style={{
          fontFamily: 'var(--font-main)',
          fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          lineHeight: 1.15,
        }}>
          Performance Analysis Suite
        </h2>
        <p style={{
          marginTop: '0.75rem',
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Select a tool to begin analysis. All tools run in browser — no installation required.
        </p>
      </div>

      {/* Tools Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.25rem',
      }}>
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            className="tool-card-link"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem 1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                marginBottom: '0.4rem',
                display: 'block',
              }}>
                {tool.tag}
              </span>
              <div style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                marginBottom: '0.5rem',
              }}>
                {tool.name}
              </div>
              <div style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
              }}>
                {tool.desc}
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
            }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                letterSpacing: '0.04em',
              }}>
                Open Tool
              </span>
              <span className="tool-card-arrow" style={{
                color: 'var(--text-secondary)',
                display: 'flex',
                transition: 'all 0.25s ease',
              }}>
                <ArrowIcon />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Disclaimer */}
      <p style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        maxWidth: 520,
        lineHeight: 1.6,
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.75rem 1.25rem',
        background: 'rgba(255, 255, 255, 0.02)',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        In order for the tools to work you need to have an <strong style={{ color: 'var(--color-primary)', fontWeight: 600 }}>active Claude account</strong>.
        For optimal results, use <strong style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Barin Sports' Claude Max plan</strong>.
      </p>
    </div>
  )
}
