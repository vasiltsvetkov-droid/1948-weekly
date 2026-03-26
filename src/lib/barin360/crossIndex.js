/**
 * Barin Sports 360 — Cross-Index Intelligence
 *
 * Runs AFTER individual index computation.
 * Modulates index scores based on inter-index relationships.
 *
 * Guardrails:
 * - Only applies if source index confidence > 60%
 * - Effect capped at ±5 index points
 * - Magnitude scales linearly with source confidence
 */

const CONFIDENCE_GATE = 0.60
const MAX_ADJUSTMENT = 5

/**
 * Apply cross-index modulations.
 * Mutates the indexes object in place and returns a log of applied mods.
 *
 * @param {Object} indexes - { RTT: { score, confidence }, RS: {...}, IR: {...}, NMS: {...}, MS: {...} }
 * @returns {Object[]} mods - Array of applied modifications for transparency
 */
export function applyCrossIndexMods(indexes) {
  const mods = []

  // Helper: apply a capped adjustment
  const applyMod = (targetKey, adjustment, from, reason) => {
    const capped = Math.max(-MAX_ADJUSTMENT, Math.min(MAX_ADJUSTMENT, adjustment))
    if (Math.abs(capped) < 0.5) return // too small to matter
    const before = indexes[targetKey].score
    indexes[targetKey].score = Math.max(0, Math.min(100, Math.round(before + capped)))
    mods.push({ from, to: targetKey, adjustment: capped, reason, before, after: indexes[targetKey].score })
  }

  // 1. NMS → RTT: Low NMS amplifies RTT neuromuscular penalty (+8% weight mod)
  if (indexes.NMS.confidence > CONFIDENCE_GATE && indexes.NMS.score < 40) {
    const severity = (40 - indexes.NMS.score) / 40 // 0-1
    const adjustment = -(severity * MAX_ADJUSTMENT * indexes.NMS.confidence)
    applyMod('RTT', adjustment, 'NMS', 'Low NMS depresses readiness')
  }

  // 2. MS → RTT: Mental fatigue modulates perceived readiness (+5% weight mod)
  if (indexes.MS.confidence > CONFIDENCE_GATE && indexes.MS.score < 40) {
    const severity = (40 - indexes.MS.score) / 40
    const adjustment = -(severity * (MAX_ADJUSTMENT * 0.6) * indexes.MS.confidence)
    applyMod('RTT', adjustment, 'MS', 'Mental fatigue reduces readiness')
  }

  // 3. RTT + RS → IR: Both < 60 triggers IR load cluster escalation
  if (indexes.RTT.confidence > CONFIDENCE_GATE && indexes.RS.confidence > CONFIDENCE_GATE) {
    if (indexes.RTT.score < 60 && indexes.RS.score < 60) {
      const avgDeficit = ((60 - indexes.RTT.score) + (60 - indexes.RS.score)) / 2
      const severity = avgDeficit / 60 // 0-1 range
      const minConf = Math.min(indexes.RTT.confidence, indexes.RS.confidence)
      const adjustment = severity * MAX_ADJUSTMENT * minConf
      applyMod('IR', adjustment, 'RTT+RS', 'Compound fatigue elevates injury risk')
    }
  }

  // 4. MS → IR: Life stress > threshold triggers psychosocial risk escalation
  if (indexes.MS.confidence > CONFIDENCE_GATE && indexes.MS.score < 40) {
    const severity = (40 - indexes.MS.score) / 40
    const adjustment = severity * (MAX_ADJUSTMENT * 0.8) * indexes.MS.confidence
    applyMod('IR', adjustment, 'MS', 'Psychosocial stress elevates injury risk')
  }

  // 5. RS → NMS: RS < 50 flags NMS as "fatigue-suppressed"
  if (indexes.RS.confidence > CONFIDENCE_GATE && indexes.RS.score < 50) {
    // Don't lower NMS further — just add a flag
    indexes.NMS.fatigueSuppressed = true
    mods.push({
      from: 'RS', to: 'NMS', adjustment: 0,
      reason: 'NMS tagged fatigue-suppressed (RS < 50). Low NMS may reflect transient fatigue, not true deficit.',
      before: indexes.NMS.score, after: indexes.NMS.score,
    })
  }

  // 6. NMS ↔ RS: High NMS suggests faster recovery capacity
  if (indexes.NMS.confidence > CONFIDENCE_GATE && indexes.NMS.score > 60 && indexes.RS.score < 50) {
    const boost = Math.min(MAX_ADJUSTMENT * 0.4, (indexes.NMS.score - 60) / 40 * 2)
    applyMod('RS', boost * indexes.NMS.confidence, 'NMS', 'High NMS supports recovery capacity')
  }

  return mods
}
