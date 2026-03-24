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
      {/* Glow backdrop */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: hovered
          ? 'radial-gradient(circle, rgba(227,6,19,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(227,6,19,0.04) 0%, transparent 70%)',
        transition: 'all 0.6s ease',
        transform: hovered ? 'scale(1.3)' : 'scale(1)',
        pointerEvents: 'none',
      }} />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          textAlign: 'center',
          transition: 'transform 0.3s ease',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
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
          transition: 'letter-spacing 0.3s ease',
          ...(hovered ? { letterSpacing: '12px' } : {}),
        }}>
          BARIN SPORTS
        </div>

        {/* 360 */}
        <div style={{
          fontFamily: 'var(--font-main)',
          fontWeight: 900,
          fontSize: 'clamp(4rem, 12vw, 9rem)',
          lineHeight: 0.9,
          background: hovered
            ? 'linear-gradient(135deg, #E30613 0%, #FF4444 50%, #E30613 100%)'
            : 'linear-gradient(135deg, var(--text-primary) 0%, var(--color-primary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          transition: 'all 0.4s ease',
          filter: hovered ? 'drop-shadow(0 0 30px rgba(227,6,19,0.35))' : 'none',
        }}>
          360
        </div>

        {/* Divider line */}
        <div style={{
          width: hovered ? '120px' : '60px',
          height: '2px',
          background: 'var(--color-primary)',
          margin: '1.2rem auto',
          transition: 'width 0.4s ease',
          boxShadow: hovered ? '0 0 12px rgba(227,6,19,0.5)' : 'none',
        }} />

        {/* Subtitle */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.55rem, 1.2vw, 0.75rem)',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          transition: 'color 0.3s ease',
          ...(hovered ? { color: 'var(--text-secondary)' } : {}),
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
