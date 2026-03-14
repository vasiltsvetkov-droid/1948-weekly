import { MATCH_DEFAULTS, OPTIMAL_LOAD_PCT } from '../constants/matchDefaults'

/**
 * computeMetrics
 *
 * @param {Object[]} sessions       - Array of parsed CSV row objects for one player, one week
 * @param {Object}   matchRefs      - { total_distance, hsr, sprint, hmld, nrg, acc, dec, heart_exertion }
 *                                    Per-90min match reference values entered by user.
 *                                    Falls back to MATCH_DEFAULTS[position] for any missing key.
 * @param {Object[]} history        - Up to 4 prior weekly_aggregate rows, oldest first
 * @param {string}   position       - 'CB' | 'FB' | 'CM' | 'WM' | 'ST' | 'GK'
 * @param {number}   personalMaxSpeed - Max top_speed ever recorded for this player (km/h)
 *
 * @returns {Object} - All fields matching weekly_aggregates table columns, plus:
 *   - flags: string[]     — list of warning flags (e.g. "insufficient_history")
 *   - explanations: Object — { rtt, rs, tmi, performance } explanation strings
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

  // STEP 5: ACWR calculation (total_distance, sprint, mechanical, NRG)
  const { acwr, acwr_flags } = computeACWR(totals, history)

  // STEP 6: Personal max speed
  const effectiveMaxSpeed = personalMaxSpeed || totals.top_speed || 30

  // STEP 7: Per-session Fatigue Index
  const { fatigueIndex, sessionFatigueDetails, hasHRData } = computeFatigueIndex(sessions, refs)

  // STEP 8: Indexes (all 0-100; display layer divides by 10)
  const { rtt, rttExplanation }   = computeRTT(acwr, load_pct, refs)
  const { rs, rsExplanation }     = computeRS(acwr, fatigueIndex, hasHRData, sessionFatigueDetails, load_pct.nrg)
  const { tmi, tmiExplanation }   = computeTMI(monotony)
  const { performance, perfExplanation } = computePerformanceIndex(rtt, rs, tmi)
  const { injury_risk, injuryRiskExplanation } = computeInjuryRisk(acwr, totals, history, monotony, effectiveMaxSpeed, refs, load_pct)

  const flags = [...acwr_flags]
  if (!personalMaxSpeed) flags.push('no_personal_max_speed')
  if (!hasHRData) flags.push('no_hr_data')

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
    acwr_nrg:             acwr.nrg,
    // Indexes (0-100; display layer divides by 10)
    api: performance,  // Performance Index stored in api column for backward compatibility
    rtt,
    rs,
    tmi,
    injury_risk,
    // Fatigue Index
    fatigue_index: fatigueIndex,
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
    // Explanations
    explanations: {
      rtt: rttExplanation,
      rs: rsExplanation,
      tmi: tmiExplanation,
      performance: perfExplanation,
      injury_risk: injuryRiskExplanation,
    },
  }
}

/**
 * @param {Object[]} sessions - Parsed CSV rows
 * @returns {Object} Aggregated totals for the week
 */
function aggregateSessions(sessions) {
  const sum = key => sessions.reduce((acc, s) => acc + (parseFloat(s[key]) || 0), 0)
  const avg = key => {
    const vals = sessions.map(s => parseFloat(s[key])).filter(v => !isNaN(v) && v > 0)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  }
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
    heart_exertion:       sum('Heart exertion'),
    heart_exertion_above_th: sum('Heart exertion above TH'),
  }
}

/**
 * @param {number[]} daily_loads - Array of daily NRG values
 * @returns {number|null} Training monotony value
 */
