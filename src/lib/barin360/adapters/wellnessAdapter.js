/**
 * Barin Sports 360 — Subjective Wellness Adapter
 *
 * Converts wellness questionnaire data into universal parameter format.
 * Supports:
 *   1. Barin PRO JSON export format (1-5 scale wellness + RPE + sRPE)
 *   2. Manual form entry (1-10 scale, stored in DB)
 *   3. CSV batch import with fuzzy header matching
 */

// ─── Scale normalization ───
// Barin PRO uses 1-5, our engine expects 1-10
const scale5to10 = (v) => v != null && !isNaN(v) ? Number(v) * 2 : null

/**
 * Parse the Barin PRO wellness JSON export format.
 * Returns an array of { playerName, date, entry } objects ready for DB insert.
 *
 * @param {Object} jsonData - Parsed JSON from the wellness export file
 * @returns {Object[]} Array of { playerName, date, entry }
 */
export function parseBarinWellnessJSON(jsonData) {
  if (!jsonData?.data?.length) return []

  return jsonData.data.map(row => {
    // Parse date: handles "M/D/YYYY" format
    const date = parseWellnessDate(row.Date)

    return {
      playerName: row.Name || '',
      date,
      entry: {
        // Scale 1-5 → 1-10
        sleep_quality:  scale5to10(row.Sleep),
        mood:           scale5to10(row.Mood),
        energy:         scale5to10(row.Energy),
        soreness:       scale5to10(row.Soreness),
        stress:         scale5to10(row.Stress),
        // RPE is already 1-10
        rpe:            row.RPE ? Number(row.RPE) : null,
        // sRPE = RPE × Duration
        srpe:           row.sRPE ? Number(row.sRPE) : null,
        // Duration in minutes
        duration_min:   row['Duration (min)'] ? Number(row['Duration (min)']) : null,
        // Wellness total (raw 1-5 scale sum)
        wellness_total: row['Wellness Total'] ? Number(row['Wellness Total']) : null,
        // Session type
        session_type:   row['Session Type'] || null,
        notes:          row.Notes || null,
      },
    }
  }).filter(r => r.playerName && r.date)
}

/**
 * Parse various date formats from wellness data.
 */
function parseWellnessDate(dateStr) {
  if (!dateStr) return null
  // M/D/YYYY or MM/DD/YYYY
  const mdy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdy) {
    return `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`
  }
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10)
  // DD.MM.YYYY
  const dmy = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  }
  return null
}

/**
 * Convert a wellness entry (from form or DB row) into universal parameter records.
 * Accepts both 1-10 scale (form/DB) and raw values.
 *
 * @param {Object} entry - Wellness entry
 * @param {string} entryDate - ISO date string
 * @returns {Object} Map of { paramKey: { value, recordedAt } }
 */
export function adaptWellnessEntry(entry, entryDate) {
  if (!entry) return {}

  const recordedAt = entryDate
  const params = {}

  const map = (paramKey, value) => {
    if (value != null && !isNaN(Number(value)) && Number(value) > 0) {
      params[paramKey] = { value: Number(value), recordedAt }
    }
  }

  map('wellness.sleep_quality',      entry.sleep_quality)
  map('wellness.sleep_hours',        entry.sleep_hours)
  map('wellness.soreness',           entry.soreness)
  map('wellness.mood',               entry.mood)
  map('wellness.stress',             entry.stress)
  map('wellness.motivation',         entry.motivation)
  map('wellness.fatigue',            entry.fatigue)
  map('wellness.energy',             entry.energy)
  map('wellness.rpe',                entry.rpe)
  map('wellness.perceived_recovery', entry.perceived_recovery)
  map('wellness.confidence',         entry.confidence)
  map('wellness.life_stress',        entry.life_stress)
  map('wellness.appetite',           entry.appetite)
  map('wellness.joint_stiffness',    entry.joint_stiffness)

  return params
}

