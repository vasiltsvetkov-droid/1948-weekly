import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { usePlayers } from '../hooks/usePlayer'
import { parseBarinWellnessJSON, WELLNESS_FIELDS, adaptWellnessEntry } from '../lib/barin360/adapters/wellnessAdapter'

export default function WellnessUpload() {
  const { players } = usePlayers()
  const [mode, setMode] = useState('form') // 'form' | 'file'
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // File upload state
  const [fileEntries, setFileEntries] = useState([])
  const [fileName, setFileName] = useState('')
  const [unmatchedNames, setUnmatchedNames] = useState([])

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value === '' ? null : Number(value) }))
  }

  // ─── Form Submit ───
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPlayer) return setMessage({ type: 'error', text: 'Select a player' })

    setSaving(true)
    setMessage(null)

    const entry = { ...formData }
    const { error } = await supabase.from('wellness_entries').upsert({
      player_id: selectedPlayer,
      entry_date: entryDate,
      ...entry,
    }, { onConflict: 'player_id,entry_date' })

    setSaving(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Wellness entry saved' })
      setFormData({})
    }
  }

  // ─── File Upload (Barin PRO JSON or CSV) ───
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setMessage(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const text = evt.target.result
        let entries

        // Try JSON first (Barin PRO wellness export)
        if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
          const json = JSON.parse(text)
          entries = parseBarinWellnessJSON(json)
        } else {
          // CSV fallback
          const Papa = window.Papa || null
          if (!Papa) {
            setMessage({ type: 'error', text: 'CSV parser not loaded' })
            return
          }
          // TODO: CSV parsing path
          entries = []
        }

        if (!entries.length) {
          setMessage({ type: 'error', text: 'No valid entries found in file' })
          return
        }

        // Match player names to existing players
        const playerMap = {}
        const unmatched = new Set()
        for (const entry of entries) {
          const match = players?.find(p =>
            p.name.toLowerCase().trim() === entry.playerName.toLowerCase().trim()
          )
          if (match) {
            playerMap[entry.playerName] = match.id
          } else {
            unmatched.add(entry.playerName)
          }
        }

        setUnmatchedNames([...unmatched])
        setFileEntries(entries.map(e => ({ ...e, playerId: playerMap[e.playerName] || null })))
        setMessage({ type: 'info', text: `Parsed ${entries.length} entries for ${new Set(entries.map(e => e.playerName)).size} athletes` })
      } catch (err) {
        setMessage({ type: 'error', text: `Parse error: ${err.message}` })
      }
    }
    reader.readAsText(file)
  }, [players])

  const handleFileSave = async () => {
    const valid = fileEntries.filter(e => e.playerId)
    if (!valid.length) return setMessage({ type: 'error', text: 'No matched players to save' })

    setSaving(true)
    setMessage(null)
    let saved = 0

    for (const entry of valid) {
      const { error } = await supabase.from('wellness_entries').upsert({
        player_id: entry.playerId,
        entry_date: entry.date,
        ...entry.entry,
      }, { onConflict: 'player_id,entry_date' })
      if (!error) saved++
    }

    setSaving(false)
    setMessage({ type: 'success', text: `Saved ${saved}/${valid.length} wellness entries` })
    setFileEntries([])
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Wellness Data</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Upload daily wellness questionnaire data. Supports Barin PRO JSON export or manual entry.
      </p>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('form')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: mode === 'form' ? 'rgba(236, 72, 153, 0.15)' : 'var(--glass-bg)',
            border: `1px solid ${mode === 'form' ? 'rgba(236, 72, 153, 0.4)' : 'var(--glass-border)'}`,
            color: mode === 'form' ? '#ec4899' : 'var(--text-secondary)',
          }}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setMode('file')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: mode === 'file' ? 'rgba(236, 72, 153, 0.15)' : 'var(--glass-bg)',
            border: `1px solid ${mode === 'file' ? 'rgba(236, 72, 153, 0.4)' : 'var(--glass-border)'}`,
            color: mode === 'file' ? '#ec4899' : 'var(--text-secondary)',
          }}
        >
          File Upload
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{
          background: message.type === 'error' ? 'rgba(239,68,68,0.1)' : message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
          border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.3)' : message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)'}`,
          color: message.type === 'error' ? '#f87171' : message.type === 'success' ? '#10b981' : '#60a5fa',
        }}>
          {message.text}
        </div>
      )}

      {/* ─── Manual Form ─── */}
      {mode === 'form' && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Player</label>
              <select
                value={selectedPlayer}
                onChange={e => setSelectedPlayer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
              >
                <option value="">Select player...</option>
                {players?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
              <input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WELLNESS_FIELDS.map(field => (
              <div key={field.key} className="p-3 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {field.label} {field.required && <span style={{ color: '#ec4899' }}>*</span>}
                </label>
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={formData[field.key] ?? ''}
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                  placeholder={`${field.min}-${field.max}`}
                  className="w-full px-2 py-1.5 rounded text-sm"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{field.description}</p>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving || !selectedPlayer}
            className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all"
            style={{
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              color: '#ec4899',
              opacity: saving || !selectedPlayer ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Wellness Entry'}
          </button>
        </form>
      )}

      {/* ─── File Upload ─── */}
      {mode === 'file' && (
        <div>
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-pink-400/40"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)' }}
            onClick={() => document.getElementById('wellness-file-input').click()}
          >
            <input
              id="wellness-file-input"
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
              {fileName || 'Drop Barin PRO wellness JSON export here'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Supports: Barin PRO wellness JSON export, CSV with wellness columns
            </p>
          </div>

          {/* Preview */}
          {fileEntries.length > 0 && (
            <div className="mt-4">
              {unmatchedNames.length > 0 && (
                <div className="mb-3 p-3 rounded-lg text-sm" style={{
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24'
                }}>
                  Unmatched players: {unmatchedNames.join(', ')}. These entries will be skipped.
                </div>
              )}

              <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--glass-border)' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'rgba(236,72,153,0.08)' }}>
                      <th className="text-left p-2" style={{ color: 'var(--text-muted)' }}>Player</th>
                      <th className="text-left p-2" style={{ color: 'var(--text-muted)' }}>Date</th>
                      <th className="text-center p-2" style={{ color: 'var(--text-muted)' }}>Sleep</th>
                      <th className="text-center p-2" style={{ color: 'var(--text-muted)' }}>Mood</th>
                      <th className="text-center p-2" style={{ color: 'var(--text-muted)' }}>Energy</th>
                      <th className="text-center p-2" style={{ color: 'var(--text-muted)' }}>Soreness</th>
                      <th className="text-center p-2" style={{ color: 'var(--text-muted)' }}>Stress</th>
                      <th className="text-center p-2" style={{ color: 'var(--text-muted)' }}>RPE</th>
                      <th className="text-center p-2" style={{ color: 'var(--text-muted)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileEntries.map((e, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td className="p-2" style={{ color: 'var(--text-primary)' }}>{e.playerName}</td>
                        <td className="p-2" style={{ color: 'var(--text-secondary)' }}>{e.date}</td>
                        <td className="text-center p-2" style={{ color: 'var(--text-secondary)' }}>{e.entry.sleep_quality ?? '-'}</td>
                        <td className="text-center p-2" style={{ color: 'var(--text-secondary)' }}>{e.entry.mood ?? '-'}</td>
                        <td className="text-center p-2" style={{ color: 'var(--text-secondary)' }}>{e.entry.energy ?? '-'}</td>
                        <td className="text-center p-2" style={{ color: 'var(--text-secondary)' }}>{e.entry.soreness ?? '-'}</td>
                        <td className="text-center p-2" style={{ color: 'var(--text-secondary)' }}>{e.entry.stress ?? '-'}</td>
                        <td className="text-center p-2" style={{ color: 'var(--text-secondary)' }}>{e.entry.rpe ?? '-'}</td>
                        <td className="text-center p-2">
                          {e.playerId
                            ? <span style={{ color: '#10b981' }}>matched</span>
                            : <span style={{ color: '#f59e0b' }}>unmatched</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleFileSave}
                disabled={saving}
                className="mt-4 px-6 py-2.5 rounded-lg font-medium text-sm"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? 'Saving...' : `Save ${fileEntries.filter(e => e.playerId).length} Entries`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
