/**
 * Barin Sports 360 — Main Orchestrator
 *
 * Wires all 4 engines together:
 *   Raw params → Normalize → Temporal Decay → Construct Aggregation →
 *   Index Scores → Cross-Index Intelligence → Confidence
 *
 * Input:  All available parameter values + baselines
 * Output: 5 scores + 5 confidences + full breakdown
 */

import { PARAMETER_REGISTRY, getParamsForConstruct } from './parameterRegistry.js'
import { CONSTRUCT_DEFS, INDEX_DEFS } from './constructs.js'
import { normalizeParam, updateBaseline } from './normalization.js'
import { computeDecay, formatAge } from './temporalDecay.js'
import { computeConstructConfidence, computeIndexConfidence } from './confidence.js'
import { computeConstructScore, computeWeightedIndexScore, computeIRScore, zToScore } from './scoreConversion.js'
import { applyCrossIndexMods } from './crossIndex.js'

/**
 * Compute all 5 Barin 360 index scores.
 *
 * @param {Object} params - All available parameter values
 *   { 'gps.total_distance': { value: 34500, recordedAt: '2026-03-20T10:00:00Z' }, ... }
 *
 * @param {Object} playerBaselines - Rolling baselines per param key
 *   { 'gps.total_distance': { mean_30d: 28000, sd_30d: 5000, sample_count: 12 }, ... }
 *
 * @param {Object} teamBaselines - Team-level baselines per param key
 *   { 'gps.total_distance': { p25: 22000, p50: 28000, p75: 34000, sample_count: 25 }, ... }
 *
 * @param {Object} options
 * @param {Date|string} options.computeAt - When to compute (default: now)
 *
 * @returns {Object} Full computation result
 */