// ─── CSV support ───
const WELLNESS_ALIASES = {
  sleep_quality:      ['sleep quality', 'sleep_quality', 'sleep', 'sleep (1-10)', 'sleep (1-5)'],
  sleep_hours:        ['sleep hours', 'sleep_hours', 'sleep duration', 'hours slept'],
  soreness:           ['soreness', 'muscle soreness', 'muscle_soreness', 'doms'],
  mood:               ['mood'],
  stress:             ['stress', 'stress level'],
  motivation:         ['motivation'],
  fatigue:            ['fatigue', 'subjective fatigue'],
  energy:             ['energy', 'energy level'],
  rpe:                ['rpe', 'session rpe'],
  perceived_recovery: ['perceived recovery', 'prs', 'recovery'],
  confidence:         ['confidence'],
  life_stress:        ['life stress', 'life_stress'],
  appetite:           ['appetite'],
  joint_stiffness:    ['joint stiffness', 'joint_stiffness', 'stiffness'],
}

export function buildWellnessHeaderMap(headers) {
  const headerMap = {}
  const norm = headers.map(h => h.toLowerCase().trim())

  for (const [field, aliases] of Object.entries(WELLNESS_ALIASES)) {
    for (const alias of aliases) {
      const idx = norm.indexOf(alias)
      if (idx >= 0) { headerMap[field] = headers[idx]; break }
    }
    if (!headerMap[field]) {
      for (let i = 0; i < norm.length; i++) {
        if (norm[i].includes(field.replace(/_/g, ' '))) {
          headerMap[field] = headers[i]; break
        }
      }
    }
  }
  return headerMap
}

export function parseWellnessCSVRow(row, headerMap) {
  const entry = {}
  for (const [field, header] of Object.entries(headerMap)) {
    const val = parseFloat(row[header])
    if (!isNaN(val)) entry[field] = val
  }
  return entry
}

/**
 * Wellness form field definitions for UI building.
 * Supports both 1-5 (Barin PRO) and 1-10 (extended) scales.
 */
export const WELLNESS_FIELDS = [
  { key: 'sleep_quality', label: 'Sleep Quality',   min: 1, max: 10, step: 1, description: '1 = terrible, 10 = excellent', required: true },
  { key: 'sleep_hours',   label: 'Sleep Duration',  min: 0, max: 14, step: 0.5, unit: 'h', description: 'Total hours slept' },
  { key: 'soreness',      label: 'Muscle Soreness',  min: 1, max: 10, step: 1, description: '1 = none, 10 = extreme', required: true },
  { key: 'mood',          label: 'Mood',              min: 1, max: 10, step: 1, description: '1 = very low, 10 = excellent', required: true },
  { key: 'stress',        label: 'Stress',            min: 1, max: 10, step: 1, description: '1 = none, 10 = extreme', required: true },
  { key: 'energy',        label: 'Energy Level',      min: 1, max: 10, step: 1, description: '1 = very low, 10 = very high', required: true },
  { key: 'motivation',    label: 'Motivation',        min: 1, max: 10, step: 1, description: '1 = none, 10 = very high' },
  { key: 'fatigue',       label: 'Fatigue',            min: 1, max: 10, step: 1, description: '1 = fresh, 10 = exhausted' },
  { key: 'rpe',           label: 'RPE (last session)', min: 1, max: 10, step: 1, description: 'Borg CR-10 scale' },
  { key: 'life_stress',   label: 'Life Stress',        min: 1, max: 10, step: 1, description: '1 = none, 10 = extreme' },
  { key: 'perceived_recovery', label: 'Perceived Recovery', min: 0, max: 10, step: 1, description: '0 = not recovered, 10 = fully recovered' },
  { key: 'confidence',    label: 'Confidence',          min: 1, max: 10, step: 1, description: '1 = very low, 10 = very high' },
  { key: 'appetite',      label: 'Appetite',            min: 1, max: 10, step: 1, description: '1 = none, 10 = very good' },
  { key: 'joint_stiffness', label: 'Joint Stiffness',  min: 1, max: 10, step: 1, description: '1 = none, 10 = extreme' },
]
