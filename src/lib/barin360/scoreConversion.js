/**
 * Barin Sports 360 — Score Conversion Engine
 *
 * Converts normalized Z-scores into 0-100 index scores.
 * 50 = athlete's personal baseline
 * Each 10 points = 1 standard deviation
 *
 * Index = 50 + (Weighted_Z × 10), clamped 0-100
 */

/**
 * Convert a weighted Z-score to the 0-100 index scale.
 *
 * @param {number} weightedZ - The weighted composite Z-score
 * @returns {number} Score on 0-100 scale (50 = baseline)
 */
export function zToScore(weightedZ) {
  if (weightedZ == null || isNaN(weightedZ)) return 50
  return Math.max(0, Math.min(100, Math.round(50 + weightedZ * 10)))
}

/**
 * Compute a construct's weighted Z-score from its parameter results.
 * Only present parameters participate. Weights are re-normalized.
 *
 * @param {Object[]} paramResults - [{
 *   key: string,
 *   z: number,           // normalized Z-score
 *   weight: number,      // information value weight
 *   decayWeight: number, // temporal decay (0-1)
 * }]
 * @returns {{ weightedZ: number, score: number, paramCount: number }}
 */
export function computeConstructScore(paramResults) {
  if (!paramResults || !paramResults.length) {
    return { weightedZ: 0, score: 50, paramCount: 0 }
  }

  // Effective weight = IV weight × temporal decay
  const totalEffectiveWeight = paramResults.reduce(
    (s, p) => s + p.weight * p.decayWeight, 0
  )

  if (totalEffectiveWeight === 0) {
    return { weightedZ: 0, score: 50, paramCount: paramResults.length }
  }

  const weightedZ = paramResults.reduce(
    (s, p) => s + (p.z * p.weight * p.decayWeight), 0
  ) / totalEffectiveWeight

  return {
    weightedZ,
    score: zToScore(weightedZ),
    paramCount: paramResults.length,
  }
}

/**
 * Compute a standard index score (RTT, RS, NMS, MS) from its constructs.
 * Uses weighted average of construct Z-scores.
 *
 * @param {Object[]} constructResults - [{
 *   id: string,       // C1, C2, etc.
 *   weightedZ: number,
 *   weight: number,   // construct weight in index (from CONSTRUCT_DEFS)
 *   hasData: boolean,
 * }]
 * @returns {{ weightedZ: number, score: number }}
 */
export function computeWeightedIndexScore(constructResults) {
  // Only constructs with actual data contribute to the Z-score
  // Constructs with no data default to Z=0 (baseline assumption)
  const totalWeight = constructResults.reduce((s, c) => s + c.weight, 0)
  if (totalWeight === 0) return { weightedZ: 0, score: 50 }

  const weightedZ = constructResults.reduce(
    (s, c) => s + c.weightedZ * c.weight, 0
  ) / totalWeight

  return { weightedZ, score: zToScore(weightedZ) }
}

/**
 * Compute Injury Risk index using MAX logic across 5 risk clusters.
 * IR = MAX(cluster scores) × compound multiplier
 * Higher score = MORE risk (inverted from other indexes).
 *
 * @param {Object[]} clusterResults - [{
 *   id: string,        // C8-C12
 *   weightedZ: number,
 *   score: number,     // 0-100 where higher = worse
 *   hasData: boolean,
 * }]
 * @returns {{
 *   score: number,          // IR_known (0-100)
 *   coverage: string,       // e.g. "3/5 clusters"
 *   missingClusters: string[],
 *   upperBound: number|null,
 * }}
 */
export function computeIRScore(clusterResults) {
  const measured = clusterResults.filter(c => c.hasData)
  const missing = clusterResults.filter(c => !c.hasData)

  if (measured.length === 0) {
    return {
      score: 50,
      coverage: '0/5 clusters',
      missingClusters: clusterResults.map(c => c.id),
      upperBound: null,
    }
  }

  // For IR, Z-scores are inverted: positive Z = more risk = higher score
  // The score conversion already handles this, so we work with scores directly
  const baseScore = Math.max(...measured.map(c => c.score))

  // Compound factor: multiple elevated clusters compound the risk
  const elevatedCount = measured.filter(c => c.score > 55).length
  const compoundFactor = elevatedCount / measured.length
  const irKnown = Math.round(Math.min(100, baseScore * (1 + 0.15 * compoundFactor)))

  // Upper bound estimate when clusters are missing
  let upperBound = null
  if (missing.length > 0) {
    const missingAnatomicalRatio = missing.length / 5
    upperBound = Math.round(Math.min(100, irKnown * (1 + 0.20 * missingAnatomicalRatio)))
  }

  return {
    score: irKnown,
    coverage: `${measured.length}/5 clusters`,
    missingClusters: missing.map(c => c.id),
    upperBound,
  }
}
