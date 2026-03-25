/**
 * computeMesocycle
 *
 * Aggregates 4 consecutive microcycles (weeks) into a mesocycle summary.
 * Computes averaged indexes, totals, trends, and a structured text summary.
 *
 * @param {Object[]} weeks - Array of 4 weekly_aggregate rows, oldest first
 * @param {Object}   player - Player object with name and position
 * @returns {Object} - Mesocycle aggregate fields + summary JSON
 */
export function computeMesocycle(weeks, player) {
  if (!weeks.length) return null

  const avg = (key) => {
    const vals = weeks.map(w => w[key]).filter(v => v != null)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  const sum = (key) => {
    const vals = weeks.map(w => w[key]).filter(v => v != null)
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null
  }

  // Averaged indexes
  const api = avg('api')
  const rtt = avg('rtt')
  const rs = avg('rs')
  const tmi = avg('tmi')
  const injury_risk = avg('injury_risk')

  // Averaged ACWR
  const acwr_total_distance = avg('acwr_total_distance')
  const acwr_sprint = avg('acwr_sprint')
  const acwr_mechanical = avg('acwr_mechanical')
  const acwr_nrg = avg('acwr_nrg')

  // Averaged load percentages
  const load_pct_total_distance = avg('load_pct_total_distance')
  const load_pct_hsr = avg('load_pct_hsr')
  const load_pct_sprint = avg('load_pct_sprint')
  const load_pct_hmld = avg('load_pct_hmld')
  const load_pct_nrg = avg('load_pct_nrg')
  const load_pct_acc = avg('load_pct_acc')
  const load_pct_dec = avg('load_pct_dec')

  // Totals summed across the mesocycle
  const total_distance = sum('total_distance')
  const hsr_distance = sum('hsr_distance')
  const sprint_distance = sum('sprint_distance')
  const total_nrg = sum('total_nrg')

  // Averages
  const fatigue_index = avg('fatigue_index')
  const monotony = avg('monotony')

  // Build structured summary
  const summary = buildSummary(weeks, {
    api, rtt, rs, tmi, injury_risk,
    acwr_nrg, fatigue_index, monotony,
    load_pct_total_distance, load_pct_hsr, load_pct_sprint,
    load_pct_nrg, load_pct_acc, load_pct_dec,
  }, player)

  return {
    mesocycle_start_date: weeks[0].week_start_date,
    mesocycle_end_date: weeks[weeks.length - 1].week_start_date,
    api, rtt, rs, tmi, injury_risk,
    acwr_total_distance, acwr_sprint, acwr_mechanical, acwr_nrg,
    load_pct_total_distance, load_pct_hsr, load_pct_sprint,
    load_pct_hmld, load_pct_nrg, load_pct_acc, load_pct_dec,
    total_distance, hsr_distance, sprint_distance, total_nrg,
    fatigue_index, monotony,
    summary,
    week_dates: weeks.map(w => w.week_start_date),
  }
}

function trend(weeks, key) {
  const vals = weeks.map(w => w[key]).filter(v => v != null)
  if (vals.length < 2) return 'stable'
  const first = vals[0]
  const last = vals[vals.length - 1]
  const change = first > 0 ? ((last - first) / first) * 100 : 0
  if (change > 10) return 'increasing'
  if (change < -10) return 'decreasing'
  return 'stable'
}

function fmtIdx(val) {
  if (val == null) return 'N/A'
  return (val / 10).toFixed(1)
}

function buildSummary(weeks, agg, player) {
  const trends = {
    performance: trend(weeks, 'api'),
    rtt: trend(weeks, 'rtt'),
    rs: trend(weeks, 'rs'),
    tmi: trend(weeks, 'tmi'),
    injury_risk: trend(weeks, 'injury_risk'),
    total_nrg: trend(weeks, 'total_nrg'),
  }

  // Concerns
  const concerns = []
  if (agg.injury_risk != null && agg.injury_risk / 10 > 5) {
    concerns.push(`Average injury risk is elevated at ${fmtIdx(agg.injury_risk)}/10 across the mesocycle.`)
  }
  if (trends.injury_risk === 'increasing') {
    concerns.push('Injury risk has been trending upward over the 4-week period.')
  }
  if (agg.acwr_nrg != null && (agg.acwr_nrg > 1.3 || agg.acwr_nrg < 0.8)) {
    concerns.push(`Average ACWR NRG (${agg.acwr_nrg.toFixed(2)}) is outside the optimal 0.8-1.3 range.`)
  }
  if (agg.monotony != null && isFinite(agg.monotony) && agg.monotony > 2.0) {
    concerns.push(`Average training monotony (${agg.monotony.toFixed(2)}) exceeds the 2.0 threshold associated with overtraining risk.`)
  }
  if (agg.fatigue_index != null && agg.fatigue_index > 5.0) {
    concerns.push(`Average fatigue index (${agg.fatigue_index.toFixed(2)}) indicates high cumulative fatigue.`)
  }
  if (trends.rs === 'decreasing') {
    concerns.push('Recovery Status has been declining, suggesting accumulating fatigue without adequate recovery.')
  }
  if (agg.load_pct_sprint != null && agg.load_pct_sprint < 70) {
    concerns.push(`Sprint load achievement (${agg.load_pct_sprint.toFixed(0)}%) is below 70% of match reference — risk of neuromuscular detraining.`)
  }

  // Good points
  const positives = []
  if (agg.api != null && agg.api / 10 >= 7) {
    positives.push(`Strong average Performance Index of ${fmtIdx(agg.api)}/10 across the mesocycle.`)
  }
  if (trends.performance === 'increasing') {
    positives.push('Performance Index has been trending upward over the 4-week period.')
  }
  if (agg.acwr_nrg != null && agg.acwr_nrg >= 0.8 && agg.acwr_nrg <= 1.3) {
    positives.push(`ACWR NRG (${agg.acwr_nrg.toFixed(2)}) has been maintained within the optimal sweet spot.`)
  }
  if (agg.monotony != null && isFinite(agg.monotony) && agg.monotony <= 1.5) {
    positives.push(`Good training variability with monotony at ${agg.monotony.toFixed(2)} — well-structured microcycles.`)
  }
  if (agg.rtt != null && agg.rtt / 10 >= 7) {
    positives.push(`High Readiness to Train (${fmtIdx(agg.rtt)}/10) — player well-prepared for training demands.`)
  }
  if (agg.rs != null && agg.rs / 10 >= 7) {
    positives.push(`Good Recovery Status (${fmtIdx(agg.rs)}/10) — adequate recovery between sessions.`)
  }
  if (trends.injury_risk === 'decreasing') {
    positives.push('Injury risk has been trending downward — risk management has been effective.')
  }
  if (agg.load_pct_total_distance != null && agg.load_pct_total_distance >= 90 && agg.load_pct_total_distance <= 110) {
    positives.push('Total distance load is well-calibrated relative to match reference.')
  }

  // Recommendations for next period
  const recommendations = []
  if (trends.injury_risk === 'increasing' || (agg.injury_risk != null && agg.injury_risk / 10 > 5)) {
    recommendations.push('Reduce acute load spikes and increase recovery sessions in the next mesocycle. Consider adding a deload week (60-70% of normal volume).')
  }
  if (agg.monotony != null && isFinite(agg.monotony) && agg.monotony > 1.5) {
    recommendations.push('Increase day-to-day load variation. Alternate high-intensity (MD-4) and recovery (MD+1) sessions more distinctly.')
  }
  if (agg.load_pct_sprint != null && agg.load_pct_sprint < 70) {
    recommendations.push('Introduce targeted sprint exposure (1-2 sessions/week with high-speed running >85% Vmax) to maintain neuromuscular readiness.')
  }
  if (agg.load_pct_hsr != null && agg.load_pct_hsr < 70) {
    recommendations.push('Increase high-speed running volume through SSGs or dedicated speed endurance sessions.')
  }
  if (trends.rs === 'decreasing') {
    recommendations.push('Schedule a recovery-focused week (deload) at the start of the next mesocycle. Prioritize sleep quality, nutrition, and active recovery protocols.')
  }
  if (agg.acwr_nrg != null && agg.acwr_nrg > 1.3) {
    recommendations.push('Progressively reduce training load to bring ACWR back into the 0.8-1.3 range. Avoid week-to-week increases greater than 10%.')
  }
  if (agg.acwr_nrg != null && agg.acwr_nrg < 0.8) {
    recommendations.push('Gradually increase training load (no more than 10% per week) to build chronic fitness and bring ACWR into the optimal range.')
  }
  if (!recommendations.length) {
    recommendations.push('Current training structure is effective. Maintain the current loading pattern and periodization approach into the next mesocycle.')
  }

  // Microcycle-by-microcycle overview
  const weekOverviews = weeks.map((w, i) => ({
    week: i + 1,
    date: w.week_start_date,
    pi: fmtIdx(w.api),
    rtt: fmtIdx(w.rtt),
    rs: fmtIdx(w.rs),
    injuryRisk: fmtIdx(w.injury_risk),
  }))

  return {
    trends,
    concerns,
    positives,
    recommendations,
    weekOverviews,
    overallAssessment: agg.api != null
      ? agg.api / 10 >= 7 ? 'Good' : agg.api / 10 >= 5 ? 'Moderate' : 'Needs Attention'
      : 'Insufficient Data',
  }
}