function computeMonotony(daily_loads) {
  const nonZero = daily_loads.filter(v => v > 0)
  if (!nonZero.length) return null
  const mean = nonZero.reduce((a, b) => a + b, 0) / nonZero.length
  const sd = Math.sqrt(nonZero.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nonZero.length)
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
    total_distance:  matchRefs?.total_distance  || defaults.total_distance,
    hsr:             matchRefs?.hsr             || defaults.hsr,
    sprint:          matchRefs?.sprint          || defaults.sprint,
    hmld:            matchRefs?.hmld            || defaults.hmld,
    nrg:             matchRefs?.nrg             || defaults.nrg,
    acc:             matchRefs?.acc             || defaults.acc,
    dec:             matchRefs?.dec             || defaults.dec,
    heart_exertion:  matchRefs?.heart_exertion  || defaults.heart_exertion,
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
  const c_nrg = chronic('total_nrg')

  return {
    acwr: {
      total_distance: c_td ? totals.total_distance / c_td : null,
      sprint:         c_sp ? totals.sprint_distance / c_sp : null,
      mechanical:     c_ml ? totals.mechanical_load / c_ml : null,
      nrg:            c_nrg ? totals.total_nrg / c_nrg : null,
    },
    acwr_flags: flags,
  }
}

/**
 * Compute per-session Fatigue Index.
 * FI = (Heart Exertion % of match ref) - (NRG expenditure % of match ref)
 * Positive FI means internal load (HR) is disproportionately high relative to external load (NRG).
 * Scale: ≤ -0.1 = low fatigue; 0.5–5.0 = mild fatigue; > 5.1 = high fatigue
 *
 * @param {Object[]} sessions - Raw CSV rows
 * @param {Object} refs - Match reference values (including heart_exertion)
 * @returns {{ fatigueIndex: number|null, sessionFatigueDetails: Object[], hasHRData: boolean }}
 */
function computeFatigueIndex(sessions, refs) {
  const sessionDetails = []
  let hasHRData = false

  for (const s of sessions) {
    const nrg = parseFloat(s['Total NRG expenditure (J/kg)']) || 0
    const he = parseFloat(s['Heart exertion'])

    const nrgPct = refs.nrg > 0 ? (nrg / refs.nrg) * 100 : 0
    const isHRAvailable = !isNaN(he) && he > 0

    if (isHRAvailable) {
      hasHRData = true
      const hePct = refs.heart_exertion > 0 ? (he / refs.heart_exertion) * 100 : 0
      const fi = hePct - nrgPct
      sessionDetails.push({ nrg, he, nrgPct, hePct, fi, hasHR: true })
    } else {
      sessionDetails.push({ nrg, he: null, nrgPct, hePct: null, fi: null, hasHR: false })
    }
  }

  // Average fatigue index across sessions with HR data
  const sessionsWithHR = sessionDetails.filter(d => d.hasHR)
  const avgFI = sessionsWithHR.length
    ? sessionsWithHR.reduce((sum, d) => sum + d.fi, 0) / sessionsWithHR.length
    : null

  return {
    fatigueIndex: avgFI,
    sessionFatigueDetails: sessionDetails,
    hasHRData,
  }
}

/**
 * Score how close a value is to a target, with ±tolerance% being optimal.
 * Returns 0-100.
 */
function scoreCloseness(value, target, tolerancePct = 10) {
  if (value === null || target === null) return 50
  const deviation = Math.abs(value - target)
  const toleranceAbs = target * (tolerancePct / 100)
  if (deviation <= toleranceAbs) return 100
  // Continuous decay outside tolerance using an asymptotic curve.
  // This preserves differentiation at extreme deviations instead of
  // hard-flooring at 20, which previously caused different positions
  // to produce identical scores when both were far from target.
  const excessDeviation = deviation - toleranceAbs
  const halfLife = target * 0.25 // deviation at which score drops to ~50 between max and floor
  // Exponential decay from 100 toward a floor of 5
  const decayed = 5 + 95 * Math.exp(-excessDeviation / halfLife)
  return Math.round(Math.max(5, Math.min(100, decayed)))
}

/**
 * Score ACWR value. 0.8-1.3 = optimal (100). Outside = lower.
 * When ACWR is null (no history), uses loadPctNrg as a proxy to estimate
 * training load appropriateness, preserving position-specific differentiation.
 * Returns 0-100.
 */
