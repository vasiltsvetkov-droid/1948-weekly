import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import NeuralBackground from './NeuralBackground'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/upload', label: 'Upload', icon: '↑' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Layout() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen text-white flex flex-col md:flex-row" style={{ background: 'var(--bg-primary)' }}>
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
              src="https://i.imgur.com/LgVMPLV.png"
              alt="Barin Sports"
              className="h-8 w-auto mb-2 hover:opacity-80 transition-opacity"
            />
          </a>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Performance Analytics</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive ? 'text-white font-medium' : ''
                }`
              }
              style={({ isActive }) => ({
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
        <div className="p-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm rounded-lg text-left transition-all duration-200"
            style={{ color: 'var(--text-secondary)' }}
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
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-white' : ''
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
            })}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
