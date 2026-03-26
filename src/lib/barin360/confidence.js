/**
 * Barin Sports 360 — 3-Component Confidence Engine
 *
 * Confidence = C_info × C_freshness × C_normalization
 *
 * C_info:  How much of the expected information is present
 * C_fresh: How current is the data
 * C_norm:  How precise is the baseline (Tier A/B/C)
 */

import { NORM_TIER_MULTIPLIER } from './normalization.js'

/**
 * Compute confidence for a single construct.
 *
 * @param {Object[]} presentParams - Parameters with data:
 *   [{ key, iv, decayWeight, proxyTier, normTier }]
 * @param {Object[]} allPossibleParams - All params that COULD feed this construct:
 *   [{ key, iv }]
 * @returns {{
 *   confidence: number,   // 0-1 final confidence
 *   cInfo: number,        // 0-1 information completeness
 *   cFreshness: number,   // 0-1 temporal freshness
 *   cNorm: number,        // 0-1 normalization quality
 *   pctDisplay: number,   // 0-100 for display
 * }}
 */
export function computeConstructConfidence(presentParams, allPossibleParams) {
  if (!allPossibleParams.length) {
    return { confidence: 0, cInfo: 0, cFreshness: 0, cNorm: 0, pctDisplay: 0 }
  }

  // --- C_info: Information completeness ---
  // Weighted by each param's information value, with proxy tier penalty
  const PROXY_PENALTY = { gold: 1.0, silver: 0.70, bronze: 0.35 }
  const totalIV = allPossibleParams.reduce((s, p) => s + p.iv, 0)
  const presentIV = presentParams.reduce((s, p) => {
    const penalty = PROXY_PENALTY[p.proxyTier] || 0.35
    return s + (p.iv * penalty)
  }, 0)
  const cInfo = totalIV > 0 ? Math.min(1, presentIV / totalIV) : 0

  // --- C_freshness: Temporal freshness ---
  const cFreshness = presentParams.length > 0
    ? presentParams.reduce((s, p) => s + (p.decayWeight || 1), 0) / presentParams.length
    : 0

  // --- C_norm: Normalization tier quality ---
  // Use the best tier available among present params
  const tiers = presentParams.map(p => p.normTier || 'C')
  const bestTier = tiers.includes('A') ? 'A' : tiers.includes('B') ? 'B' : 'C'
  const cNorm = presentParams.length > 0 ? (NORM_TIER_MULTIPLIER[bestTier] || 0.55) : 0.55

  const confidence = cInfo * cFreshness * cNorm
  return {
    confidence: Math.max(0, Math.min(1, confidence)),
    cInfo,
    cFreshness,
    cNorm,
    pctDisplay: Math.round(Math.max(0, Math.min(1, confidence)) * 100),
  }
}

/**
 * Compute confidence for a full index from its constituent constructs.
 *
 * @param {Object[]} constructResults - [{ constructId, confidence, weight }]
 * @returns {{ confidence: number, pctDisplay: number }}
 */
export function computeIndexConfidence(constructResults) {
  if (!constructResults.length) {
    return { confidence: 0, pctDisplay: 0 }
  }

  const totalWeight = constructResults.reduce((s, c) => s + c.weight, 0)
  if (totalWeight === 0) {
    return { confidence: 0, pctDisplay: 0 }
  }

  const weightedConfidence = constructResults.reduce(
    (s, c) => s + c.confidence * c.weight, 0
  ) / totalWeight

  return {
    confidence: Math.max(0, Math.min(1, weightedConfidence)),
    pctDisplay: Math.round(Math.max(0, Math.min(1, weightedConfidence)) * 100),
  }
}

/**
 * Confidence band classification for UI display.
 *
 * @param {number} pct - Confidence percentage (0-100)
 * @returns {{ band: string, color: string, label: string, actionable: boolean }}
 */
export function classifyConfidence(pct) {
  if (pct >= 85) return { band: 'high',     color: '#10b981', label: 'Full — act on it',       actionable: true }
  if (pct >= 65) return { band: 'good',     color: '#3b82f6', label: 'Good — minor gaps',      actionable: true }
  if (pct >= 40) return { band: 'reduced',  color: '#f59e0b', label: 'Reduced — use judgment',  actionable: false }
  return                { band: 'low',      color: '#ef4444', label: 'Estimated — directional only', actionable: false }
}
