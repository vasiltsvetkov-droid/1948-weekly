import { MATCH_DEFAULTS, OPTIMAL_LOAD_PCT } from '../constants/matchDefaults'

/**
 * computeMetrics
 *
 * @param {Object[]} sessions       - Array of parsed CSV row objects for one player, one week
 * @param {Object}   matchRefs      - { total_distance, hsr, sprint, hmld, nrg, acc, dec }
 *                                    Per-90min match reference values entered by user.
 *                                    Falls back to MATCH_DEFAULTS[position] for any missing key.
 * @param {Object[]} history        - Up to 4 prior weekly_aggregate rows, oldest first
 * @param {string}   position       - 'CB' | 'FB' | 'CM' | 'WM' | 'ST' | 'GK'
 * @param {number}   personalMaxSpeed - Max top_speed ever recorded for this player (km/h)
 *
 * @returns {Object} - All fields matching weekly_aggregates table columns, plus:
 *   - flags: string[]     — list of warning flags (e.g. "insufficient_history")
 */
export function computeMetrics({ sessions, matchRefs, history, position, personalMaxSpeed }) {
  // STEP 1: Aggregate weekly totals
  const totals = aggregateSessions(sessions)

  // STEP 2: Daily loads for monotony
  const daily_loads = sessions.map(s => parseFloat(s['Total NRG expenditure (J/kg)']) || 0)
  const monotony = computeMonotony(daily_loads)

  // STEP 3: Resolve match references (user-entered values take priority, fall back to defaults)
  const refs = resolveMatchRefs(matchRefs, position)

  // STEP 4: Load % vs match references
  const load_pct = computeLoadPct(totals, refs)

  // STEP 5: ACWR calculation
  const { acwr, acwr_flags } = computeACWR(totals, history)

  // STEP 6: Personal max speed
  const effectiveMaxSpeed = personalMaxSpeed || totals.top_speed || 30

  // STEP 7: Indexes
  const api         = computeAPI(load_pct, totals, refs, effectiveMaxSpeed)
  const injury_risk = computeInjuryRisk(acwr, totals, history, monotony, effectiveMaxSpeed, refs)
  const rtt         = computeRTT(acwr, injury_risk, load_pct, totals, history, monotony)
  const rs          = computeRS(totals, history)
  const tmi         = computeTMI(monotony)

  const flags = [...acwr_flags]
  if (!personalMaxSpeed) flags.push('no_personal_max_speed')

  return {
    // Totals
    total_distance:       totals.total_distance,
    hsr_distance:         totals.hsr_distance,
    sprint_distance:      totals.sprint_distance,
    hmld:                 totals.hmld,
    total_nrg:            totals.total_nrg,
    nrg_above_th:         totals.nrg_above_th,
    total_accelerations:  totals.total_accelerations,
    total_decelerations:  totals.total_decelerations,
    mechanical_load:      totals.mechanical_load,
    equivalent_distance:  totals.equivalent_distance,
    high_efforts:         totals.high_efforts,
    avg_metabolic_power:  totals.avg_metabolic_power,
    max_metabolic_power:  totals.max_metabolic_power,
    top_speed:            totals.top_speed,
    avg_speed:            totals.avg_speed,
    intensity_indicator:  totals.intensity_indicator,
    avg_hr:               totals.avg_hr,
    max_hr:               totals.max_hr,
    heart_exertion:       totals.heart_exertion,
    heart_exertion_above_th: totals.heart_exertion_above_th,
    // ACWR
    acwr_total_distance:  acwr.total_distance,
    acwr_sprint:          acwr.sprint,
    acwr_mechanical:      acwr.mechanical,
    // Indexes (0-100; display layer divides by 10)
    api,
    rtt,
    rs,
    tmi,
    injury_risk,
    // Monotony
    monotony,
    // Load %
    load_pct_total_distance: load_pct.total_distance,
    load_pct_hsr:            load_pct.hsr,
    load_pct_sprint:         load_pct.sprint,
    load_pct_hmld:           load_pct.hmld,
    load_pct_nrg:            load_pct.nrg,
    load_pct_acc:            load_pct.acc,
    load_pct_dec:            load_pct.dec,
    daily_loads,
    flags,
  }
}

