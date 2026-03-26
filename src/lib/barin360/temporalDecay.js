/**
 * Barin Sports 360 — Temporal Decay Engine
 *
 * Older data weighs less. Each parameter has its own decay rate (lambda)
 * and expected refresh interval. Data beyond 2× expected refresh is flagged stale.
 *
 * decay_weight = exp(-λ × hours_since_expected_refresh)
 */

/**
 * Compute temporal decay weight for a parameter observation.
 *
 * @param {Date|string} recordedAt    - When the data was captured
 * @param {Date|string} computeAt     - When we're computing (usually now)
 * @param {number} lambda             - Decay rate per hour (from parameter registry)
 * @param {number} refreshHours       - Expected refresh interval in hours
 * @returns {{ weight: number, ageHours: number, isStale: boolean, isFresh: boolean }}
 */
export function computeDecay(recordedAt, computeAt, lambda, refreshHours) {
  const recorded = new Date(recordedAt)
  const compute = new Date(computeAt)
  const ageHours = Math.max(0, (compute - recorded) / (1000 * 60 * 60))

  // Within expected refresh window → full weight
  if (ageHours <= refreshHours) {
    return { weight: 1.0, ageHours, isStale: false, isFresh: true }
  }

  // Beyond expected refresh → exponential decay
  const hoursPastRefresh = ageHours - refreshHours
  const weight = Math.exp(-lambda * hoursPastRefresh)

  // Stale = beyond 2× expected refresh
  const isStale = ageHours > refreshHours * 2

  return {
    weight: Math.max(0.01, weight), // floor at 1% to never fully zero
    ageHours,
    isStale,
    isFresh: false,
  }
}

/**
 * Format age in human-readable form for UI display.
 *
 * @param {number} ageHours
 * @returns {string} e.g. "2h ago", "3d ago", "1w ago"
 */
export function formatAge(ageHours) {
  if (ageHours < 1) return 'just now'
  if (ageHours < 24) return `${Math.round(ageHours)}h ago`
  if (ageHours < 168) return `${Math.round(ageHours / 24)}d ago`
  return `${Math.round(ageHours / 168)}w ago`
}
