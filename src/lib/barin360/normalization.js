/**
 * Barin Sports 360 — 3-Tier Normalization Engine
 *
 * Tier A: Individual Z-score (30+ days rolling baseline)
 * Tier B: Team percentile (< 30 days or return from injury)
 * Tier C: Population norms (fallback)
 *
 * All raw values are normalized before entering constructs.
 */

/**
 * Normalize a raw parameter value using the best available tier.
 *
 * @param {number} rawValue - The raw measurement
 * @param {Object|null} playerBaseline - { mean_30d, sd_30d, sample_count }
 * @param {Object|null} teamBaseline   - { p25, p50, p75, sample_count }
 * @param {Object|null} populationNorm - { mean, sd } from parameter registry
 * @param {boolean} invert - If true, lower raw = better (flip Z sign)
 * @returns {{ z: number, tier: 'A'|'B'|'C', tierLabel: string }}
 */
export function normalizeParam(rawValue, playerBaseline, teamBaseline, populationNorm, invert = false) {
  if (rawValue == null || isNaN(rawValue)) {
    return { z: 0, tier: 'C', tierLabel: 'No data' }
  }

  let result

  // Tier A: Individual 30-day rolling baseline (best)
  if (playerBaseline && playerBaseline.sample_count >= 5 && playerBaseline.sd_30d > 0.001) {
    const z = (rawValue - playerBaseline.mean_30d) / playerBaseline.sd_30d
    result = { z, tier: 'A', tierLabel: 'Individual 30d' }
  }
  // Tier B: Team percentile
  else if (teamBaseline && teamBaseline.sample_count >= 10) {
    const iqr = teamBaseline.p75 - teamBaseline.p25
    if (iqr > 0.001) {
      const z = (rawValue - teamBaseline.p50) / (iqr / 1.35)
      result = { z, tier: 'B', tierLabel: 'Team percentile' }
    } else {
      result = _fallbackToPopulation(rawValue, populationNorm)
    }
  }
  // Tier C: Population norms
  else {
    result = _fallbackToPopulation(rawValue, populationNorm)
  }

  // Invert if lower is better (soreness, stress, etc.)
  if (invert) {
    result.z = -result.z
  }

  // Clamp extreme Z-scores to ±4 to prevent outlier distortion
  result.z = Math.max(-4, Math.min(4, result.z))

  return result
}

function _fallbackToPopulation(rawValue, populationNorm) {
  if (populationNorm && populationNorm.sd > 0.001) {
    const z = (rawValue - populationNorm.mean) / populationNorm.sd
    return { z, tier: 'C', tierLabel: 'Population norm' }
  }
  return { z: 0, tier: 'C', tierLabel: 'Default (no baseline)' }
}

/**
 * Normalization tier multiplier for confidence calculation.
 */
export const NORM_TIER_MULTIPLIER = {
  A: 1.00,
  B: 0.80,
  C: 0.55,
}

/**
 * Update a player's rolling baseline using Welford's online algorithm.
 * Returns a new baseline object (does not mutate input).
 *
 * @param {Object|null} existing - { mean_30d, sd_30d, sample_count } or null
 * @param {number} newValue - New measurement to incorporate
 * @param {number} maxSamples - Maximum rolling window (default 30)
 * @returns {Object} Updated baseline { mean_30d, sd_30d, sample_count }
 */
export function updateBaseline(existing, newValue, maxSamples = 30) {
  if (newValue == null || isNaN(newValue)) return existing

  if (!existing || existing.sample_count === 0) {
    return { mean_30d: newValue, sd_30d: 0, sample_count: 1 }
  }

  const n = Math.min(existing.sample_count + 1, maxSamples)
  const oldMean = existing.mean_30d
  const oldVar = existing.sd_30d * existing.sd_30d

  // Welford's incremental update
  const newMean = oldMean + (newValue - oldMean) / n
  const newVar = n > 1
    ? ((n - 2) / (n - 1)) * oldVar + ((newValue - oldMean) ** 2) / n
    : 0

  return {
    mean_30d: newMean,
    sd_30d: Math.sqrt(Math.max(0, newVar)),
    sample_count: n,
  }
}