function scoreACWR(acwr, loadPctNrg) {
  if (acwr === null) {
    // No history: use NRG load % as a proxy. If the player's weekly NRG
    // is close to match reference (100%), assume training is appropriately
    // loaded. Further from 100% → less confidence in readiness.
    if (loadPctNrg != null) {
      // Map load_pct distance from 100% to a 30-60 range (centered on 50)
      const deviation = Math.abs(loadPctNrg - 100)
      return Math.round(Math.max(30, 60 - deviation * 0.3))
    }
    return 50
  }
  if (acwr >= 0.8 && acwr <= 1.3) return 100
  if (acwr < 0.8) {
    if (acwr < 0.4) return 15
    return Math.round(15 + ((acwr - 0.4) / 0.4) * 85)
  }
  // above 1.3
  if (acwr > 2.0) return 10
  return Math.round(100 - ((acwr - 1.3) / 0.7) * 90)
}

/**
 * Readiness to Train Index (RTT)
 * Correlates the % reached of the weekly match reference with ACWR for Total NRG.
 * ACWR gives more weight (60%) in this equation.
 *
 * @param {Object} acwr - ACWR values including nrg
 * @param {Object} load_pct - Load percentages vs match reference
 * @param {Object} refs - Match reference values
 * @returns {{ rtt: number, rttExplanation: string }}
 */
function computeRTT(acwr, load_pct, refs) {
  const explanationParts = []

  // Component 1 (40%): How close weekly NRG load is to match reference
  // Within ±10% of match reference = highest score
  const nrgPct = load_pct.nrg
  const loadScore = scoreCloseness(nrgPct, 100, 10)

  if (nrgPct !== null) {
    if (Math.abs(nrgPct - 100) <= 10) {
      explanationParts.push(`Weekly NRG expenditure is ${nrgPct.toFixed(0)}% of match reference, within the optimal ±10% band — indicating well-calibrated training load relative to match demands.`)
    } else if (nrgPct < 90) {
      explanationParts.push(`Weekly NRG expenditure reached only ${nrgPct.toFixed(0)}% of match reference, below the optimal 90–110% band. This underloading may leave the player underprepared for match-intensity metabolic demands (Malone et al. 2017). Progressive increase is recommended.`)
    } else {
      explanationParts.push(`Weekly NRG expenditure at ${nrgPct.toFixed(0)}% of match reference exceeds the optimal 90–110% band. Elevated metabolic loading without adequate recovery increases non-functional overreaching risk (Meeusen et al. 2013).`)
    }
  } else {
    explanationParts.push('NRG expenditure data unavailable for load achievement assessment.')
  }

  // Component 2 (60%): ACWR for NRG (more weight)
  const acwrNrg = acwr.nrg
  const acwrScore = scoreACWR(acwrNrg, load_pct.nrg)

  if (acwrNrg !== null) {
    if (acwrNrg >= 0.8 && acwrNrg <= 1.3) {
      explanationParts.push(`ACWR for NRG (${acwrNrg.toFixed(2)}) is within the 0.8–1.3 sweet spot, the zone associated with lowest injury risk and appropriate training stimulus (Gabbett 2016).`)
    } else if (acwrNrg < 0.8) {
      explanationParts.push(`ACWR for NRG (${acwrNrg.toFixed(2)}) is below 0.8, indicating insufficient training stimulus relative to the chronic baseline. Sustained underloading reduces the body's capacity to tolerate match demands and elevates injury risk when loads spike (Malone et al. 2017).`)
    } else if (acwrNrg <= 1.5) {
      explanationParts.push(`ACWR for NRG (${acwrNrg.toFixed(2)}) is in the caution zone (1.3–1.5). Monitor closely and avoid further intensification next week (Gabbett 2016; Hulin et al. 2016).`)
    } else {
      explanationParts.push(`ACWR for NRG (${acwrNrg.toFixed(2)}) is in the danger zone (>1.5), associated with 2–4× elevated injury risk. Immediate load reduction is recommended (Gabbett 2016).`)
    }
  } else {
    explanationParts.push('Insufficient training history to compute ACWR for NRG. At least one prior week of data is needed. Score is estimated from NRG load vs match reference.')
  }

  const rtt = Math.round(loadScore * 0.40 + acwrScore * 0.60)

  return {
    rtt: Math.max(0, Math.min(100, rtt)),
    rttExplanation: explanationParts.join(' '),
  }
}

