import { useNavigate, Link } from 'react-router-dom'
import { useWeeks, useSquadWeek } from '../hooks/useWeeklyData'
import { useTeams } from '../hooks/useTeams'
import { useState, useEffect, useRef } from 'react'
import { generateWeeklyHTML, downloadHTML, downloadPDF } from '../lib/exportReport'

function fmt(val) {
  if (val == null) return '—'
  return (val / 10).toFixed(1)
}

function injuryBg(val) {
  if (val == null) return ''
  const score = val / 10
  if (score >= 6) return 'rgba(239,68,68,0.06)'
  if (score >= 4) return 'rgba(217,119,6,0.06)'
  return ''
}

function tpiColor(val) {
  if (val == null) return 'var(--text-muted)'
  const score = val / 10
  if (score >= 7) return '#10B981'
  if (score >= 5) return '#F59E0B'
  return '#EF4444'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { weeks, loading: weeksLoading } = useWeeks()
  const { teams } = useTeams()
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const { data: squad, loading: squadLoading } = useSquadWeek(selectedWeek, selectedTeamId || null)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (weeks.length && !selectedWeek) setSelectedWeek(weeks[0])
  }, [weeks])

  const teamName = teams.find(t => t.id === selectedTeamId)?.name || ''

  const handleExportHTML = () => {
    const html = generateWeeklyHTML(squad, selectedWeek, teamName)
    downloadHTML(html, `microcycle-report-${selectedWeek}.html`)
    setExportMenuOpen(false)
  }

  const handleExportPDF = async () => {
    setExporting(true)
    const html = generateWeeklyHTML(squad, selectedWeek, teamName)
    await downloadPDF(html, `microcycle-report-${selectedWeek}.pdf`)
    setExporting(false)
    setExportMenuOpen(false)
  }

  const tpi = squad.length
    ? squad.reduce((sum, s) => sum + (s.api || 0), 0) / squad.length
    : null

  return (
    <div className="min-h-screen flex flex-col" style={{ padding: 'clamp(1.5rem, 3vw, 3rem)' }}>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '2.2rem', color: 'var(--text-primary)' }}>Microcycle</h1>
        <div className="flex items-center gap-3">
          {teams.length > 0 && (
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="px-4 py-2"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '2px',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              <option value="">All Teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          <select
            value={selectedWeek || ''}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-4 py-2"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '2px',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
              letterSpacing: '0.5px',
            }}
          >
            {weeks.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
            {!weeks.length && <option value="">No data</option>}
          </select>
          <Link to="/upload" className="btn-primary">Upload</Link>
          {squad.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                disabled={exporting}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.5px',
                  padding: '0.5rem 1rem', borderRadius: '2px', cursor: 'pointer',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)', transition: 'all 0.15s ease',
                }}
              >
                {exporting ? 'Exporting...' : 'Export'}
              </button>
              {exportMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 30,
                  background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid var(--glass-border)', borderRadius: '4px', overflow: 'hidden', minWidth: 160,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                }}>
                  <button onClick={handleExportHTML} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >Export HTML</button>
                  <button onClick={handleExportPDF} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >Export PDF</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TPI Card */}
      <div className="glass-card p-8 mb-8">
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          marginBottom: '0.5rem',
        }}>Team Performance Index (avg)</div>
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '3.5rem', lineHeight: 1, color: tpiColor(tpi) }}>
          {tpi != null ? (tpi / 10).toFixed(1) : '—'}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/10</span>
        </div>
      </div>

      {/* Squad Table */}
      {(weeksLoading || squadLoading) ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '1.5px' }}>Loading...</div>
      ) : squad.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '1.5px' }}>No data for this week.</p>
          <Link to="/upload" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} className="underline mt-2 inline-block">Upload CSV data</Link>
        </div>
      ) : (
        <div className="glass-card flex-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontFamily: 'var(--font-data)', fontSize: '1rem', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Player', 'Pos', 'PI', 'RTT', 'RS', 'TMI', 'Injury Risk', ''].map((h, i) => (
                    <th key={h || 'arrow'} className={`px-5 py-4 ${i < 2 ? 'text-left' : 'text-right'}`} style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      fontWeight: 400,
                      ...(i === 7 ? { width: '2rem' } : {}),
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {squad.map(row => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/player/${row.player_id}`)}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: injuryBg(row.injury_risk),
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = injuryBg(row.injury_risk) || 'rgba(255,255,255,0.01)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = injuryBg(row.injury_risk) }}
                  >
                    <td className="px-5 py-4" style={{ fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{row.players?.name || '—'}</td>
                    <td className="px-5 py-4"><span className="pos-badge">{row.players?.position || '—'}</span></td>
                    <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmt(row.api)}</td>
                    <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmt(row.rtt)}</td>
                    <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmt(row.rs)}</td>
                    <td className="text-right px-5 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{fmt(row.tmi)}</td>
                    <td className="text-right px-5 py-4" style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: row.injury_risk != null && row.injury_risk / 10 > 6 ? '#EF4444'
                        : row.injury_risk != null && row.injury_risk / 10 > 4 ? '#F59E0B'
                        : '#10B981'
                    }}>
                      {fmt(row.injury_risk)}
                    </td>
                    <td className="text-right px-3 py-4" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
