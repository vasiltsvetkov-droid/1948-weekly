import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 bg-slate-800 border-r border-slate-700 min-h-screen">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold" style={{ color: '#E8530A' }}>Barin Sports PRO</h1>
          <p className="text-xs text-slate-400">Analytics Dashboard</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-left"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex justify-around py-2 z-50">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
                isActive ? 'text-white' : 'text-slate-400'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
