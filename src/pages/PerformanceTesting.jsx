import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { usePlayers } from '../hooks/usePlayer'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB for HTML reports

export default function PerformanceTesting() {
  const { players } = usePlayers()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [viewingReport, setViewingReport] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const fileInputRef = useRef(null)

  const fetchReports = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('performance_reports')
      .select('id, player_id, title, uploaded_at, players(name, position, photo_url)')
      .order('uploaded_at', { ascending: false })
    setReports(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchReports() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setError('Only HTML files are accepted.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File must be under 10MB.')
      return
    }
    if (!selectedPlayerId) {
      setError('Please select a player first.')
      return
    }

    setUploading(true)
    const text = await file.text()
    const player = players.find(p => p.id === selectedPlayerId)
    const title = player?.name || 'Unknown Player'

    const { error: dbError } = await supabase
      .from('performance_reports')
      .insert({
        player_id: selectedPlayerId,
        title,
        html_content: text,
      })

    if (dbError) {
      setError('Failed to upload report. Make sure the performance_reports table exists.')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    fetchReports()
  }

  const handleDelete = async (id) => {
    await supabase.from('performance_reports').delete().eq('id', id)
    setDeleteConfirm(null)
    if (viewingReport?.id === id) setViewingReport(null)
    fetchReports()
  }

  const handleView = async (report) => {
    const { data } = await supabase
      .from('performance_reports')
      .select('html_content')
      .eq('id', report.id)
      .single()
    if (data) {
      setViewingReport({ ...report, html_content: data.html_content })
    }
  }

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
    borderRadius: '2px',
  }

  if (viewingReport) {
    return (
      <div style={{ padding: 'clamp(1.5rem, 3vw, 3rem)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setViewingReport(null)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-primary)', cursor: 'pointer', background: 'none', border: 'none', marginBottom: '0.5rem' }}
            >
              ← Back to reports
            </button>
            <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.8rem', color: 'var(--text-primary)' }}>
              {viewingReport.title}
            </h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Uploaded: {new Date(viewingReport.uploaded_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="glass-card overflow-hidden" style={{ minHeight: '80vh' }}>
          <iframe
            srcDoc={viewingReport.html_content}
            title={viewingReport.title}
            style={{ width: '100%', height: '80vh', border: 'none', background: '#fff' }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(1.5rem, 3vw, 3rem)' }}>
      <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        Performance Testing
      </h1>

      {/* Upload Section */}
      <div className="glass-card p-5 mb-6">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Upload Report
        </div>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1px' }}>Player</label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full px-3 py-2 text-sm"
              style={inputStyle}
            >
              <option value="">Select player...</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '1px' }}>HTML Report File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={handleUpload}
              disabled={uploading || !selectedPlayerId}
              className="text-sm"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)',
                cursor: selectedPlayerId ? 'pointer' : 'not-allowed',
                opacity: selectedPlayerId ? 1 : 0.5,
              }}
            />
          </div>
        </div>
        {uploading && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Uploading...</div>
        )}
        {error && (
          <div style={{ padding: '0.5rem 0.75rem', marginTop: '0.5rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#EF4444' }}>{error}</div>
        )}
        <div style={{ fontFamily: 'var(--font-data)', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
          Upload HTML reports generated from the Analysis Tools section. Reports are stored with the player's name as the title for easy reference.
        </div>
      </div>

      {/* Reports List */}
      <div className="section-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Uploaded Reports
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '1.5px' }}>No performance reports uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => (
            <div key={report.id} className="glass-card p-5 cursor-pointer transition-colors" onClick={() => handleView(report)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              style={{ border: '1px solid var(--glass-border)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                {report.players?.photo_url ? (
                  <img src={report.players.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {report.players?.name?.[0] || '?'}
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: 'var(--font-main)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{report.title}</div>
                  <div className="flex items-center gap-2">
                    {report.players?.position && <span className="pos-badge" style={{ fontSize: '0.55rem' }}>{report.players.position}</span>}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      {new Date(report.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                {deleteConfirm === report.id ? (
                  <>
                    <button onClick={() => handleDelete(report.id)} style={{ color: '#EF4444', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', background: 'none', border: 'none', cursor: 'pointer' }}>Confirm Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setDeleteConfirm(report.id)} style={{ color: '#EF4444', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
