/**
 * Barin Sports 360 — Practitioner Test Adapter
 *
 * Converts force plate, NordBord, IMTP, sprint F-V, groin, ROM,
 * body composition, and endurance test data into universal parameter format.
 */

/**
 * Test type definitions with their expected fields.
 * Used for form building and validation.
 */
export const TEST_TYPES = {
  CMJ: {
    label: 'Counter-Movement Jump (CMJ)',
    device: 'Force Plate',
    fields: [
      { key: 'jump_height',          label: 'Jump Height (cm)',          paramKey: 'cmj.jump_height' },
      { key: 'rsi_mod',              label: 'RSI-modified (m/s)',        paramKey: 'cmj.rsi_mod' },
      { key: 'flight_time_ct_ratio', label: 'FT:CT Ratio',              paramKey: 'cmj.flight_time_ct_ratio' },
      { key: 'peak_force',           label: 'Peak Force (N/kg)',         paramKey: 'cmj.peak_force' },
      { key: 'peak_power',           label: 'Peak Power (W/kg)',         paramKey: 'cmj.peak_power' },
      { key: 'ecc_duration',         label: 'Eccentric Duration (ms)',   paramKey: 'cmj.ecc_duration' },
      { key: 'ecc_braking_rfd',      label: 'Ecc Braking RFD (N/s)',    paramKey: 'cmj.ecc_braking_rfd' },
      { key: 'conc_impulse',         label: 'Concentric Impulse (N·s)', paramKey: 'cmj.conc_impulse' },
      { key: 'landing_asym',         label: 'Landing Asymmetry (%)',     paramKey: 'cmj.landing_asym' },
      { key: 'conc_impulse_asym',    label: 'Conc Impulse Asymmetry (%)', paramKey: 'cmj.conc_impulse_asym' },
    ],
  },
  NordBord: {
    label: 'NordBord (Eccentric Hamstring)',
    device: 'NordBord',
    fields: [
      { key: 'peak_force_l',  label: 'Peak Force Left (N)',    paramKey: 'nordbord.peak_force_l' },
      { key: 'peak_force_r',  label: 'Peak Force Right (N)',   paramKey: 'nordbord.peak_force_r' },
      { key: 'asymmetry',     label: 'Asymmetry (%)',          paramKey: 'nordbord.asymmetry', computed: true },
    ],
  },
  IMTP: {
    label: 'Isometric Mid-Thigh Pull (IMTP)',
    device: 'Force Plate / DynaMo',
    fields: [
      { key: 'peak_force', label: 'Peak Force (N/kg)',      paramKey: 'imtp.peak_force' },
      { key: 'rfd_100',    label: 'RFD 0-100ms (N/s)',      paramKey: 'imtp.rfd_100' },
      { key: 'rfd_200',    label: 'RFD 0-200ms (N/s)',      paramKey: 'imtp.rfd_200' },
    ],
  },
  sprint_fv: {
    label: 'Sprint Force-Velocity Profile',
    device: 'Timing Gates / Radar',
    fields: [
      { key: 'f0',    label: 'F0 (N/kg)',      paramKey: 'sprint_fv.f0' },
      { key: 'v0',    label: 'V0 (m/s)',        paramKey: 'sprint_fv.v0' },
      { key: 'pmax',  label: 'Pmax (W/kg)',     paramKey: 'sprint_fv.pmax' },
      { key: 'rfmax', label: 'RFmax (%)',        paramKey: 'sprint_fv.rfmax' },
      { key: 'drf',   label: 'DRF (%/m/s)',     paramKey: 'sprint_fv.drf' },
    ],
  },
  groin: {
    label: 'Hip / Groin Assessment',
    device: 'ForceFrame / Dynamometer',
    fields: [
      { key: 'adductor_squeeze', label: 'Adductor Squeeze (N)',  paramKey: 'groin.adductor_squeeze' },
      { key: 'ad_ab_ratio',      label: 'AD:AB Ratio',           paramKey: 'groin.ad_ab_ratio' },
    ],
  },
  rom: {
    label: 'ROM / Movement Quality',
    device: 'Goniometer / HumanTrak',
    fields: [
      { key: 'ankle_df', label: 'Ankle DF (°)',   paramKey: 'rom.ankle_df' },
      { key: 'hip_ir',   label: 'Hip IR ROM (°)',  paramKey: 'rom.hip_ir' },
    ],
  },
  body_comp: {
    label: 'Body Composition',
    device: 'DEXA / InBody / Calipers',
    fields: [
      { key: 'mass',      label: 'Body Mass (kg)',     paramKey: 'body.mass' },
      { key: 'lean_mass', label: 'Lean Body Mass (kg)', paramKey: 'body.lean_mass' },
      { key: 'fat_pct',   label: 'Body Fat %',          paramKey: 'body.fat_pct' },
    ],
  },
  endurance: {
    label: 'Endurance / Aerobic',
    device: '30-15 IFT / Yo-Yo',
    fields: [
      { key: 'vift',     label: 'VIFT (km/h)',             paramKey: 'endurance.vift' },
      { key: 'yoyo_ir1', label: 'Yo-Yo IR1 Distance (m)',  paramKey: 'endurance.yoyo_ir1' },
    ],
  },
  grip: {
    label: 'Grip Strength',
    device: 'Dynamometer',
    fields: [
      { key: 'strength_dom', label: 'Grip Strength Dom (kg)', paramKey: 'grip.strength_dom' },
    ],
  },
}

/**
 * Convert a practitioner test entry into universal parameter records.
 *
 * @param {string} testType - One of the TEST_TYPES keys
 * @param {Object} testData - Key-value pairs matching the test type fields
 * @param {string} testDate - ISO date string
 * @returns {Object} Map of { paramKey: { value, recordedAt } }
 */
export function adaptPractitionerTest(testType, testData, testDate) {
  const typeDef = TEST_TYPES[testType]
  if (!typeDef || !testData) return {}

  const recordedAt = testDate
  const params = {}

  for (const field of typeDef.fields) {
    let value = testData[field.key]

    // Auto-compute NordBord asymmetry if not provided
    if (field.computed && field.key === 'asymmetry' && value == null) {
      const l = parseFloat(testData.peak_force_l)
      const r = parseFloat(testData.peak_force_r)
      if (!isNaN(l) && !isNaN(r) && Math.max(l, r) > 0) {
        value = Math.abs(l - r) / Math.max(l, r) * 100
      }
    }

    if (value != null && !isNaN(Number(value))) {
      params[field.paramKey] = { value: Number(value), recordedAt }
    }
  }

  return params
}

/**
 * Adapt multiple practitioner tests for a player on a given date range.
 * Merges all test results into a single parameter map.
 * If the same parameter appears in multiple tests, the most recent wins.
 *
 * @param {Object[]} tests - Array of { test_type, data, test_date }
 * @returns {Object} Merged parameter map
 */
export function adaptMultipleTests(tests) {
  if (!tests || !tests.length) return {}

  // Sort by date ascending so later tests overwrite earlier ones
  const sorted = [...tests].sort((a, b) =>
    new Date(a.test_date) - new Date(b.test_date)
  )

  const merged = {}
  for (const test of sorted) {
    const params = adaptPractitionerTest(test.test_type, test.data, test.test_date)
    Object.assign(merged, params)
  }

  return merged
}
