/**
 * Barin Sports 360 — GPS Source Adapter
 *
 * Converts existing weekly_aggregates data (from computeMetrics.js)
 * into universal parameter format for the 360 engine.
 *
 * This adapter bridges the existing GPS upload flow with the new system.
 * The existing computeMetrics.js continues to run unchanged — this adapter
 * simply reads its output and maps it to universal parameter keys.
 */

/**
 * Convert a weekly_aggregates row into universal parameter records.
 *
 * @param {Object} aggregate - A row from weekly_aggregates table
 * @param {string} weekStartDate - ISO date string for the week
 * @returns {Object} Map of { paramKey: { value, recordedAt } }
 */
export function adaptGPSAggregate(aggregate, weekStartDate) {
  if (!aggregate) return {}

  const recordedAt = weekStartDate
  const params = {}

  const map = (paramKey, value) => {
    if (value != null && !isNaN(value)) {
      params[paramKey] = { value: Number(value), recordedAt }
    }
  }

  // External load totals
  map('gps.total_distance',      aggregate.total_distance)
  map('gps.hsr_distance',        aggregate.hsr_distance)
  map('gps.sprint_distance',     aggregate.sprint_distance)
  map('gps.hmld',                aggregate.hmld)
  map('gps.total_nrg',           aggregate.total_nrg)
  map('gps.nrg_above_th',        aggregate.nrg_above_th)
  map('gps.total_accelerations', aggregate.total_accelerations)
  map('gps.total_decelerations', aggregate.total_decelerations)
  map('gps.mechanical_load',     aggregate.mechanical_load)
  map('gps.equivalent_distance', aggregate.equivalent_distance)
  map('gps.high_efforts',        aggregate.high_efforts)

  // Averages and peaks
  map('gps.avg_metabolic_power', aggregate.avg_metabolic_power)
  map('gps.max_metabolic_power', aggregate.max_metabolic_power)
  map('gps.top_speed',           aggregate.top_speed)
  map('gps.avg_speed',           aggregate.avg_speed)
  map('gps.intensity_indicator', aggregate.intensity_indicator)

  // Internal load
  map('gps.avg_hr',                  aggregate.avg_hr)
  map('gps.max_hr',                  aggregate.max_hr)
  map('gps.heart_exertion',          aggregate.heart_exertion)
  map('gps.heart_exertion_above_th', aggregate.heart_exertion_above_th)

  // ACWR values
  map('gps.acwr_total_distance', aggregate.acwr_total_distance)
  map('gps.acwr_sprint',         aggregate.acwr_sprint)
  map('gps.acwr_mechanical',     aggregate.acwr_mechanical)
  map('gps.acwr_nrg',            aggregate.acwr_nrg)

  // Derived
  map('gps.monotony',       aggregate.monotony)
  map('gps.fatigue_index',  aggregate.fatigue_index)

  return params
}

/**
 * Convert raw Barin PRO CSV sessions directly into universal params.
 * This is an alternative path that bypasses computeMetrics — useful
 * when we want to extract additional parameters not in weekly_aggregates.
 *
 * @param {Object[]} sessions - Parsed CSV row objects
 * @param {Object} csvColumns - Column name mapping
 * @param {string} weekStartDate - ISO date string
 * @returns {Object} Map of { paramKey: { value, recordedAt } }
 */
export function adaptGPSSessions(sessions, csvColumns, weekStartDate) {
  if (!sessions || !sessions.length) return {}

  const recordedAt = weekStartDate
  const params = {}

  const sum = key => sessions.reduce((acc, s) => acc + (parseFloat(s[key]) || 0), 0)
  const avg = key => {
    const vals = sessions.map(s => parseFloat(s[key])).filter(v => !isNaN(v) && v > 0)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  const max = key => {
    const vals = sessions.map(s => parseFloat(s[key])).filter(v => !isNaN(v))
    return vals.length ? Math.max(...vals) : null
  }

  const map = (paramKey, value) => {
    if (value != null && !isNaN(value)) {
      params[paramKey] = { value: Number(value), recordedAt }
    }
  }

  map('gps.total_distance',      sum(csvColumns.total_distance))
  map('gps.hsr_distance',        sum(csvColumns.zone4plus5))
  map('gps.sprint_distance',     sum(csvColumns.zone5_distance))
  map('gps.hmld',                sum(csvColumns.hmld))
  map('gps.total_nrg',           sum(csvColumns.total_nrg))
  map('gps.nrg_above_th',        sum(csvColumns.nrg_above_th))
  map('gps.total_accelerations', sum(csvColumns.total_acc))
  map('gps.total_decelerations', sum(csvColumns.total_dec))
  map('gps.mechanical_load',     sum(csvColumns.total_acc) + sum(csvColumns.total_dec))
  map('gps.equivalent_distance', sum(csvColumns.equivalent_distance))
  map('gps.high_efforts',        sum(csvColumns.high_efforts))
  map('gps.avg_metabolic_power', avg(csvColumns.avg_metabolic))
  map('gps.max_metabolic_power', max(csvColumns.max_metabolic))
  map('gps.top_speed',           max(csvColumns.top_speed))
  map('gps.avg_speed',           avg(csvColumns.avg_speed))
  map('gps.intensity_indicator', avg(csvColumns.intensity_indicator))
  map('gps.avg_hr',              avg(csvColumns.avg_hr))
  map('gps.max_hr',              max(csvColumns.max_hr))
  map('gps.heart_exertion',      sum(csvColumns.heart_exertion))
  map('gps.heart_exertion_above_th', sum(csvColumns.heart_exertion_th))

  // Additional Barin PRO fields (if columns exist)
  if (csvColumns.workload_index)  map('gps.workload_index', sum(csvColumns.workload_index))
  if (csvColumns.left_turns)      map('gps.left_turns',     sum(csvColumns.left_turns))
  if (csvColumns.right_turns)     map('gps.right_turns',    sum(csvColumns.right_turns))

  return params
}