export function compute360(params, playerBaselines = {}, teamBaselines = {}, options = {}) {
  const computeAt = options.computeAt || new Date()
  const flags = []
  const baselineUpdates = {}

  // ═══════════════════════════════════════════════════════
  // STEP 1: Process each available parameter
  // Normalize + temporal decay for every param we have data for
  // ═══════════════════════════════════════════════════════
  const processedParams = {}

  for (const [key, paramData] of Object.entries(params)) {
    const def = PARAMETER_REGISTRY[key]
    if (!def || paramData.value == null) continue

    // Normalize
    const normResult = normalizeParam(
      paramData.value,
      playerBaselines[key] || null,
      teamBaselines[key] || null,
      def.populationNorm || null,
      def.invert || false
    )

    // Temporal decay
    const decayResult = computeDecay(
      paramData.recordedAt,
      computeAt,
      def.lambda,
      def.refreshHours
    )

    if (decayResult.isStale) {
      flags.push(`${def.label} is stale (${formatAge(decayResult.ageHours)})`)
    }

    // Baseline update
    const existingBaseline = playerBaselines[key] || null
    baselineUpdates[key] = updateBaseline(existingBaseline, paramData.value)

    processedParams[key] = {
      key,
      value: paramData.value,
      z: normResult.z,
      normTier: normResult.tier,
      normTierLabel: normResult.tierLabel,
      decayWeight: decayResult.weight,
      ageHours: decayResult.ageHours,
      isStale: decayResult.isStale,
      iv: def.iv,
      proxyTier: def.proxyTier,
      constructs: def.constructs,
    }
  }

  // ═══════════════════════════════════════════════════════
  // STEP 2: Aggregate parameters into 20 constructs
  // ═══════════════════════════════════════════════════════
  const constructResults = {}

  for (const [cId, cDef] of Object.entries(CONSTRUCT_DEFS)) {
    // Get all possible params for this construct
    const allPossible = getParamsForConstruct(cId)

    // Get present params (processed and feeding this construct)
    const present = Object.values(processedParams)
      .filter(p => p.constructs.includes(cId))
      .map(p => ({
        key: p.key,
        z: p.z,
        weight: p.iv,
        decayWeight: p.decayWeight,
        iv: p.iv,
        proxyTier: p.proxyTier,
        normTier: p.normTier,
      }))

    // Compute construct score
    const scoreResult = computeConstructScore(present)

    // Compute construct confidence
    const confResult = computeConstructConfidence(present, allPossible)

    constructResults[cId] = {
      id: cId,
      name: cDef.name,
      index: cDef.index,
      weight: cDef.weight,
      weightedZ: scoreResult.weightedZ,
      score: scoreResult.score,
      paramCount: scoreResult.paramCount,
      hasData: present.length > 0,
      confidence: confResult.confidence,
      confidencePct: confResult.pctDisplay,
      confidenceBreakdown: {
        cInfo: confResult.cInfo,
        cFreshness: confResult.cFreshness,
        cNorm: confResult.cNorm,
      },
      presentParams: present.map(p => p.key),
      missingParams: allPossible
        .filter(ap => !present.find(pp => pp.key === ap.key))
        .map(ap => ap.key),
    }
  }

  // ═══════════════════════════════════════════════════════
  // STEP 3: Compute 5 index scores from constructs
  // ═══════════════════════════════════════════════════════
  const indexes = {}

  for (const [indexId, indexDef] of Object.entries(INDEX_DEFS)) {
    const constructs = indexDef.constructs.map(cId => constructResults[cId])

    let scoreResult
    let irExtra = null

    if (indexDef.useMax) {
      // IR uses MAX logic
      const irResult = computeIRScore(constructs.map(c => ({
        id: c.id,
        weightedZ: c.weightedZ,
        score: c.score,
        hasData: c.hasData,
      })))
      scoreResult = { score: irResult.score }
      irExtra = {
        coverage: irResult.coverage,
        missingClusters: irResult.missingClusters,
        upperBound: irResult.upperBound,
      }
    } else {
      // Standard weighted average
      scoreResult = computeWeightedIndexScore(constructs.map(c => ({
        id: c.id,
        weightedZ: c.weightedZ,
        weight: c.weight,
        hasData: c.hasData,
      })))
    }

    // Index-level confidence
    const confResult = computeIndexConfidence(constructs.map(c => ({
      constructId: c.id,
      confidence: c.confidence,
      weight: c.weight,
    })))

    indexes[indexId] = {
      score: scoreResult.score,
      confidence: confResult.confidence,
      confidencePct: confResult.pctDisplay,
      constructs: constructs.reduce((acc, c) => {
        acc[c.id] = {
          name: c.name,
          score: c.score,
          weightedZ: c.weightedZ,
          weight: c.weight,
          confidence: c.confidence,
          confidencePct: c.confidencePct,
          paramCount: c.paramCount,
          hasData: c.hasData,
        }
        return acc
      }, {}),
      ...(irExtra || {}),
    }
  }

  // ═══════════════════════════════════════════════════════
  // STEP 4: Cross-index intelligence
  // ═══════════════════════════════════════════════════════
  const crossMods = applyCrossIndexMods(indexes)

  // ═══════════════════════════════════════════════════════
  // STEP 5: Determine overall normalization tier
  // ═══════════════════════════════════════════════════════
  const allTiers = Object.values(processedParams).map(p => p.normTier)
  const normTier = allTiers.includes('A') && allTiers.filter(t => t === 'A').length > allTiers.length / 2
    ? 'A'
    : allTiers.includes('B') ? 'B' : 'C'

  // Data source summary
  const sourceSummary = {
    gps: Object.values(processedParams).filter(p => PARAMETER_REGISTRY[p.key]?.source === 'gps').length,
    wellness: Object.values(processedParams).filter(p => PARAMETER_REGISTRY[p.key]?.source === 'wellness').length,
    practitioner: Object.values(processedParams).filter(p => PARAMETER_REGISTRY[p.key]?.source === 'practitioner').length,
    total: Object.keys(processedParams).length,
  }

  return {
    // The 5 index scores
    scores: {
      rtt: indexes.RTT.score,
      rs: indexes.RS.score,
      ir: indexes.IR.score,
      nms: indexes.NMS.score,
      ms: indexes.MS.score,
    },

    // Confidence percentages
    confidence: {
      rtt: indexes.RTT.confidencePct,
      rs: indexes.RS.confidencePct,
      ir: indexes.IR.confidencePct,
      nms: indexes.NMS.confidencePct,
      ms: indexes.MS.confidencePct,
    },

    // Full index details (constructs, scores, confidence breakdown)
    indexes,

    // Full construct details
    constructs: constructResults,

    // Cross-index modifications applied
    crossIndexMods: crossMods,

    // Flags and warnings
    flags,

    // Overall normalization tier
    normTier,

    // Data source summary
    sourceSummary,

    // Baseline updates to persist
    baselineUpdates,

    // NMS fatigue-suppressed flag
    nmsFatigueSuppressed: indexes.NMS.fatigueSuppressed || false,

    // IR extras
    irCoverage: indexes.IR.coverage,
    irMissingClusters: indexes.IR.missingClusters,
    irUpperBound: indexes.IR.upperBound,
  }
}