/**
 * Recovery Status (RS)
 * ACWR of Total NRG expenditure correlated with Fatigue Index.
 * Fatigue Index: (Heart Exertion % of match ref) - (NRG % of match ref)
 * Scale: ≤ -0.1 = low fatigue; 0.5–5.0 = mild fatigue; > 5.1 = high fatigue
 *
 * When HR data is unavailable, RS is based solely on ACWR NRG.
 *
 * @param {Object} acwr - ACWR values including nrg
 * @param {number|null} fatigueIndex - Average weekly fatigue index
 * @param {boolean} hasHRData - Whether HR data was available
 * @param {Object[]} sessionFatigueDetails - Per-session fatigue details
 * @param {number|null} loadPctNrg - NRG load % vs match reference (proxy for ACWR when null)
 * @returns {{ rs: number, rsExplanation: string }}
 */
function computeRS(acwr, fatigueIndex, hasHRData, sessionFatigueDetails, loadPctNrg) {
  const explanationParts = []

  // Component 1: ACWR NRG
  const acwrNrg = acwr.nrg
  const acwrScore = scoreACWR(acwrNrg, loadPctNrg)

  if (acwrNrg !== null) {
    if (acwrNrg >= 0.8 && acwrNrg <= 1.3) {
      explanationParts.push(`ACWR NRG (${acwrNrg.toFixed(2)}) is within optimal range, supporting adequate recovery between sessions.`)
    } else if (acwrNrg > 1.3) {
      explanationParts.push(`ACWR NRG (${acwrNrg.toFixed(2)}) is elevated above optimal, indicating the acute training load is higher than the chronic baseline. This creates cumulative fatigue that impairs recovery capacity (Banister et al. 1975).`)
    } else {
      explanationParts.push(`ACWR NRG (${acwrNrg.toFixed(2)}) is below 0.8, suggesting reduced training load. While this may aid recovery in the short term, sustained underloading reduces training tolerance.`)
    }
  } else {
    explanationParts.push('No prior history available for ACWR NRG calculation.')
  }

  // Component 2: Fatigue Index (only when HR data available)
  if (hasHRData && fatigueIndex !== null) {
    let fiScore
    if (fatigueIndex <= -0.1) {
      // Low fatigue — excellent recovery
      fiScore = 100
      explanationParts.push(`Fatigue Index of ${fatigueIndex.toFixed(2)} indicates low fatigue — the internal cardiovascular cost is proportionate or lower than the external mechanical output. Recovery status is favorable.`)
    } else if (fatigueIndex <= 0.5) {
      // Borderline
      fiScore = 85
      explanationParts.push(`Fatigue Index of ${fatigueIndex.toFixed(2)} is in the neutral zone. Internal and external load are roughly balanced.`)
    } else if (fatigueIndex <= 5.0) {
      // Mild fatigue
      fiScore = Math.round(85 - ((fatigueIndex - 0.5) / 4.5) * 55)
      explanationParts.push(`Fatigue Index of ${fatigueIndex.toFixed(2)} indicates mild fatigue — the cardiovascular (internal) cost of training is disproportionately higher than the mechanical (external) output. This suggests accumulated fatigue where the body is working harder for the same external work (Banister et al. 1975; Saw et al. 2016).`)

      // Check for high FI across multiple days
      const highFIDays = sessionFatigueDetails.filter(d => d.hasHR && d.fi > 5.0).length
      if (highFIDays >= 2) {
        explanationParts.push(`High Fatigue Index observed across ${highFIDays} training days, which negatively compounds recovery deficit.`)
      }
    } else {
      // High fatigue
      fiScore = Math.max(10, Math.round(30 - ((fatigueIndex - 5.0) / 10) * 20))
      explanationParts.push(`Fatigue Index of ${fatigueIndex.toFixed(2)} indicates high fatigue — significant cardiovascular strain relative to external output. This pattern is associated with overreaching and elevated illness/injury risk (Meeusen et al. 2013). Load reduction and wellness assessment (Hooper Index, HRV, sleep quality) are strongly recommended.`)

      const highFIDays = sessionFatigueDetails.filter(d => d.hasHR && d.fi > 5.0).length
      if (highFIDays >= 2) {
        explanationParts.push(`High Fatigue Index throughout ${highFIDays} sessions negatively affects recovery and increases overtraining risk.`)
      }
    }

    // RS = 40% ACWR + 60% Fatigue Index (FI is the more specific recovery indicator)
    const rs = Math.round(acwrScore * 0.40 + fiScore * 0.60)

    return {
      rs: Math.max(0, Math.min(100, rs)),
      rsExplanation: explanationParts.join(' '),
    }
  }

  // No HR data — RS based solely on ACWR NRG
  explanationParts.push('No heart rate data available for Fatigue Index calculation. Recovery Status is based on ACWR NRG alone. Consider using HR monitors for more accurate recovery assessment.')

  return {
    rs: Math.max(0, Math.min(100, acwrScore)),
    rsExplanation: explanationParts.join(' '),
  }
}

