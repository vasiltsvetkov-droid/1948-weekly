import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { usePlayers } from '../hooks/usePlayer'
import { MATCH_DEFAULTS, METRIC_LABELS, METRIC_UNITS } from '../constants/matchDefaults'

const POSITIONS = ['CB', 'FB', 'CM', 'WM', 'ST', 'GK']
const METRIC_KEYS = ['total_distance', 'hsr', 'sprint', 'hmld', 'nrg', 'acc', 'dec']

export default function Settings() {
  const [tab, setTab] = useState('squad')
  const { players, loading, refetch } = usePlayers()
  const [newName, setNewName] = useState('')
  const [newPosition, setNewPosition] = useState('CM')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPosition, setEditPosition] = useState('CM')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

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
    await supabase.from('players').insert({ name: newName.trim(), position: newPosition })
    setNewName('')
    refetch()
  }

  const handleEditSave = async () => {
    await supabase.from('players').update({ name: editName, position: editPosition }).eq('id', editingId)
    setEditingId(null)
    refetch()
  }

  const handleDelete = async (id) => {
    await supabase.from('players').delete().eq('id', id)
    setDeleteConfirm(null)
    refetch()
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

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800 rounded-lg p-1 w-fit">
        {['squad', 'refs'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'squad' ? 'Squad' : 'Match References'}
          </button>
        ))}
      </div>

      {tab === 'squad' && (
        <div>
          {/* Add Player */}
          <div className="bg-slate-800 rounded-xl p-4 mb-4 flex gap-2 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                placeholder="Player name"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Position</label>
              <select
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button
              onClick={handleAddPlayer}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#E8530A' }}
            >
              Add Player
            </button>
          </div>

          {/* Player Table */}
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 text-xs uppercase tracking-wide">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Position</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.id} className="border-b border-slate-700/50">
                    {editingId === p.id ? (
                      <>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm w-full"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={editPosition}
                            onChange={(e) => setEditPosition(e.target.value)}
                            className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          >
                            {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                          </select>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={handleEditSave} className="text-green-400 text-xs">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-slate-400 text-xs">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3">{p.name}</td>
                        <td className="p-3 text-slate-400">{p.position}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => { setEditingId(p.id); setEditName(p.name); setEditPosition(p.position) }}
                            className="text-blue-400 text-xs"
                          >
                            Edit
                          </button>
                          {deleteConfirm === p.id ? (
                            <>
                              <button onClick={() => handleDelete(p.id)} className="text-red-400 text-xs">Confirm</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-slate-400 text-xs">Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => setDeleteConfirm(p.id)} className="text-red-400 text-xs">Delete</button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'refs' && (
        <div>
          <div className="flex gap-2 items-end mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-slate-400 mb-1">Player</label>
              <select
                value={selectedPlayerId || ''}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
              </select>
            </div>
            <button
              onClick={handleLoadDefaults}
              className="px-3 py-2 rounded-lg bg-slate-700 text-sm text-slate-300 hover:text-white"
            >
              Load Position Defaults
            </button>
          </div>

          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 text-xs uppercase tracking-wide">
                  <th className="text-left p-3">Metric</th>
                  <th className="text-right p-3">Per-90 Value</th>
                  <th className="text-right p-3">Per-minute</th>
                </tr>
              </thead>
              <tbody>
                {METRIC_KEYS.map(key => (
                  <tr key={key} className="border-b border-slate-700/50">
                    <td className="p-3">{METRIC_LABELS[key]}</td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        value={refValues[key] ?? ''}
                        onChange={(e) => setRefValues({ ...refValues, [key]: e.target.value ? Number(e.target.value) : null })}
                        className="w-24 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm text-right"
                      />
                    </td>
                    <td className="p-3 text-right text-slate-400">
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
            className="mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#E8530A' }}
          >
            {saving ? 'Saving...' : 'Save Match References'}
          </button>
        </div>
      )}
    </div>
  )
}
