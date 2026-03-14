import { NavLink, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import NeuralBackground from './NeuralBackground'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/upload', label: 'Upload', icon: '↑' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

export default function Layout() {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark'
  })

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const darkLogo = 'https://i.imgur.com/LgVMPLV.png'
  const lightLogo = 'https://i.imgur.com/7piXXXA.png'

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 300ms, color 300ms' }}>
      <NeuralBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 min-h-screen relative z-10"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--glass-border)',
        }}
      >
        <div className="p-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <a href="https://barinsports.com/" target="_blank" rel="noopener noreferrer">
            <img
              src={theme === 'dark' ? darkLogo : lightLogo}
              alt="Barin Sports"
              className="h-8 w-auto mb-2 hover:opacity-80 transition-opacity"
            />
          </a>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Performance Analytics
          </p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive ? 'font-medium' : ''
                }`
              }
              style={({ isActive }) => ({
                fontFamily: 'var(--font-main)',
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'rgba(227, 6, 19, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-2 flex items-center gap-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <button
            onClick={toggleTheme}
            className="btn-icon"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-3 py-2 text-sm text-left transition-all duration-200"
            style={{ fontFamily: 'var(--font-main)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0 relative z-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around py-2 z-50"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors"
            style={({ isActive }) => ({
              fontFamily: 'var(--font-main)',
              color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
            })}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-main)' }}
        >
          <span className="text-lg">{theme === 'dark' ? '☀' : '☾'}</span>
          <span>Theme</span>
        </button>
      </nav>
    </div>
  )
}