/**
 * Training Monotony Index (TMI)
 * Monotony = average daily load / SD of daily load over the week.
 * High value (>2.0) indicates low variety and high risk of overtraining.
 * Lower values are preferred (Foster et al. 2001).
 *
 * @param {number|null} monotony - Raw training monotony value
 * @returns {{ tmi: number, tmiExplanation: string }}
 */
function computeTMI(monotony) {
  let tmi
  let explanation

  if (monotony === null) {
    tmi = 50
    explanation = 'Insufficient data to calculate Training Monotony. At least two training sessions with non-zero load are required.'
  } else if (!isFinite(monotony)) {
    tmi = 15
    explanation = 'Training Monotony is extremely high (identical load every day). Zero variability in daily training load is strongly associated with overreaching, illness, and injury (Foster et al. 2001). The microcycle must alternate between high-load and recovery days following the MD-based structure.'
  } else if (monotony <= 1.0) {
    tmi = 100
    explanation = `Training Monotony of ${monotony.toFixed(2)} indicates excellent day-to-day load variation. The microcycle has clear differentiation between hard and easy days, supporting supercompensation and reducing overtraining risk (Foster et al. 2001).`
  } else if (monotony <= 1.5) {
    tmi = Math.round(100 - ((monotony - 1.0) / 0.5) * 20)
    explanation = `Training Monotony of ${monotony.toFixed(2)} indicates good load variation with some room for improvement. The target for a well-structured microcycle is below 1.5 (Foster et al. 2001). Slightly increasing the contrast between hard days (MD-4 peak) and recovery days (MD+1, MD+2) will improve this further.`
  } else if (monotony <= 2.0) {
    tmi = Math.round(80 - ((monotony - 1.5) / 0.5) * 20)
    explanation = `Training Monotony of ${monotony.toFixed(2)} is moderate. Load uniformity is approaching levels associated with overreaching risk. Adjusting session intensity distribution — increasing the contrast between MD-4 peak days and MD+1 recovery days — is recommended (Foster et al. 2001).`
  } else if (monotony <= 2.5) {
    tmi = Math.round(60 - ((monotony - 2.0) / 0.5) * 25)
    explanation = `Training Monotony of ${monotony.toFixed(2)} exceeds the 2.0 threshold associated with overreaching, illness, and injury risk (Foster et al. 2001). Day-to-day load variation is insufficient. Introduce clear alternation between high-load days (SSGs, match intensity) and low-load days (mobility, pool recovery) to restore appropriate variety.`
  } else {
    tmi = 20
    explanation = `Training Monotony of ${monotony.toFixed(2)} is critically high (>2.5). This level of load uniformity is strongly associated with non-functional overreaching and immune suppression (Foster et al. 2001; Meeusen et al. 2013). Immediate restructuring of the training week is required to introduce day-to-day load variation following MD-based microcycle principles.`
  }

  return { tmi, tmiExplanation: explanation }
}