/**
 * @param {Object[]} sessions - Parsed CSV rows
 * @returns {Object} Aggregated totals for the week
 */
function aggregateSessions(sessions) {
  const sum = key => sessions.reduce((acc, s) => acc + (parseFloat(s[key]) || 0), 0)
  const avg = key => sessions.length ? sum(key) / sessions.length : 0
  const max = key => Math.max(...sessions.map(s => parseFloat(s[key]) || 0))

  return {
    total_distance:       sum('Total Distance (m)'),
    hsr_distance:         sum('Distance(4+5) (m) (speed ≥ 4.00m/s)'),
    sprint_distance:      sum('Distance speed zone 5 (m) (speed ≥ 5.50m/s)'),
    hmld:                 sum('HMLD (m) (MetPow > 25.5W/kg)'),
    total_nrg:            sum('Total NRG expenditure (J/kg)'),
    nrg_above_th:         sum('NRG expenditure above TH (J/kg)'),
    total_accelerations:  sum('Total Accelerations (accel > 2.0m/s² and time ≥ 0.5s)'),
    total_decelerations:  sum('Total Decelerations (accel < -2.0m/s² and time ≥ 0.5s)'),
    mechanical_load:      sum('Total Accelerations (accel > 2.0m/s² and time ≥ 0.5s)') +
                          sum('Total Decelerations (accel < -2.0m/s² and time ≥ 0.5s)'),
    equivalent_distance:  sum('Equivalent distance (m)'),
    high_efforts:         sum('High Efforts (MetPow > 25.5W/kg)'),
    avg_metabolic_power:  avg('Average metabolic power (W/kg)'),
    max_metabolic_power:  max('Max metabolic power (W/kg)'),
    top_speed:            max('Top speed (km/h)'),
    avg_speed:            avg('Average speed (km/h)'),
    intensity_indicator:  avg('Intensity indicator'),
    avg_hr:               avg('Average HR (bpm)'),
    max_hr:               max('Maximum HR (bpm)'),
    heart_exertion:       avg('Heart exertion'),
    heart_exertion_above_th: avg('Heart exertion above TH'),
  }
}

/**
 * @param {number[]} daily_loads - Array of daily NRG values
 * @returns {number|null} Training monotony value
 */
function computeMonotony(daily_loads) {
  if (!daily_loads.length) return null
  const mean = daily_loads.reduce((a, b) => a + b, 0) / daily_loads.length
  const sd = Math.sqrt(daily_loads.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / daily_loads.length)
  if (sd === 0) return Infinity
  return mean / sd
}

/**
 * @param {Object|null} matchRefs - User-entered match reference values
 * @param {string} position - Player position code
 * @returns {Object} Resolved match reference values
 */
function resolveMatchRefs(matchRefs, position) {
  const defaults = MATCH_DEFAULTS[position] || MATCH_DEFAULTS['CM']
  return {
    total_distance: matchRefs?.total_distance || defaults.total_distance,
    hsr:            matchRefs?.hsr            || defaults.hsr,
    sprint:         matchRefs?.sprint         || defaults.sprint,
    hmld:           matchRefs?.hmld           || defaults.hmld,
    nrg:            matchRefs?.nrg            || defaults.nrg,
    acc:            matchRefs?.acc            || defaults.acc,
    dec:            matchRefs?.dec            || defaults.dec,
  }
}

/**
 * @param {Object} totals - Weekly totals
 * @param {Object} refs - Match reference values
 * @returns {Object} Load percentages for each metric
 */
function computeLoadPct(totals, refs) {
  const pct = (val, ref) => ref > 0 ? (val / ref) * 100 : null
  return {
    total_distance: pct(totals.total_distance, refs.total_distance),
    hsr:            pct(totals.hsr_distance,   refs.hsr),
    sprint:         pct(totals.sprint_distance, refs.sprint),
    hmld:           pct(totals.hmld,           refs.hmld),
    nrg:            pct(totals.total_nrg,      refs.nrg),
    acc:            pct(totals.total_accelerations, refs.acc),
    dec:            pct(totals.total_decelerations, refs.dec),
  }
}

