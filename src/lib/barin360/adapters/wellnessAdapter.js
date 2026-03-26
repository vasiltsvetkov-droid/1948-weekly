/**
 * Barin Sports 360 — Subjective Wellness Adapter
 *
 * Converts wellness questionnaire data into universal parameter format.
 * Supports both form entry (single object) and CSV batch import.
 */

/**
 * Column aliases for CSV fuzzy matching.
 * Maps various header spellings to canonical wellness field names.
 */
const WELLNESS_ALIASES = {
  sleep_quality:      ['sleep quality', 'sleep_quality', 'sleepquality', 'sleep qual', 'sleep (1-10)'],
  sleep_hours:        ['sleep hours', 'sleep_hours', 'sleephours', 'sleep duration', 'hours slept', 'sleep (h)'],
  soreness:           ['soreness', 'muscle soreness', 'muscle_soreness', 'doms', 'soreness (1-10)'],
  mood:               ['mood', 'mood (1-10)'],
  stress:             ['stress', 'stress (1-10)', 'stress level'],
  motivation:         ['motivation', 'motivation (1-10)'],
  fatigue:            ['fatigue', 'fatigue (1-10)', 'subjective fatigue', 'fatigue_subjective'],
  energy:             ['energy', 'energy level', 'energy (1-10)'],
  rpe:                ['rpe', 'rpe (1-10)', 'session rpe', 'rpe last session'],
  perceived_recovery: ['perceived recovery', 'perceived_recovery', 'prs', 'recovery (0-10)'],
  confidence:         ['confidence', 'confidence (1-10)'],
  life_stress:        ['life stress', 'life_stress', 'life stress (1-10)'],
  appetite:           ['appetite', 'appetite (1-10)'],
  joint_stiffness:    ['joint stiffness', 'joint_stiffness', 'stiffness (1-10)'],
}

/**
 * Convert a wellness entry (from form or DB row) into universal parameter records.
 *
 * @param {Object} entry - Wellness entry with fields like { sleep_quality, soreness, mood, ... }
 * @param {string} entryDate - ISO date string
 * @returns {Object} Map of { paramKey: { value, recordedAt } }
 */
export function adaptWellnessEntry(entry, entryDate) {
  if (!entry) return {}

  const recordedAt = entryDate
  const params = {}

  const map = (paramKey, value) => {
    if (value != null && !isNaN(Number(value))) {
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

/**
 * Parse a CSV row into a wellness entry using fuzzy header matching.
 *
 * @param {Object} row - Parsed CSV row (key = header, value = cell)
 * @param {Object} headerMap - Pre-computed mapping { canonicalField: actualHeader }
 * @returns {Object} Wellness entry object
 */
export function parseWellnessCSVRow(row, headerMap) {
  const entry = {}
  for (const [field, header] of Object.entries(headerMap)) {
    const val = parseFloat(row[header])
    if (!isNaN(val)) entry[field] = val
  }
  return entry
}

/**
 * Build a header map from CSV headers using fuzzy matching.
 *
 * @param {string[]} headers - Array of CSV column headers
 * @returns {Object} Map { canonicalField: matchedHeader }
 */
export function buildWellnessHeaderMap(headers) {
  const headerMap = {}
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())

  for (const [field, aliases] of Object.entries(WELLNESS_ALIASES)) {
    for (const alias of aliases) {
      const idx = normalizedHeaders.indexOf(alias.toLowerCase())
      if (idx >= 0) {
        headerMap[field] = headers[idx]
        break
      }
    }
    // Partial match fallback
    if (!headerMap[field]) {
      for (let i = 0; i < normalizedHeaders.length; i++) {
        if (normalizedHeaders[i].includes(field.replace(/_/g, ' '))) {
          headerMap[field] = headers[i]
          break
        }
      }
    }
  }

  return headerMap
}

/**
 * Get the list of expected wellness fields for form building.
 */
export const WELLNESS_FIELDS = [
  { key: 'sleep_quality',      label: 'Sleep Quality',       min: 1, max: 10, step: 1, description: '1 = terrible, 10 = excellent' },
  { key: 'sleep_hours',        label: 'Sleep Duration (h)',   min: 0, max: 14, step: 0.5, description: 'Total hours slept' },
  { key: 'soreness',           label: 'Muscle Soreness',      min: 1, max: 10, step: 1, description: '1 = none, 10 = extreme' },
  { key: 'mood',               label: 'Mood',                 min: 1, max: 10, step: 1, description: '1 = very low, 10 = excellent' },
  { key: 'stress',             label: 'Stress',               min: 1, max: 10, step: 1, description: '1 = none, 10 = extreme' },
  { key: 'motivation',         label: 'Motivation',           min: 1, max: 10, step: 1, description: '1 = none, 10 = very high' },
  { key: 'fatigue',            label: 'Fatigue',              min: 1, max: 10, step: 1, description: '1 = fresh, 10 = exhausted' },
  { key: 'energy',             label: 'Energy Level',         min: 1, max: 10, step: 1, description: '1 = very low, 10 = very high' },
  { key: 'rpe',                label: 'RPE (last session)',    min: 1, max: 10, step: 1, description: 'Borg CR-10 scale' },
  { key: 'perceived_recovery', label: 'Perceived Recovery',   min: 0, max: 10, step: 1, description: '0 = not recovered, 10 = fully recovered' },
  { key: 'life_stress',        label: 'Life Stress',          min: 1, max: 10, step: 1, description: '1 = none, 10 = extreme' },
  { key: 'confidence',         label: 'Confidence',           min: 1, max: 10, step: 1, description: '1 = very low, 10 = very high' },
  { key: 'appetite',           label: 'Appetite',             min: 1, max: 10, step: 1, description: '1 = none, 10 = very good' },
  { key: 'joint_stiffness',    label: 'Joint Stiffness',      min: 1, max: 10, step: 1, description: '1 = none, 10 = extreme' },
]