/**
 * Performance Index
 * A combination of RTT (35%), RS (35%), and TMI (30%) on a 0-10 scale (stored 0-100).
 * The bigger — the better.
 *
 * @param {number} rtt - Readiness to Train Index (0-100)
 * @param {number} rs - Recovery Status (0-100)
 * @param {number} tmi - Training Monotony Index (0-100)
 * @returns {{ performance: number, perfExplanation: string }}
 */
function computePerformanceIndex(rtt, rs, tmi) {
  const performance = Math.round(rtt * 0.35 + rs * 0.35 + tmi * 0.30)
  const display = (performance / 10).toFixed(1)
  const rttDisplay = (rtt / 10).toFixed(1)
  const rsDisplay = (rs / 10).toFixed(1)
  const tmiDisplay = (tmi / 10).toFixed(1)

  const parts = []

  if (performance >= 70) {
    parts.push(`Performance Index of ${display}/10 reflects strong overall status.`)
  } else if (performance >= 50) {
    parts.push(`Performance Index of ${display}/10 reflects moderate overall status with room for improvement.`)
  } else {
    parts.push(`Performance Index of ${display}/10 indicates suboptimal training status requiring attention.`)
  }

  // Identify the weakest component
  const components = [
    { name: 'Readiness to Train', value: rtt, display: rttDisplay },
    { name: 'Recovery Status', value: rs, display: rsDisplay },
    { name: 'Training Monotony', value: tmi, display: tmiDisplay },
  ]
  const weakest = components.reduce((min, c) => c.value < min.value ? c : min, components[0])
  const strongest = components.reduce((max, c) => c.value > max.value ? c : max, components[0])

  parts.push(`Strongest contributor: ${strongest.name} (${strongest.display}/10). Weakest contributor: ${weakest.name} (${weakest.display}/10).`)

  if (weakest.value < 50) {
    parts.push(`Priority action: address ${weakest.name} to improve overall performance capacity.`)
  }

  return {
    performance: Math.max(0, Math.min(100, performance)),
    perfExplanation: parts.join(' '),
  }
}

/**
 * @param {Object} acwr - ACWR values
 * @param {Object} totals - Weekly totals
 * @param {Object[]} history - Prior weekly aggregates
 * @param {number|null} monotony - Training monotony
 * @param {number} personalMaxSpeed - Max speed
 * @param {Object} refs - Match references
 * @param {Object} load_pct - Load percentages vs match reference (for position-aware fallbacks)
 * @returns {{ injury_risk: number, injuryRiskExplanation: string }}
 */
