/**
 * Barin Sports 360 — Universal Parameter Registry
 *
 * Every parameter the system knows about. Each entry defines:
 * - key: universal identifier
 * - source: 'gps' | 'wellness' | 'practitioner'
 * - constructs: which C1-C20 constructs this feeds
 * - iv: information value weight (0-1) for confidence calculation
 * - proxyTier: 'gold' | 'silver' | 'bronze'
 * - lambda: exponential decay rate per hour
 * - refreshHours: expected data refresh interval
 * - populationNorm: { mean, sd } fallback for Tier C normalization
 * - invert: if true, lower raw value = better (e.g. soreness, stress)
 */

// --- GPS / Wearable Parameters ---
export const GPS_PARAMS = {
  'gps.total_distance':       { label: 'Total Distance (m)',           source: 'gps', constructs: ['C4','C7','C11'], iv: 0.7, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 28000, sd: 8000 } },
  'gps.hsr_distance':         { label: 'HSR Distance (m)',             source: 'gps', constructs: ['C4','C9','C11'], iv: 0.8, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 2400, sd: 900 } },
  'gps.sprint_distance':      { label: 'Sprint Distance (m)',          source: 'gps', constructs: ['C9','C11','C15'], iv: 0.8, proxyTier: 'gold',  lambda: 0.010, refreshHours: 168, populationNorm: { mean: 800, sd: 400 } },
  'gps.hmld':                 { label: 'HMLD (m)',                     source: 'gps', constructs: ['C4','C11'],      iv: 0.8, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 3500, sd: 1200 } },
  'gps.total_nrg':            { label: 'Total NRG (J/kg)',             source: 'gps', constructs: ['C7','C11'],      iv: 0.7, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 55000, sd: 15000 } },
  'gps.nrg_above_th':         { label: 'NRG Above Threshold (J/kg)',   source: 'gps', constructs: ['C4','C7'],       iv: 0.5, proxyTier: 'silver', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 12000, sd: 5000 } },
  'gps.total_accelerations':  { label: 'Total Accelerations',          source: 'gps', constructs: ['C4','C10','C15'], iv: 0.6, proxyTier: 'silver', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 350, sd: 120 } },
  'gps.total_decelerations':  { label: 'Total Decelerations',          source: 'gps', constructs: ['C4','C8','C9'],  iv: 0.6, proxyTier: 'silver', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 340, sd: 115 } },
  'gps.mechanical_load':      { label: 'Mechanical Load (acc+dec)',     source: 'gps', constructs: ['C4','C11'],      iv: 0.7, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 690, sd: 220 } },
  'gps.equivalent_distance':  { label: 'Equivalent Distance (m)',      source: 'gps', constructs: ['C7'],            iv: 0.5, proxyTier: 'silver', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 32000, sd: 9000 } },
  'gps.high_efforts':         { label: 'High Efforts',                 source: 'gps', constructs: ['C4','C11'],      iv: 0.5, proxyTier: 'silver', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 45, sd: 20 } },
  'gps.avg_metabolic_power':  { label: 'Avg Metabolic Power (W/kg)',   source: 'gps', constructs: ['C7','C15'],      iv: 0.5, proxyTier: 'silver', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 8.5, sd: 2.0 } },
  'gps.max_metabolic_power':  { label: 'Max Metabolic Power (W/kg)',   source: 'gps', constructs: ['C2','C15'],      iv: 0.4, proxyTier: 'bronze', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 22, sd: 4 } },
  'gps.top_speed':            { label: 'Top Speed (km/h)',             source: 'gps', constructs: ['C2','C9','C15'], iv: 0.6, proxyTier: 'silver', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 30, sd: 3 } },
  'gps.avg_speed':            { label: 'Avg Speed (km/h)',             source: 'gps', constructs: ['C7'],            iv: 0.3, proxyTier: 'bronze', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 5.5, sd: 1.0 } },
  'gps.avg_hr':               { label: 'Avg HR (bpm)',                 source: 'gps', constructs: ['C1','C5'],       iv: 0.6, proxyTier: 'silver', lambda: 0.015, refreshHours: 168, populationNorm: { mean: 135, sd: 15 }, invert: true },
  'gps.max_hr':               { label: 'Max HR (bpm)',                 source: 'gps', constructs: ['C5'],            iv: 0.4, proxyTier: 'bronze', lambda: 0.015, refreshHours: 168, populationNorm: { mean: 185, sd: 10 } },
  'gps.heart_exertion':       { label: 'Heart Exertion',               source: 'gps', constructs: ['C1','C5'],       iv: 0.7, proxyTier: 'silver', lambda: 0.015, refreshHours: 168, populationNorm: { mean: 2800, sd: 800 }, invert: true },
  'gps.heart_exertion_above_th': { label: 'Heart Exertion Above TH',  source: 'gps', constructs: ['C5'],            iv: 0.4, proxyTier: 'bronze', lambda: 0.015, refreshHours: 168, populationNorm: { mean: 600, sd: 300 }, invert: true },
  'gps.intensity_indicator':  { label: 'Intensity Indicator',          source: 'gps', constructs: ['C7'],            iv: 0.4, proxyTier: 'bronze', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 4.5, sd: 1.5 } },
  'gps.workload_index':       { label: 'Work-Load Index',              source: 'gps', constructs: ['C7','C17'],      iv: 0.6, proxyTier: 'silver', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 500, sd: 150 } },
  'gps.left_turns':           { label: 'Left Turns',                   source: 'gps', constructs: ['C8','C10'],      iv: 0.3, proxyTier: 'bronze', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 80, sd: 30 } },
  'gps.right_turns':          { label: 'Right Turns',                  source: 'gps', constructs: ['C8','C10'],      iv: 0.3, proxyTier: 'bronze', lambda: 0.010, refreshHours: 168, populationNorm: { mean: 80, sd: 30 } },
  // Derived / computed from GPS history
  'gps.acwr_total_distance':  { label: 'ACWR Total Distance',          source: 'gps', constructs: ['C7','C11'],      iv: 0.9, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 1.05, sd: 0.30 } },
  'gps.acwr_sprint':          { label: 'ACWR Sprint',                  source: 'gps', constructs: ['C9','C11'],      iv: 0.8, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 1.05, sd: 0.35 } },
  'gps.acwr_mechanical':      { label: 'ACWR Mechanical',              source: 'gps', constructs: ['C4','C11'],      iv: 0.8, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 1.05, sd: 0.30 } },
  'gps.acwr_nrg':             { label: 'ACWR NRG',                     source: 'gps', constructs: ['C5','C7','C11'], iv: 0.9, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 1.05, sd: 0.30 } },
  'gps.monotony':             { label: 'Training Monotony',            source: 'gps', constructs: ['C7','C11'],      iv: 0.7, proxyTier: 'gold',   lambda: 0.010, refreshHours: 168, populationNorm: { mean: 1.3, sd: 0.5 }, invert: true },
  'gps.fatigue_index':        { label: 'Fatigue Index',                source: 'gps', constructs: ['C5'],            iv: 0.7, proxyTier: 'silver', lambda: 0.015, refreshHours: 168, populationNorm: { mean: 1.0, sd: 3.0 }, invert: true },
}