/**
 * @param {Object} totals - Current week totals
 * @param {Object[]} history - Prior weekly aggregate rows
 * @returns {{ acwr: Object, acwr_flags: string[] }}
 */
function computeACWR(totals, history) {
  const flags = []
  const chronic = (key) => {
    if (!history.length) return null
    const vals = history.map(h => h[key]).filter(v => v != null)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  if (history.length === 0) flags.push('insufficient_history')
  else if (history.length < 4) flags.push('low_confidence_acwr')

  const c_td = chronic('total_distance')
  const c_sp = chronic('sprint_distance')
  const c_ml = chronic('mechanical_load')

  return {
    acwr: {
      total_distance: c_td ? totals.total_distance / c_td : null,
      sprint:         c_sp ? totals.sprint_distance / c_sp : null,
      mechanical:     c_ml ? totals.mechanical_load / c_ml : null,
    },
    acwr_flags: flags,
  }
}

/**
 * Score a load% value against an optimal band — returns 0-100
 * @param {number|null} pct - Load percentage
 * @param {number} optMin - Optimal minimum
 * @param {number} optMax - Optimal maximum
 * @returns {number}
 */
function scoreLoadPct(pct, optMin, optMax) {
  if (pct === null) return 50
  if (pct >= optMin && pct <= optMax) return 100
  if (pct < optMin) {
    if (pct < optMin * 0.6) return 10
    return 10 + ((pct - optMin * 0.6) / (optMin * 0.4)) * 70
  }
  // above optimal
  if (pct > optMax * 1.3) return 20
  return 100 - ((pct - optMax) / (optMax * 0.3)) * 80
}

/**
 * @param {Object} load_pct - Load percentages
 * @param {Object} totals - Weekly totals
 * @param {Object} refs - Match references
 * @param {number} personalMaxSpeed - Player's max recorded speed
 * @returns {number} API score 0-100
 */
function computeAPI(load_pct, totals, refs, personalMaxSpeed) {
  // Volume (30%)
  const vol = scoreLoadPct(load_pct.total_distance, 270, 320)

  // High-Intensity (35%)
  const hi = (
    scoreLoadPct(load_pct.hsr,    300, 350) +
    scoreLoadPct(load_pct.sprint, 300, 310) +
    scoreLoadPct(load_pct.acc,    300, 400)
  ) / 3

  // Metabolic (20%)
  const met = (
    scoreLoadPct(load_pct.nrg,  270, 320) +
    scoreLoadPct(load_pct.hmld, 250, 350)
  ) / 2

  // Speed Exposure (15%)
  const sprintExp = refs.sprint > 0
    ? (totals.sprint_distance / refs.sprint >= 1.3 ? 100 :
       totals.sprint_distance / refs.sprint >= 1.0 ? 70 : 40)
    : 50
  const speedExp = personalMaxSpeed > 0
    ? (totals.top_speed / personalMaxSpeed >= 0.90 ? 100 : 50)
    : 50
  const spd = (sprintExp + speedExp) / 2

  return Math.round(vol * 0.30 + hi * 0.35 + met * 0.20 + spd * 0.15)
}

/**
 * @param {Object} acwr - ACWR values
 * @param {Object} totals - Weekly totals
 * @param {Object[]} history - Prior weekly aggregates
 * @param {number|null} monotony - Training monotony
 * @param {number} personalMaxSpeed - Max speed
 * @param {Object} refs - Match references
 * @returns {number} Injury risk score 0-100 (higher = more risk)
 */
function computeInjuryRisk(acwr, totals, history, monotony, personalMaxSpeed, refs) {
  let risk = 0

  // 1. ACWR Total (30%)
  const a = acwr.total_distance
  const acwrRisk = a === null ? 20
    : a > 1.8 ? 100
    : a > 1.5 ? 70
    : a > 1.3 ? 40
    : 0
  risk += acwrRisk * 0.30

  // 2. Mechanical spike (25%)
  const avgMech = history.length
    ? history.map(h => h.mechanical_load || 0).reduce((a, b) => a + b, 0) / history.length
    : null
  const mechRatio = avgMech ? totals.mechanical_load / avgMech : null
  const mechRisk = mechRatio === null ? 20
    : mechRatio > 1.6 ? 100
    : mechRatio > 1.4 ? 70
    : mechRatio > 1.3 ? 40
    : 0
  risk += mechRisk * 0.25

  // 3. Training Monotony (20%)
  const monRisk = monotony === null ? 20
    : !isFinite(monotony) ? 100
    : monotony > 2.5 ? 100
    : monotony > 2.0 ? 70
    : monotony > 1.5 ? 40
    : 0
  risk += monRisk * 0.20

  // 4. Speed Deficit (15%)
  const speedRisk = personalMaxSpeed > 0
    ? (totals.top_speed / personalMaxSpeed < 0.80 ? 100
       : totals.top_speed / personalMaxSpeed < 0.90 ? 50
       : 0)
    : 20
  risk += speedRisk * 0.15

  // 5. Low Chronic Load (10%)
  const chronRisk = history.length < 2 ? 50
    : history.length < 4 ? 20
    : 0
  risk += chronRisk * 0.10

  return Math.round(Math.min(100, risk))
}

/**
 * @param {Object} acwr - ACWR values
 * @param {number} injury_risk - Injury risk score
 * @param {Object} load_pct - Load percentages
 * @param {Object} totals - Weekly totals
 * @param {Object[]} history - Prior aggregates
 * @param {number|null} monotony - Training monotony
 * @returns {number} RTT score 0-100
 */
function computeRTT(acwr, injury_risk, load_pct, totals, history, monotony) {
  let score = 100

  const a = acwr.total_distance
  if (a !== null) {
    if (a > 1.5) score -= 25
    else if (a > 1.3) score -= 15
  }

  if (injury_risk > 60) score -= 20
  else if (injury_risk > 40) score -= 10

  if (load_pct.sprint !== null && load_pct.sprint < 150) score -= 10

  const avgMech = history.length
    ? history.map(h => h.mechanical_load || 0).reduce((a, b) => a + b, 0) / history.length
    : null
  if (avgMech && totals.mechanical_load / avgMech > 1.4) score -= 15

  if (monotony !== null && isFinite(monotony) && monotony > 2.0) score -= 10

  return Math.round(Math.max(0, score))
}

/**
 * @param {Object} totals - Weekly totals
 * @param {Object[]} history - Prior aggregates
 * @returns {number} RS score 0-100
 */
function computeRS(totals, history) {
  let score = 100
  if (!history.length) return score

  const avg = key => history.map(h => h[key] || 0).reduce((a, b) => a + b, 0) / history.length
  const avgMech = avg('mechanical_load')
  const avgHmld = avg('hmld')
  const avgNrg  = avg('total_nrg')

  if (avgMech && totals.mechanical_load > avgMech * 1.3) score -= 20
  if (avgHmld && totals.hmld > avgHmld * 1.5)           score -= 15
  if (avgNrg  && totals.total_nrg > avgNrg * 1.3)       score -= 15

  return Math.round(Math.max(0, score))
}

/**
 * @param {number|null} monotony - Training monotony value
 * @returns {number} TMI score 0-100
 */
function computeTMI(monotony) {
  if (monotony === null) return 50
  if (!isFinite(monotony)) return 20
  if (monotony <= 1.0) return 100
  if (monotony <= 1.5) return Math.round(100 - ((monotony - 1.0) / 0.5) * 20)
  if (monotony <= 2.0) return Math.round(80  - ((monotony - 1.5) / 0.5) * 20)
  if (monotony <= 2.5) return Math.round(60  - ((monotony - 2.0) / 0.5) * 20)
  return 20
}
