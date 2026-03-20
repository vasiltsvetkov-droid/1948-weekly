import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { usePlayers } from '../hooks/usePlayer'
import { useTeams } from '../hooks/useTeams'
import { MATCH_DEFAULTS, METRIC_LABELS, METRIC_UNITS } from '../constants/matchDefaults'

const POSITIONS = ['CB', 'FB', 'CM', 'WM', 'ST', 'GK']
const METRIC_KEYS = ['total_distance', 'hsr', 'sprint', 'hmld', 'nrg', 'acc', 'dec']

export default function Settings() {
  const [tab, setTab] = useState('squad')
  const { players, loading, refetch } = usePlayers()
  const { teams, refetch: refetchTeams, tableReady: teamsTableReady } = useTeams()
  const [newName, setNewName] = useState('')
  const [newPosition, setNewPosition] = useState('CM')
  const [newTeamId, setNewTeamId] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPosition, setEditPosition] = useState('CM')
  const [editTeamId, setEditTeamId] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('')
  const [deletingAll, setDeletingAll] = useState(false)

  // Teams state
  const [newTeamName, setNewTeamName] = useState('')
  const [editingTeamId, setEditingTeamId] = useState(null)
  const [editTeamName, setEditTeamName] = useState('')
  const [deleteTeamConfirm, setDeleteTeamConfirm] = useState(null)

  // Match References state
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)
  const [refValues, setRefValues] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (players.length && !selectedPlayerId) {
      setSelectedPlayerId(players[0].id)
    }
  }, [players])

  useEffect(() => {
    if (!selectedPlayerId) return
    supabase
      .from('match_references')
      .select('*')
      .eq('player_id', selectedPlayerId)
      .then(({ data }) => {
        const vals = {}
        for (const r of (data || [])) {
          vals[r.metric_key] = r.value_per90
        }
        setRefValues(vals)
      })
  }, [selectedPlayerId])

  const handleAddPlayer = async () => {
    if (!newName.trim()) return
    const row = { name: newName.trim(), position: newPosition }
    if (newTeamId) row.team_id = newTeamId
    await supabase.from('players').insert(row)
    setNewName('')
    refetch()
  }

  const handleEditSave = async () => {
    await supabase.from('players').update({ name: editName, position: editPosition, team_id: editTeamId || null }).eq('id', editingId)
    setEditingId(null)
    refetch()
  }

  const [teamError, setTeamError] = useState(null)

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return
    setTeamError(null)
    const { error } = await supabase.from('teams').insert({ name: newTeamName.trim() })
    if (error) {
      setTeamError('Failed to create team. Make sure the teams table exists in your database. Run the migration SQL from supabase/schema.sql.')
      return
    }
    setNewTeamName('')
    refetchTeams()
  }

  const handleEditTeamSave = async () => {
    await supabase.from('teams').update({ name: editTeamName }).eq('id', editingTeamId)
    setEditingTeamId(null)
    refetchTeams()
  }

  const handleDeleteTeam = async (id) => {
    await supabase.from('teams').delete().eq('id', id)
    setDeleteTeamConfirm(null)
    refetchTeams()
    refetch()
  }

  const handleDelete = async (id) => {
    await supabase.from('players').delete().eq('id', id)
    setDeleteConfirm(null)
    refetch()
  }

  const handleDeleteAllData = async () => {
    if (deleteAllConfirmText !== 'DELETE ALL') return
    setDeletingAll(true)
    try {
      // Delete in dependency order: aggregates, sessions, snapshots, references, players, then teams
      await supabase.from('weekly_aggregates').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('weekly_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('team_snapshots').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('match_references').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      refetch()
      refetchTeams()
    } catch (err) {
      console.error('Error deleting all data:', err)
    }
    setDeletingAll(false)
    setShowDeleteAllModal(false)
    setDeleteAllConfirmText('')
  }

  const handleLoadDefaults = () => {
    const player = players.find(p => p.id === selectedPlayerId)
    if (!player) return
    const defaults = MATCH_DEFAULTS[player.position] || MATCH_DEFAULTS['CM']
    setRefValues({ ...defaults })
  }

  const handleSaveRefs = async () => {
    setSaving(true)
    for (const key of METRIC_KEYS) {
      if (refValues[key] != null) {
        await supabase
          .from('match_references')
          .upsert(
            { player_id: selectedPlayerId, metric_key: key, value_per90: refValues[key] },
            { onConflict: 'player_id,metric_key' }
          )
      }
    }
    setSaving(false)
  }

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
    borderRadius: '2px',
  }

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--glass-border)',
    borderRadius: '2px',
  }

  return (
    <div style={{ padding: 'clamp(1.5rem, 3vw, 3rem)' }}>
      <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Settings</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 w-fit">
        {['squad', 'teams', 'refs'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              fontFamily: 'var(--font-main)',
              borderRadius: '2px',
              background: tab === t ? 'var(--color-primary)' : 'var(--bg-card)',
              color: tab === t ? '#FFFFFF' : 'var(--text-secondary)',
              border: tab === t ? '1px solid var(--color-primary)' : '1px solid var(--glass-border)',
            }}
          >
            {t === 'squad' ? 'Squad' : t === 'teams' ? 'Teams' : 'Match References'}
          </button>
        ))}
      </div>

      {tab === 'squad' && (
        <div>
          {/* Add Player */}
          <div className="p-4 mb-4 flex gap-2 items-end flex-wrap" style={{ ...cardStyle }}>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1px' }}>Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-sm"
                style={inputStyle}
                placeholder="Player name"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1px' }}>Position</label>
              <select
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className="px-3 py-2 text-sm"
                style={inputStyle}
              >
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1px' }}>Team</label>
              <select
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value)}
                className="px-3 py-2 text-sm"
                style={inputStyle}
              >
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <button
              onClick={handleAddPlayer}
              className="btn-primary"
            >
              Add Player
            </button>
          </div>

          {/* Player Table */}
          <div className="overflow-hidden" style={{ ...cardStyle }}>
            <table className="w-full text-sm" style={{ fontFamily: 'var(--font-data)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th className="text-left p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Name</th>
                  <th className="text-left p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Position</th>
                  <th className="text-left p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Team</th>
                  <th className="text-right p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    {editingId === p.id ? (
                      <>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 text-sm w-full"
                            style={inputStyle}
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={editPosition}
                            onChange={(e) => setEditPosition(e.target.value)}
                            className="px-2 py-1 text-sm"
                            style={inputStyle}
                          >
                            {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={editTeamId}
                            onChange={(e) => setEditTeamId(e.target.value)}
                            className="px-2 py-1 text-sm"
                            style={inputStyle}
                          >
                            <option value="">No team</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={handleEditSave} style={{ color: 'var(--color-success)', fontSize: '0.75rem' }}>Save</button>
                          <button onClick={() => setEditingId(null)} style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                        <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{p.position}</td>
                        <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{p.teams?.name || '—'}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => { setEditingId(p.id); setEditName(p.name); setEditPosition(p.position); setEditTeamId(p.team_id || '') }}
                            style={{ color: 'var(--color-info)', fontSize: '0.75rem' }}
                          >
                            Edit
                          </button>
                          {deleteConfirm === p.id ? (
                            <>
                              <button onClick={() => handleDelete(p.id)} style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>Confirm</button>
                              <button onClick={() => setDeleteConfirm(null)} style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => setDeleteConfirm(p.id)} style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>Delete</button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete All Data */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="px-4 py-2 text-sm font-medium transition-all"
              style={{
                fontFamily: 'var(--font-main)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--color-danger)',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
            >
              Delete All Player Data
            </button>
          </div>
        </div>
      )}

      {tab === 'teams' && (
        <div>
          {!teamsTableReady && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: '4px',
              fontFamily: 'var(--font-data)',
              fontSize: '0.8rem',
              color: 'rgba(251,191,36,0.9)',
              lineHeight: 1.6,
            }}>
              The <strong>teams</strong> table does not exist yet. Run the migration SQL in your Supabase SQL editor:
              <pre style={{ marginTop: '0.5rem', fontSize: '0.7rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '2px', overflowX: 'auto' }}>
{`CREATE TABLE IF NOT EXISTS teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all" ON teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE players ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;`}
              </pre>
            </div>
          )}

          {teamError && (
            <div style={{
              padding: '0.625rem 1rem',
              marginBottom: '1rem',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#EF4444',
            }}>{teamError}</div>
          )}

          {/* Create Team */}
          <div className="p-4 mb-4 flex gap-2 items-end flex-wrap" style={{ ...cardStyle }}>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1px' }}>Team Name</label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full px-3 py-2 text-sm"
                style={inputStyle}
                placeholder="Team name"
              />
            </div>
            <button
              onClick={handleAddTeam}
              className="btn-primary"
            >
              Create Team
            </button>
          </div>

          {/* Teams Table */}
          <div className="overflow-hidden" style={{ ...cardStyle }}>
            <table className="w-full text-sm" style={{ fontFamily: 'var(--font-data)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th className="text-left p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Name</th>
                  <th className="text-left p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Players</th>
                  <th className="text-right p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(t => {
                  const teamPlayers = players.filter(p => p.team_id === t.id)
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      {editingTeamId === t.id ? (
                        <>
                          <td className="p-3">
                            <input
                              type="text"
                              value={editTeamName}
                              onChange={(e) => setEditTeamName(e.target.value)}
                              className="px-2 py-1 text-sm w-full"
                              style={inputStyle}
                            />
                          </td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{teamPlayers.length}</td>
                          <td className="p-3 text-right space-x-2">
                            <button onClick={handleEditTeamSave} style={{ color: 'var(--color-success)', fontSize: '0.75rem' }}>Save</button>
                            <button onClick={() => setEditingTeamId(null)} style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3" style={{ color: 'var(--text-primary)' }}>{t.name}</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{teamPlayers.length}</td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => { setEditingTeamId(t.id); setEditTeamName(t.name) }}
                              style={{ color: 'var(--color-info)', fontSize: '0.75rem' }}
                            >
                              Edit
                            </button>
                            {deleteTeamConfirm === t.id ? (
                              <>
                                <button onClick={() => handleDeleteTeam(t.id)} style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>Confirm</button>
                                <button onClick={() => setDeleteTeamConfirm(null)} style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Cancel</button>
                              </>
                            ) : (
                              <button onClick={() => setDeleteTeamConfirm(t.id)} style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>Delete</button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
                {teams.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      No teams created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'refs' && (
        <div>
          <div className="flex gap-2 items-end mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1px' }}>Player</label>
              <select
                value={selectedPlayerId || ''}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full px-3 py-2 text-sm"
                style={inputStyle}
              >
                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
              </select>
            </div>
            <button
              onClick={handleLoadDefaults}
              className="px-3 py-2 text-sm transition-colors"
              style={{
                ...cardStyle,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-main)',
                cursor: 'pointer',
              }}
            >
              Load Position Defaults
            </button>
          </div>

          <div className="overflow-hidden" style={{ ...cardStyle }}>
            <table className="w-full text-sm" style={{ fontFamily: 'var(--font-data)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th className="text-left p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Metric</th>
                  <th className="text-right p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Per-90 Value</th>
                  <th className="text-right p-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Per-minute</th>
                </tr>
              </thead>
              <tbody>
                {METRIC_KEYS.map(key => (
                  <tr key={key} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td className="p-3" style={{ color: 'var(--text-primary)' }}>{METRIC_LABELS[key]}</td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        value={refValues[key] ?? ''}
                        onChange={(e) => setRefValues({ ...refValues, [key]: e.target.value ? Number(e.target.value) : null })}
                        className="w-24 px-2 py-1 text-sm text-right"
                        style={inputStyle}
                      />
                    </td>
                    <td className="p-3 text-right" style={{ color: 'var(--text-muted)' }}>
                      {refValues[key] ? (refValues[key] / 90).toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSaveRefs}
            disabled={saving}
            className="btn-primary mt-4 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Match References'}
          </button>
        </div>
      )}

      {/* Delete All Data Modal */}
      {showDeleteAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowDeleteAllModal(false); setDeleteAllConfirmText('') } }}
        >
          <div className="w-full max-w-md mx-4 p-6" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '2px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: 'var(--color-danger)', fontSize: '1.5rem' }}>⚠</span>
              <h2 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-danger)' }}>
                Delete All Player Data
              </h2>
            </div>
            <p style={{ fontFamily: 'var(--font-data)', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              This action will permanently delete all players, match references, weekly aggregates, sessions, and team snapshots. This cannot be undone.
            </p>
            <p style={{ fontFamily: 'var(--font-data)', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Type <strong style={{ color: 'var(--color-danger)' }}>DELETE ALL</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteAllConfirmText}
              onChange={(e) => setDeleteAllConfirmText(e.target.value)}
              className="w-full px-3 py-2 text-sm mb-4"
              style={{
                ...inputStyle,
                borderColor: deleteAllConfirmText === 'DELETE ALL' ? 'var(--color-danger)' : 'var(--glass-border)',
              }}
              placeholder="DELETE ALL"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowDeleteAllModal(false); setDeleteAllConfirmText('') }}
                className="px-4 py-2 text-sm transition-colors"
                style={{
                  fontFamily: 'var(--font-main)',
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                disabled={deleteAllConfirmText !== 'DELETE ALL' || deletingAll}
                className="px-4 py-2 text-sm font-medium transition-all disabled:opacity-30"
                style={{
                  fontFamily: 'var(--font-main)',
                  background: deleteAllConfirmText === 'DELETE ALL' ? 'var(--color-danger)' : 'rgba(239,68,68,0.3)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: deleteAllConfirmText === 'DELETE ALL' ? 'pointer' : 'not-allowed',
                }}
              >
                {deletingAll ? 'Deleting...' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
