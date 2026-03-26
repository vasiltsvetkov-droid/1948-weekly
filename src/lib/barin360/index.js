/**
 * Barin Sports 360 — Engine barrel export
 */

// Core orchestrator
export { compute360 } from './compute360.js'

// Construct & parameter registry
export { PARAMETER_REGISTRY, getParam, getParamsForConstruct, GPS_PARAMS, WELLNESS_PARAMS, PRACTITIONER_PARAMS } from './parameterRegistry.js'
export { CONSTRUCT_DEFS, INDEX_DEFS, getConstructsForIndex, getConstruct } from './constructs.js'

// Engines
export { normalizeParam, updateBaseline, NORM_TIER_MULTIPLIER } from './normalization.js'
export { computeDecay, formatAge } from './temporalDecay.js'
export { computeConstructConfidence, computeIndexConfidence, classifyConfidence } from './confidence.js'
export { zToScore, computeConstructScore, computeWeightedIndexScore, computeIRScore } from './scoreConversion.js'
export { applyCrossIndexMods } from './crossIndex.js'

// Adapters
export { adaptGPSAggregate, adaptGPSSessions } from './adapters/gpsAdapter.js'
export {
  adaptWellnessEntry, parseBarinWellnessJSON,
  WELLNESS_FIELDS, buildWellnessHeaderMap, parseWellnessCSVRow
} from './adapters/wellnessAdapter.js'
export {
  adaptPractitionerTest, adaptMultipleTests, TEST_TYPES,
  autoDetectAndParse, mergePlayerParams,
} from './adapters/practitionerAdapter.js'

// Legacy bridge
export { toLegacyAggregate, toIndexSnapshot, toBaselineRows } from './legacyBridge.js'
