import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Home() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => navigate('/')}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {/* BARIN SPORTS */}
        <div style={{
          fontFamily: 'var(--font-main)',
          fontWeight: 800,
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          lineHeight: 1.1,
        }}>
          BARIN SPORTS
        </div>

        {/* 360 */}
        <div style={{
          fontFamily: 'var(--font-main)',
          fontWeight: 900,
          fontSize: 'clamp(4rem, 12vw, 9rem)',
          lineHeight: 0.95,
          color: hovered ? '#E30613' : 'var(--text-primary)',
          transition: 'color 0.4s ease',
        }}>
          360
        </div>

        {/* Divider line */}
        <div style={{
          width: hovered ? '100px' : '60px',
          height: '2px',
          background: '#E30613',
          margin: '1rem auto',
          transition: 'width 0.4s ease',
        }} />

        {/* Subtitle */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.55rem, 1.2vw, 0.75rem)',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: hovered ? 'var(--text-secondary)' : 'var(--text-muted)',
          transition: 'color 0.3s ease',
        }}>
          PRO Sports Science
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        letterSpacing: '0.5px',
        color: 'var(--text-muted)',
      }}>
        &copy; 2026 Barin Sports PRO Sports Science. All Rights Reserved.
      </div>
    </div>
  )
}
