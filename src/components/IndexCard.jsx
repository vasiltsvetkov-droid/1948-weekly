import { useState } from 'react'
import CircularGauge from './CircularGauge'

const interpretations = {
  api: (v) => v >= 7 ? 'Excellent status' : v >= 5 ? 'Moderate status' : 'Needs attention',
  rtt: (v) => v >= 7 ? 'Ready to train' : v >= 5 ? 'Caution advised' : 'Rest recommended',
  rs: (v) => v >= 7 ? 'Well recovered' : v >= 5 ? 'Moderate recovery' : 'Recovery deficit',
  tmi: (v) => v >= 7 ? 'Good load variety' : v >= 5 ? 'Moderate variety' : 'Low variety',
  injury_risk: (v) => v <= 3 ? 'Low risk' : v <= 6 ? 'Moderate risk' : 'High risk',
}

export default function IndexCard({ label, dbKey, value, inverted = false, explanation }) {
  const [showExplanation, setShowExplanation] = useState(false)
  const displayVal = value != null ? (value / 10).toFixed(1) : '—'
  const numVal = value != null ? value / 10 : 0
  const interpret = interpretations[dbKey]

  return (
    <div className="bg-slate-800 rounded-xl p-4 flex flex-col items-center min-w-[140px] relative">
      <div className="text-xs uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1">
        {label}
        {explanation && (
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-4 h-4 rounded-full bg-slate-600 text-[10px] text-slate-300 hover:bg-slate-500 transition-colors flex items-center justify-center"
            title="View explanation"
          >
            ?
          </button>
        )}
      </div>
      <div className="relative flex items-center justify-center mb-2">
        <CircularGauge value={numVal} inverted={inverted} />
        <div className="absolute text-2xl font-bold" style={{
          color: inverted
            ? (numVal >= 6 ? '#ef4444' : numVal >= 3 ? '#f59e0b' : '#22c55e')
            : (numVal >= 8 ? '#22c55e' : numVal >= 6 ? '#3b82f6' : numVal >= 4 ? '#f59e0b' : '#ef4444')
        }}>
          {displayVal}
        </div>
      </div>
      <div className="text-xs text-slate-400 text-center">
        {interpret ? interpret(numVal) : ''}
      </div>
      {showExplanation && explanation && (
        <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-slate-700 rounded-lg p-3 shadow-xl border border-slate-600 min-w-[280px] max-w-[360px]">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-semibold text-slate-300">{label} Explanation</span>
            <button
              onClick={() => setShowExplanation(false)}
              className="text-slate-400 hover:text-white text-xs ml-2"
            >
              x
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  )
}