// --- Subjective Wellness Parameters ---
export const WELLNESS_PARAMS = {
  'wellness.sleep_quality':    { label: 'Sleep Quality (1-10)',         source: 'wellness', constructs: ['C1','C3','C12'], iv: 0.9, proxyTier: 'gold',   lambda: 0.035, refreshHours: 24, populationNorm: { mean: 7.0, sd: 1.5 } },
  'wellness.sleep_hours':      { label: 'Sleep Duration (h)',           source: 'wellness', constructs: ['C3'],            iv: 0.7, proxyTier: 'gold',   lambda: 0.035, refreshHours: 24, populationNorm: { mean: 7.5, sd: 1.0 } },
  'wellness.soreness':         { label: 'Muscle Soreness (1-10)',       source: 'wellness', constructs: ['C3','C4','C6'],  iv: 0.8, proxyTier: 'gold',   lambda: 0.035, refreshHours: 24, populationNorm: { mean: 4.0, sd: 2.0 }, invert: true },
  'wellness.mood':             { label: 'Mood (1-10)',                  source: 'wellness', constructs: ['C3','C12','C18'], iv: 0.8, proxyTier: 'gold',  lambda: 0.035, refreshHours: 24, populationNorm: { mean: 7.0, sd: 1.5 } },
  'wellness.stress':           { label: 'Stress (1-10)',                source: 'wellness', constructs: ['C3','C12','C19'], iv: 0.8, proxyTier: 'gold',  lambda: 0.035, refreshHours: 24, populationNorm: { mean: 4.0, sd: 2.0 }, invert: true },
  'wellness.motivation':       { label: 'Motivation (1-10)',            source: 'wellness', constructs: ['C3','C18'],      iv: 0.7, proxyTier: 'gold',   lambda: 0.035, refreshHours: 24, populationNorm: { mean: 7.0, sd: 1.5 } },
  'wellness.fatigue':          { label: 'Fatigue (1-10)',               source: 'wellness', constructs: ['C3','C6','C18'], iv: 0.7, proxyTier: 'gold',   lambda: 0.035, refreshHours: 24, populationNorm: { mean: 4.0, sd: 2.0 }, invert: true },
  'wellness.energy':           { label: 'Energy Level (1-10)',          source: 'wellness', constructs: ['C3'],            iv: 0.5, proxyTier: 'silver', lambda: 0.035, refreshHours: 24, populationNorm: { mean: 7.0, sd: 1.5 } },
  'wellness.rpe':              { label: 'RPE Last Session (1-10)',      source: 'wellness', constructs: ['C7','C17'],      iv: 0.9, proxyTier: 'gold',   lambda: 0.030, refreshHours: 24, populationNorm: { mean: 6.0, sd: 2.0 }, invert: true },
  'wellness.perceived_recovery': { label: 'Perceived Recovery (0-10)', source: 'wellness', constructs: ['C1','C5','C6'],  iv: 0.8, proxyTier: 'gold',   lambda: 0.035, refreshHours: 24, populationNorm: { mean: 6.5, sd: 1.5 } },
  'wellness.confidence':       { label: 'Confidence (1-10)',            source: 'wellness', constructs: ['C18'],           iv: 0.4, proxyTier: 'silver', lambda: 0.035, refreshHours: 24, populationNorm: { mean: 7.0, sd: 1.5 } },
  'wellness.life_stress':      { label: 'Life Stress (1-10)',           source: 'wellness', constructs: ['C12','C19'],     iv: 0.8, proxyTier: 'gold',   lambda: 0.030, refreshHours: 24, populationNorm: { mean: 4.0, sd: 2.0 }, invert: true },
  'wellness.appetite':         { label: 'Appetite (1-10)',              source: 'wellness', constructs: ['C6'],            iv: 0.3, proxyTier: 'bronze', lambda: 0.035, refreshHours: 24, populationNorm: { mean: 7.0, sd: 1.5 } },
  'wellness.joint_stiffness':  { label: 'Joint Stiffness (1-10)',       source: 'wellness', constructs: ['C6'],            iv: 0.4, proxyTier: 'silver', lambda: 0.035, refreshHours: 24, populationNorm: { mean: 3.0, sd: 2.0 }, invert: true },
}

