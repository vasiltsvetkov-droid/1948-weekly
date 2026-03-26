import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import { supabase } from '../lib/supabaseClient'
import { usePlayers } from '../hooks/usePlayer'
import { autoDetectAndParse, mergePlayerParams, TEST_TYPES } from '../lib/barin360/adapters/practitionerAdapter'

export default function PractitionerUpload() {
  const { players } = usePlayers()
  const [files, setFiles] = useState([])
  const [parsedResults, setParsedResults] = useState([])
  const [unmatchedNames, setUnmatchedNames] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleFileUpload = useCallback((e) => {
    const newFiles = Array.from(e.target.files || [])
    if (!newFiles.length) return
    setMessage(null)

    const allResults = []

    let processed = 0
    for (const file of newFiles) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const text = evt.target.result

        // Parse CSV/TSV
        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false, // keep as strings, adapters handle parsing
          delimiter: '', // auto-detect
        })

        if (!parsed.data?.length) {
          processed++
          if (processed === newFiles.length) finalize(allResults)
          return
        }

        // Auto-detect test type and parse
        const results = autoDetectAndParse(parsed.data, file.name)
        allResults.push(...results)

        processed++
        if (processed === newFiles.length) finalize(allResults)
      }
      reader.readAsText(file)
    }

    setFiles(prev => [...prev, ...newFiles])
  }, [players])

  const finalize = (allResults) => {
    if (!allResults.length) {
      setMessage({ type: 'error', text: 'No recognized test data found. Supported: ForceDecks (CMJ/DJ/SJ/SLDJ), NordBord, ForceFrame, DynaMo ROM, Sprint F-V, RAST.' })
      return
    }

    // Match player names
    const playerMap = {}
    const unmatched = new Set()
    for (const r of allResults) {
      const match = players?.find(p =>
        p.name.toLowerCase().trim() === r.playerName.toLowerCase().trim()
      )
      if (match) {
        playerMap[r.playerName] = match.id
      } else {
        unmatched.add(r.playerName)
      }
    }

    setUnmatchedNames([...unmatched])

    // Group by player
    const merged = mergePlayerParams(allResults)
    const withIds = merged.map(m => ({
      ...m,
      playerId: playerMap[m.playerName] || null,
    }))

    setParsedResults(withIds)
    setMessage({
      type: 'info',
      text: `Parsed ${allResults.length} test records for ${merged.length} athletes across ${new Set(allResults.map(r => r.testType)).size} test types`
    })
  }

  const handleSave = async () => {
    const valid = parsedResults.filter(r => r.playerId)
    if (!valid.length) return setMessage({ type: 'error', text: 'No matched players to save' })

    setSaving(true)
    setMessage(null)
    let saved = 0

    for (const player of valid) {
      for (const test of player.tests) {
        const { error } = await supabase.from('practitioner_tests').insert({
          player_id: player.playerId,
          test_date: test.testDate,
          test_type: test.testType,
          data: test.data,
          source_device: TEST_TYPES[test.testType]?.device || 'Unknown',
        })
        if (!error) saved++
      }
    }

    setSaving(false)
    setMessage({ type: 'success', text: `Saved ${saved} test records` })
    setParsedResults([])
    setFiles([])
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Practitioner Tests</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Upload test exports from ForceDecks, NordBord, ForceFrame, DynaMo, Sprint F-V, or RAST.
        File type is auto-detected from column headers.
      </p>

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

      {/* Drop Zone */}
      <div
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-orange-400/40 mb-6"
        style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)' }}
        onClick={() => document.getElementById('prac-file-input').click()}
      >
        <input
          id="prac-file-input"
          type="file"
          accept=".csv,.tsv,.txt"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
          {files.length ? `${files.length} file(s) loaded` : 'Drop practitioner test CSV/TSV files here'}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Supports: ForceDecks (CMJ, DJ, SJ, SLDJ), NordBord, ForceFrame, DynaMo ROM, Sprint F-V, RAST
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Upload multiple files at once — each will be auto-detected
        </p>
      </div>

      {/* Supported Devices Grid */}
      {!parsedResults.length && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(TEST_TYPES).map(([key, def]) => (
            <div key={key} className="p-3 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="text-xs font-semibold" style={{ color: '#f97316' }}>{def.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{def.device}</div>
            </div>
          ))}
        </div>
      )}

      {/* Unmatched Warning */}
      {unmatchedNames.length > 0 && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24'
        }}>
          Unmatched players: {unmatchedNames.join(', ')}. These test records will be skipped.
        </div>
      )}

      {/* Results Preview */}
      {parsedResults.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Parsed Results — {parsedResults.length} athletes
          </h2>

          <div className="space-y-3 mb-6">
            {parsedResults.map((player, i) => (
              <div key={i} className="p-4 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {player.playerName}
                  </span>
                  <span className="text-xs" style={{ color: player.playerId ? '#10b981' : '#f59e0b' }}>
                    {player.playerId ? 'matched' : 'unmatched'}
                  </span>
                </div>

                {/* Test types for this player */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {player.tests.map((t, j) => (
                    <span key={j} className="text-xs px-2 py-1 rounded" style={{
                      background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316'
                    }}>
                      {t.testType} — {t.testDate}
                    </span>
                  ))}
                </div>

                {/* Universal params extracted */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(player.params).map(([key, val]) => (
                    <span key={key} className="text-xs px-1.5 py-0.5 rounded" style={{
                      background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', fontSize: '0.6rem'
                    }}>
                      {key}: {typeof val.value === 'number' ? val.value.toFixed(2) : val.value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg font-medium text-sm"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10b981',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : `Save ${parsedResults.filter(r => r.playerId).length} Player Records`}
          </button>
        </div>
      )}
    </div>
  )
}
