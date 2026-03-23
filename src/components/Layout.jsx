import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import NeuralBackground from './NeuralBackground'

const navItems = [
  { to: '/', label: 'Microcycle', icon: '⊞' },
  { to: '/mesocycle', label: 'Mesocycle', icon: '◈' },
  { to: '/upload', label: 'Upload', icon: '↑' },
  { to: '/tools', label: 'Analysis Tools', icon: '◎' },
  { to: '/performance-testing', label: 'Perf. Testing', icon: '⊕' },
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

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function Layout() {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark'
  })
  const location = useLocation()

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

      {/* Desktop Sidebar — compact, logo top-centered, categories below */}
      <aside className="hidden md:flex md:flex-col md:w-44 min-h-screen relative z-10"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--glass-border)',
        }}
      >
        {/* Logo — centered, with top spacing */}
        <div className="flex flex-col items-center pt-8 pb-5 px-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <a href="https://barinsports.com/" target="_blank" rel="noopener noreferrer" className="flex justify-center w-full">
            <img
              src={theme === 'dark' ? darkLogo : lightLogo}
              alt="Barin Sports"
              className="w-28 h-auto hover:opacity-80 transition-opacity"
            />
          </a>
        </div>

        {/* Navigation categories — larger buttons with spacing and hover */}
        <nav className="flex-1 px-2.5 pt-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className="sidebar-nav-btn"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.65rem 0.85rem',
                fontFamily: 'var(--font-main)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                borderRadius: '4px',
                background: isActive ? 'rgba(227, 6, 19, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all 200ms ease',
              })}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content with top header bar */}
      <div className="flex-1 flex flex-col relative z-1 overflow-x-hidden">
        {/* Top Header Bar — theme toggle + logout on the right */}
        <header className="flex items-center justify-end gap-2 px-4 py-2 relative z-20"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--glass-border)',
            minHeight: '44px',
          }}
        >
          <button
            onClick={toggleTheme}
            className="btn-icon"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ padding: '0.4rem' }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={handleLogout}
            className="btn-icon"
            aria-label="Sign out"
            title="Sign out"
            style={{ padding: '0.4rem' }}
          >
            <LogoutIcon />
          </button>
        </header>

        <main className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

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