function computeInjuryRisk(acwr, totals, history, monotony, personalMaxSpeed, refs, load_pct) {
  let risk = 0
  const parts = []
  const factors = []

  // 1. ACWR Total (30%)
  const a = acwr.total_distance
  let acwrRisk
  if (a !== null) {
    acwrRisk = a > 1.8 ? 100 : a > 1.5 ? 70 : a > 1.3 ? 40 : 0
  } else {
    // No history: use load % vs match reference as a proxy.
    // Very high or very low load relative to position-specific match ref
    // indicates higher risk than moderate load.
    const tdPct = load_pct?.total_distance
    if (tdPct != null) {
      acwrRisk = tdPct > 150 ? 60 : tdPct > 120 ? 35 : tdPct < 30 ? 30 : 15
    } else {
      acwrRisk = 20
    }
  }
  risk += acwrRisk * 0.30
  if (a !== null) {
    if (a > 1.5) factors.push(`ACWR total distance at ${a.toFixed(2)} is in the danger zone (>1.5), associated with 2–4× elevated non-contact injury risk (Gabbett 2016; Hulin et al. 2016)`)
    else if (a > 1.3) factors.push(`ACWR total distance at ${a.toFixed(2)} is in the caution zone (1.3–1.5)`)
    else factors.push(`ACWR total distance at ${a.toFixed(2)} is within the optimal 0.8–1.3 range`)
  }

  // 2. Mechanical spike (25%)
  const avgMech = history.length
    ? history.map(h => h.mechanical_load || 0).reduce((a, b) => a + b, 0) / history.length
    : null
  const mechRatio = avgMech ? totals.mechanical_load / avgMech : null
  let mechRisk
  if (mechRatio !== null) {
    mechRisk = mechRatio > 1.6 ? 100 : mechRatio > 1.4 ? 70 : mechRatio > 1.3 ? 40 : 0
  } else {
    // No history: estimate from acc+dec load % relative to match ref
    const accPct = load_pct?.acc
    const decPct = load_pct?.dec
    if (accPct != null && decPct != null) {
      const avgPct = (accPct + decPct) / 2
      mechRisk = avgPct > 150 ? 55 : avgPct > 120 ? 30 : 10
    } else {
      mechRisk = 20
    }
  }
  risk += mechRisk * 0.25
  if (mechRatio !== null && mechRatio > 1.3) {
    factors.push(`Mechanical load (acc+dec) exceeds the 4-week average by ${Math.round((mechRatio - 1) * 100)}%, increasing eccentric overload risk on hamstrings and quadriceps (Dalen et al. 2016)`)
  }

  // 3. Training Monotony (20%)
  const monRisk = monotony === null ? 20
    : !isFinite(monotony) ? 100
    : monotony > 2.5 ? 100
    : monotony > 2.0 ? 70
    : monotony > 1.5 ? 40
    : 0
  risk += monRisk * 0.20
  if (monotony !== null && isFinite(monotony) && monotony > 2.0) {
    factors.push(`Training monotony at ${monotony.toFixed(2)} exceeds the 2.0 threshold associated with overreaching, illness and injury (Foster et al. 2001)`)
  }

  // 4. Speed Deficit (15%)
  const speedRisk = personalMaxSpeed > 0
    ? (totals.top_speed / personalMaxSpeed < 0.80 ? 100
       : totals.top_speed / personalMaxSpeed < 0.90 ? 50
       : 0)
    : 20
  risk += speedRisk * 0.15
  if (personalMaxSpeed > 0 && totals.top_speed / personalMaxSpeed < 0.90) {
    factors.push(`Top speed this week (${totals.top_speed.toFixed(1)} km/h) did not reach 90% of recorded maximum (${personalMaxSpeed.toFixed(1)} km/h), indicating insufficient neuromuscular preparation for match-intensity sprinting (Issurin 2008)`)
  }

  // 5. Low Chronic Load (10%)
  const chronRisk = history.length < 2 ? 50
    : history.length < 4 ? 20
    : 0
  risk += chronRisk * 0.10
  if (history.length < 4) {
    factors.push(`Limited training history (${history.length} prior weeks) reduces ACWR reliability — confidence increases with 4+ weeks of data`)
  }

  const finalRisk = Math.round(Math.min(100, risk))
  const display = (finalRisk / 10).toFixed(1)

  if (finalRisk >= 60) {
    parts.push(`Injury Risk score of ${display}/10 indicates elevated risk from multiple concurrent factors.`)
  } else if (finalRisk >= 40) {
    parts.push(`Injury Risk score of ${display}/10 indicates moderate risk. Monitoring is advised.`)
  } else {
    parts.push(`Injury Risk score of ${display}/10 indicates low risk. Current training load is well-managed.`)
  }

  if (factors.length > 0) {
    parts.push(`Key factors: ${factors.join('. ')}.`)
  }

  if (finalRisk >= 50) {
    parts.push('A full wellness assessment (Hooper Index, CMJ flight time, morning HRV) is recommended before the next high-intensity session. Scheduling a rest day on MD+2 is associated with 2–3× lower non-contact injury rates (Dupont et al. 2010).')
  }

  return {
    injury_risk: finalRisk,
    injuryRiskExplanation: parts.join(' '),
  }
}
