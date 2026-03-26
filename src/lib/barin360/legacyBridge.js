/**
 * Barin Sports 360 — Legacy Bridge
 *
 * Maps new 360 index results back to the existing weekly_aggregates
 * column format so the current Dashboard, PlayerDetail, and export
 * pages continue to work unchanged.
 */

/**
 * Convert 360 computation result into legacy weekly_aggregates fields.
 *
 * @param {Object} result360 - Output from compute360()
 * @param {Object} existingAggregate - Existing weekly_aggregates row (GPS metrics)
 * @returns {Object} Fields to merge/upsert into weekly_aggregates
 */
export function toLegacyAggregate(result360, existingAggregate = {}) {
  return {
    // New 360 scores → existing columns (0-100 scale)
    rtt: result360.scores.rtt,
    rs: result360.scores.rs,
    // IR: In legacy system, injury_risk is inverted (100 = safest).
    // In 360 system, IR higher = more risk. Convert:
    injury_risk: 100 - result360.scores.ir,
    // New scores that didn't exist before
    nms: result360.scores.nms,
    ms: result360.scores.ms,
    // Legacy Performance Index: weighted combo for backward compat
    api: Math.round(
      result360.scores.rtt * 0.30 +
      result360.scores.rs * 0.30 +
      (existingAggregate.tmi || 50) * 0.20 +
      (100 - result360.scores.ir) * 0.20
    ),
    // Confidence data as JSON
    confidence_data: {
      rtt: result360.confidence.rtt,
      rs: result360.confidence.rs,
      ir: result360.confidence.ir,
      nms: result360.confidence.nms,
      ms: result360.confidence.ms,
      normTier: result360.normTier,
      sourceSummary: result360.sourceSummary,
    },
  }
}

/**
 * Convert 360 result into an index_snapshots row.
 *
 * @param {string} playerId
 * @param {string} snapshotDate - ISO date
 * @param {Object} result360 - Output from compute360()
 * @returns {Object} Row for index_snapshots table
 */
export function toIndexSnapshot(playerId, snapshotDate, result360) {
  return {
    player_id: playerId,
    snapshot_date: snapshotDate,
    rtt: result360.scores.rtt,
    rs: result360.scores.rs,
    ir: result360.scores.ir,
    nms: result360.scores.nms,
    ms: result360.scores.ms,
    confidence_rtt: result360.confidence.rtt,
    confidence_rs: result360.confidence.rs,
    confidence_ir: result360.confidence.ir,
    confidence_nms: result360.confidence.nms,
    confidence_ms: result360.confidence.ms,
    constructs: result360.constructs,
    cross_index_mods: result360.crossIndexMods,
    flags: result360.flags,
    norm_tier: result360.normTier,
    source_summary: result360.sourceSummary,
    ir_coverage: result360.irCoverage,
    ir_missing_clusters: result360.irMissingClusters,
    ir_upper_bound: result360.irUpperBound,
    nms_fatigue_suppressed: result360.nmsFatigueSuppressed,
  }
}

/**
 * Convert 360 baseline updates into player_baselines upsert rows.
 *
 * @param {string} playerId
 * @param {Object} baselineUpdates - { paramKey: { mean_30d, sd_30d, sample_count } }
 * @returns {Object[]} Array of rows for player_baselines upsert
 */
export function toBaselineRows(playerId, baselineUpdates) {
  return Object.entries(baselineUpdates).map(([paramKey, baseline]) => ({
    player_id: playerId,
    param_key: paramKey,
    mean_30d: baseline.mean_30d,
    sd_30d: baseline.sd_30d,
    sample_count: baseline.sample_count,
    last_updated: new Date().toISOString(),
  }))
}
