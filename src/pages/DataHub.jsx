import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WellnessUpload from './WellnessUpload'
import PractitionerUpload from './PractitionerUpload'

const TABS = [
  { id: 'gps',          label: 'GPS Data',           icon: '📡', color: '#06b6d4', description: 'Barin PRO weekly CSV exports' },
  { id: 'wellness',     label: 'Wellness',           icon: '🧠', color: '#ec4899', description: 'Daily questionnaire data (mood, sleep, soreness, RPE)' },
  { id: 'practitioner', label: 'Practitioner Tests',  icon: '🔬', color: '#f97316', description: 'ForceDecks, NordBord, ForceFrame, DynaMo, Sprint F-V, RAST' },
]

export default function DataHub() {
  const [activeTab, setActiveTab] = useState('gps')
  const navigate = useNavigate()

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Data Hub</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Upload data from 3 source categories. The system computes 5 index scores from whatever data is available.
          </p>
        </div>

        {/* Pipeline Flow Visual */}
        <div className="flex items-center justify-center gap-0 mb-6 p-4 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div className="text-center px-4">
            <div className="text-2xl font-bold" style={{ color: '#06b6d4' }}>3</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Data Sources</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</div>
          <div className="text-center px-4">
            <div className="text-2xl font-bold" style={{ color: '#6366f1' }}>20</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Constructs</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</div>
          <div className="text-center px-4">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>5</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Scores</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>+</div>
          <div className="text-center px-4">
            <div className="text-2xl font-bold" style={{ color: '#ec4899' }}>%</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Confidence</div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-4 py-3 rounded-lg text-left transition-all"
              style={{
                background: activeTab === tab.id ? `${tab.color}15` : 'var(--glass-bg)',
                border: `1px solid ${activeTab === tab.id ? `${tab.color}66` : 'var(--glass-border)'}`,
                minWidth: '160px',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{tab.icon}</span>
                <span className="text-sm font-semibold" style={{ color: activeTab === tab.id ? tab.color : 'var(--text-primary)' }}>
                  {tab.label}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tab.description}</p>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'gps' && (
          <div className="p-6 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#06b6d4' }}>GPS / Wearable Data</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              GPS data is uploaded through the existing Upload page. The Barin 360 engine automatically
              reads GPS aggregates and feeds them into the construct layer.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-2.5 rounded-lg font-medium text-sm"
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                color: '#06b6d4',
              }}
            >
              Go to GPS Upload →
            </button>
            <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', color: 'var(--text-muted)' }}>
              Feeds constructs: C1 (Autonomic), C4 (Mechanical Residue), C5 (Autonomic Recovery), C7 (Load Context), C9 (Hamstring Risk), C11 (Load Risk), C15 (Speed)
            </div>
          </div>
        )}

        {activeTab === 'wellness' && <WellnessUpload />}
        {activeTab === 'practitioner' && <PractitionerUpload />}
      </div>
    </div>
  )
}