// --- Practitioner Test Parameters ---
export const PRACTITIONER_PARAMS = {
  // Force Plate / CMJ
  'cmj.jump_height':          { label: 'CMJ Jump Height (cm)',         source: 'practitioner', constructs: ['C2','C14'],   iv: 0.9, proxyTier: 'gold',   lambda: 0.005, refreshHours: 168, populationNorm: { mean: 35, sd: 5 } },
  'cmj.rsi_mod':              { label: 'RSI-modified (m/s)',            source: 'practitioner', constructs: ['C2'],         iv: 1.0, proxyTier: 'gold',   lambda: 0.005, refreshHours: 168, populationNorm: { mean: 0.55, sd: 0.12 } },
  'cmj.flight_time_ct_ratio': { label: 'FT:CT Ratio',                  source: 'practitioner', constructs: ['C2'],         iv: 0.8, proxyTier: 'gold',   lambda: 0.005, refreshHours: 168, populationNorm: { mean: 1.1, sd: 0.25 } },
  'cmj.peak_force':           { label: 'CMJ Peak Force (N/kg)',        source: 'practitioner', constructs: ['C2','C14'],   iv: 0.8, proxyTier: 'gold',   lambda: 0.005, refreshHours: 168, populationNorm: { mean: 25, sd: 4 } },
  'cmj.peak_power':           { label: 'CMJ Peak Power (W/kg)',        source: 'practitioner', constructs: ['C13','C14'],  iv: 0.7, proxyTier: 'silver', lambda: 0.005, refreshHours: 168, populationNorm: { mean: 55, sd: 10 } },
  'cmj.ecc_duration':         { label: 'Eccentric Duration (ms)',       source: 'practitioner', constructs: ['C4'],         iv: 0.8, proxyTier: 'gold',   lambda: 0.005, refreshHours: 168, populationNorm: { mean: 350, sd: 80 }, invert: true },
  'cmj.ecc_braking_rfd':      { label: 'Ecc Braking RFD (N/s)',        source: 'practitioner', constructs: ['C2','C4'],    iv: 0.8, proxyTier: 'gold',   lambda: 0.005, refreshHours: 168, populationNorm: { mean: 8000, sd: 2500 } },
  'cmj.conc_impulse':         { label: 'Concentric Impulse (N·s)',     source: 'practitioner', constructs: ['C14','C16'],  iv: 0.6, proxyTier: 'silver', lambda: 0.005, refreshHours: 168, populationNorm: { mean: 220, sd: 40 } },
  'cmj.landing_asym':         { label: 'Landing Asymmetry (%)',         source: 'practitioner', constructs: ['C4','C8'],    iv: 0.7, proxyTier: 'gold',   lambda: 0.005, refreshHours: 168, populationNorm: { mean: 8, sd: 5 }, invert: true },
  'cmj.conc_impulse_asym':    { label: 'Conc Impulse Asymmetry (%)',    source: 'practitioner', constructs: ['C4','C8'],    iv: 0.6, proxyTier: 'silver', lambda: 0.005, refreshHours: 168, populationNorm: { mean: 7, sd: 4 }, invert: true },
  // NordBord
  'nordbord.peak_force_l':    { label: 'NordBord Peak Force L (N)',     source: 'practitioner', constructs: ['C9','C14'],   iv: 0.9, proxyTier: 'gold',   lambda: 0.004, refreshHours: 168, populationNorm: { mean: 350, sd: 70 } },
  'nordbord.peak_force_r':    { label: 'NordBord Peak Force R (N)',     source: 'practitioner', constructs: ['C9','C14'],   iv: 0.9, proxyTier: 'gold',   lambda: 0.004, refreshHours: 168, populationNorm: { mean: 350, sd: 70 } },
  'nordbord.asymmetry':       { label: 'NordBord Asymmetry (%)',        source: 'practitioner', constructs: ['C9'],         iv: 1.0, proxyTier: 'gold',   lambda: 0.004, refreshHours: 168, populationNorm: { mean: 8, sd: 5 }, invert: true },
  // IMTP
  'imtp.peak_force':          { label: 'IMTP Peak Force (N/kg)',        source: 'practitioner', constructs: ['C14'],        iv: 0.9, proxyTier: 'gold',   lambda: 0.004, refreshHours: 336, populationNorm: { mean: 35, sd: 7 } },
  'imtp.rfd_100':             { label: 'IMTP RFD 0-100ms (N/s)',       source: 'practitioner', constructs: ['C14'],        iv: 0.8, proxyTier: 'gold',   lambda: 0.004, refreshHours: 336, populationNorm: { mean: 5000, sd: 1500 } },
  'imtp.rfd_200':             { label: 'IMTP RFD 0-200ms (N/s)',       source: 'practitioner', constructs: ['C14'],        iv: 0.7, proxyTier: 'silver', lambda: 0.004, refreshHours: 336, populationNorm: { mean: 4000, sd: 1200 } },
  // Sprint F-V Profile
  'sprint_fv.f0':             { label: 'Sprint F0 (N/kg)',              source: 'practitioner', constructs: ['C13'],        iv: 0.9, proxyTier: 'gold',   lambda: 0.003, refreshHours: 504, populationNorm: { mean: 7.5, sd: 1.0 } },
  'sprint_fv.v0':             { label: 'Sprint V0 (m/s)',               source: 'practitioner', constructs: ['C13','C15'],  iv: 0.9, proxyTier: 'gold',   lambda: 0.003, refreshHours: 504, populationNorm: { mean: 9.5, sd: 0.8 } },
  'sprint_fv.pmax':           { label: 'Sprint Pmax (W/kg)',            source: 'practitioner', constructs: ['C13'],        iv: 0.9, proxyTier: 'gold',   lambda: 0.003, refreshHours: 504, populationNorm: { mean: 18, sd: 3 } },
  'sprint_fv.rfmax':          { label: 'RFmax (%)',                     source: 'practitioner', constructs: ['C9','C13'],   iv: 0.7, proxyTier: 'silver', lambda: 0.003, refreshHours: 504, populationNorm: { mean: 48, sd: 4 } },
  'sprint_fv.drf':            { label: 'DRF (%/m/s)',                   source: 'practitioner', constructs: ['C9','C13'],   iv: 0.6, proxyTier: 'silver', lambda: 0.003, refreshHours: 504, populationNorm: { mean: -8, sd: 2 } },
  // Hip / Groin
  'groin.adductor_squeeze':   { label: 'Adductor Squeeze (N)',          source: 'practitioner', constructs: ['C10'],        iv: 0.8, proxyTier: 'gold',   lambda: 0.005, refreshHours: 168, populationNorm: { mean: 300, sd: 70 } },
  'groin.ad_ab_ratio':        { label: 'AD:AB Ratio',                   source: 'practitioner', constructs: ['C10'],        iv: 0.9, proxyTier: 'gold',   lambda: 0.005, refreshHours: 168, populationNorm: { mean: 0.95, sd: 0.15 } },
  // Grip Strength
  'grip.strength_dom':        { label: 'Grip Strength Dom (kg)',        source: 'practitioner', constructs: ['C2','C14'],   iv: 0.4, proxyTier: 'bronze', lambda: 0.004, refreshHours: 336, populationNorm: { mean: 50, sd: 10 } },
  // Body Composition
  'body.mass':                { label: 'Body Mass (kg)',                 source: 'practitioner', constructs: ['C16'],        iv: 0.3, proxyTier: 'bronze', lambda: 0.002, refreshHours: 672, populationNorm: { mean: 78, sd: 8 } },
  'body.lean_mass':           { label: 'Lean Body Mass (kg)',            source: 'practitioner', constructs: ['C16'],        iv: 0.4, proxyTier: 'silver', lambda: 0.002, refreshHours: 672, populationNorm: { mean: 65, sd: 7 } },
  'body.fat_pct':             { label: 'Body Fat %',                     source: 'practitioner', constructs: ['C16'],        iv: 0.3, proxyTier: 'bronze', lambda: 0.002, refreshHours: 672, populationNorm: { mean: 12, sd: 3 }, invert: true },
  // Endurance
  'endurance.vift':           { label: 'VIFT (km/h)',                    source: 'practitioner', constructs: ['C16'],        iv: 0.5, proxyTier: 'silver', lambda: 0.002, refreshHours: 672, populationNorm: { mean: 19.5, sd: 1.5 } },
  'endurance.yoyo_ir1':       { label: 'Yo-Yo IR1 Distance (m)',        source: 'practitioner', constructs: ['C16'],        iv: 0.5, proxyTier: 'silver', lambda: 0.002, refreshHours: 672, populationNorm: { mean: 2200, sd: 400 } },
  // ROM / Movement
  'rom.ankle_df':             { label: 'Ankle DF (°)',                   source: 'practitioner', constructs: ['C8','C16'],   iv: 0.5, proxyTier: 'silver', lambda: 0.003, refreshHours: 336, populationNorm: { mean: 38, sd: 5 } },
  'rom.hip_ir':               { label: 'Hip IR ROM (°)',                 source: 'practitioner', constructs: ['C10','C16'],  iv: 0.4, proxyTier: 'silver', lambda: 0.003, refreshHours: 336, populationNorm: { mean: 40, sd: 8 } },
}

/** Combined registry — all parameters */
export const PARAMETER_REGISTRY = {
  ...GPS_PARAMS,
  ...WELLNESS_PARAMS,
  ...PRACTITIONER_PARAMS,
}

/** Get parameter definition by key */
export function getParam(key) {
  return PARAMETER_REGISTRY[key] || null
}

/** Get all parameter keys that feed a given construct */
export function getParamsForConstruct(constructId) {
  return Object.entries(PARAMETER_REGISTRY)
    .filter(([, def]) => def.constructs.includes(constructId))
    .map(([key, def]) => ({ key, ...def }))
}
