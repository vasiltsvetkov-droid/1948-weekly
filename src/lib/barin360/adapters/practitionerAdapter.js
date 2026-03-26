/**
 * Barin Sports 360 — Practitioner Test Adapter
 *
 * Parses real device CSV/TSV exports from:
 *   - ForceDecks (CMJ, DJ, SJ, SLDJ)
 *   - NordBord (ISO Prone)
 *   - ForceFrame (Hip AD/AB, Knee Flex/Ext)
 *   - DynaMo (ROM measurements)
 *   - Sprint F-V Profile (Samozino-Morin)
 *   - RAST (Repeated Anaerobic Sprint Test)
 *   - GPS Acc/Dec summary
 *
 * Each parser returns: [{ playerName, testDate, testType, data, params }]
 * where params is a universal parameter map for compute360.
 */

// ─── Helper: find column by partial match ───
function col(row, ...patterns) {
  for (const p of patterns) {
    const key = Object.keys(row).find(k => k.toLowerCase().includes(p.toLowerCase()))
    if (key && row[key] !== '' && row[key] != null) return Number(row[key])
  }
  return null
}

function str(row, ...patterns) {
  for (const p of patterns) {
    const key = Object.keys(row).find(k => k.toLowerCase().includes(p.toLowerCase()))
    if (key && row[key]) return String(row[key]).trim()
  }
  return null
}

// ─── ForceDecks CMJ Parser ───
export function parseForcedecksCMJ(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    const date = str(row, 'Date')
    if (!name) return null

    const data = {
      jump_height: col(row, 'Jump Height (Flight Time)'),
      rsi_mod: col(row, 'RSI-modified'),
      ft_ct_ratio: col(row, 'Flight Time:Contraction Time'),
      peak_power_bm: col(row, 'Peak Power / BM'),
      peak_force: col(row, 'Concentric Peak Force'),
      ecc_peak_force: col(row, 'Eccentric Peak Force'),
      ecc_braking_rfd: col(row, 'Eccentric Braking RFD [N/s]') || col(row, 'Eccentric Braking RFD'),
      ecc_decel_rfd_bm: col(row, 'Eccentric Deceleration RFD / BM'),
      ecc_duration: null, // not directly in columns but can derive from contraction time
      conc_impulse: col(row, 'Concentric Impulse-100ms [N s]') || col(row, 'Concentric Impulse-100ms'),
      conc_impulse_ratio: col(row, 'Concentric Impulse-100ms:Concentric Impulse'),
      ecc_peak_velocity: col(row, 'Eccentric Peak Velocity'),
      conc_peak_velocity: col(row, 'Concentric Peak Velocity'),
      countermovement_depth: col(row, 'Countermovement Depth'),
      ecc_mean_force: col(row, 'Eccentric Mean Force'),
      body_weight: col(row, 'BW [KG]') || col(row, 'Bodyweight in Kilograms'),
      ecc_peak_power_bm: col(row, 'Eccentric Peak Power / BM'),
      ecc_conc_power_ratio: col(row, 'Eccentric Peak Power:Concentric Peak Power'),
    }

    const params = {}
    const recordedAt = parseDateStr(date)
    const map = (k, v) => { if (v != null && !isNaN(v)) params[k] = { value: v, recordedAt } }

    map('cmj.jump_height', data.jump_height)
    map('cmj.rsi_mod', data.rsi_mod)
    map('cmj.flight_time_ct_ratio', data.ft_ct_ratio)
    map('cmj.peak_power', data.peak_power_bm)
    map('cmj.peak_force', data.peak_force ? data.peak_force / (data.body_weight || 75) : null)
    map('cmj.ecc_braking_rfd', data.ecc_braking_rfd)
    map('cmj.ecc_duration', data.ecc_duration)
    map('cmj.conc_impulse', col(row, 'Concentric Impulse [N s]'))
    map('body.mass', data.body_weight)

    return { playerName: name, testDate: recordedAt, testType: 'CMJ', data, params }
  }).filter(Boolean)
}

// ─── ForceDecks DJ Parser ───
export function parseForcedecksDJ(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    const date = str(row, 'Date')
    if (!name) return null

    const data = {
      jump_height: col(row, 'Jump Height (Imp-Mom)'),
      rsi_ft_ct: col(row, 'RSI (Flight Time/Contact Time)'),
      rsi_jh_ct: col(row, 'RSI (JH (Flight Time)/Contact Time) [m/s]'),
      contact_time: col(row, 'Contact Time'),
      ecc_duration: col(row, 'Eccentric Duration'),
      peak_power_bm: col(row, 'Peak Power / BM') || col(row, 'Peak Drive-Off Force'),
      conc_impulse_r: col(row, 'Concentric Impulse [N s] (R)'),
      conc_impulse_l: col(row, 'Concentric Impulse [N s] (L)'),
      ecc_impulse_r: col(row, 'Eccentric Impulse [N s] (R)'),
      ecc_impulse_l: col(row, 'Eccentric Impulse [N s] (L)'),
      ecc_asym: col(row, 'Eccentric Mean Force % (Asym)'),
      conc_asym: col(row, 'Concentric Mean Force % (Asym)'),
      body_weight: col(row, 'BW [KG]'),
    }

    const params = {}
    const recordedAt = parseDateStr(date)
    const map = (k, v) => { if (v != null && !isNaN(v)) params[k] = { value: v, recordedAt } }

    // DJ RSI feeds C2 and C16
    map('cmj.rsi_mod', data.rsi_jh_ct || data.rsi_ft_ct) // reuse param slot
    map('cmj.jump_height', data.jump_height)
    map('cmj.peak_power', data.peak_power_bm)
    map('cmj.landing_asym', data.ecc_asym ? Math.abs(data.ecc_asym) : null)

    return { playerName: name, testDate: recordedAt, testType: 'DJ', data, params }
  }).filter(Boolean)
}

// ─── ForceDecks SJ Parser ───
export function parseForcedecksSJ(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    const date = str(row, 'Date')
    if (!name) return null

    const data = {
      jump_height: col(row, 'Jump Height (Imp-Mom)'),
      rsi_mod: col(row, 'RSI-modified'),
      peak_power_bm: col(row, 'Peak Power / BM'),
      peak_landing_force: col(row, 'Peak Landing Force [N]'),
      conc_rfd: col(row, 'Concentric RFD'),
      landing_force_r: col(row, 'Peak Landing Force [N] (R)'),
      landing_force_l: col(row, 'Peak Landing Force [N] (L)'),
      body_weight: col(row, 'BW [KG]'),
    }

    const params = {}
    const recordedAt = parseDateStr(date)
    const map = (k, v) => { if (v != null && !isNaN(v)) params[k] = { value: v, recordedAt } }

    map('cmj.peak_power', data.peak_power_bm)
    // Landing asymmetry from SJ
    if (data.landing_force_r && data.landing_force_l) {
      const maxF = Math.max(data.landing_force_r, data.landing_force_l)
      if (maxF > 0) {
        map('cmj.landing_asym', Math.abs(data.landing_force_r - data.landing_force_l) / maxF * 100)
      }
    }

    return { playerName: name, testDate: recordedAt, testType: 'SJ', data, params }
  }).filter(Boolean)
}

// ─── ForceDecks SLDJ Parser ───
export function parseForcedecksSLDJ(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    const date = str(row, 'Date')
    if (!name) return null

    const data = {
      jump_height: col(row, 'Jump Height (Imp-Mom) [cm]'),
      jump_height_l: col(row, 'Jump Height (Imp-Mom) [cm] (L)'),
      jump_height_r: col(row, 'Jump Height (Imp-Mom) [cm] (R)'),
      jump_height_asym: col(row, 'Jump Height (Imp-Mom) [cm] (Asym)'),
      rsi_jh_ct: col(row, 'RSI (JH (Flight Time)/Contact Time) [m/s]'),
      rsi_l: col(row, 'RSI (JH (Flight Time)/Contact Time) [m/s] (L)'),
      rsi_r: col(row, 'RSI (JH (Flight Time)/Contact Time) [m/s] (R)'),
      rsi_asym: col(row, 'RSI (JH (Flight Time)/Contact Time) [m/s] (Asym)'),
      peak_power_bm: col(row, 'Peak Instantaneous Power / BM [W/kg]'),
      power_asym: col(row, 'Peak Instantaneous Power / BM [W/kg] (Asym)'),
      body_weight: col(row, 'BW [KG]'),
    }

    const params = {}
    const recordedAt = parseDateStr(date)
    const map = (k, v) => { if (v != null && !isNaN(v)) params[k] = { value: v, recordedAt } }

    // SLDJ asymmetry is key for ACL risk (C8)
    map('cmj.landing_asym', data.jump_height_asym ? Math.abs(data.jump_height_asym) : null)
    map('cmj.conc_impulse_asym', data.power_asym ? Math.abs(data.power_asym) : null)

    return { playerName: name, testDate: recordedAt, testType: 'SLDJ', data, params }
  }).filter(Boolean)
}

// ─── NordBord Parser ───
export function parseNordBord(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    const date = str(row, 'Date UTC') || str(row, 'Date')
    if (!name) return null

    const data = {
      l_max_force: col(row, 'L Max Force (N)'),
      r_max_force: col(row, 'R Max Force (N)'),
      max_imbalance: col(row, 'Max Imbalance (%)') || col(row, 'Max Imbalance'),
      l_avg_force: col(row, 'L Avg Force (N)'),
      r_avg_force: col(row, 'R Avg Force (N)'),
      avg_imbalance: col(row, 'Avg Imbalance (%)') || col(row, 'Avg Imbalance'),
      l_max_force_per_kg: col(row, 'L Max Force Per Kg'),
      r_max_force_per_kg: col(row, 'R Max Force Per Kg'),
    }

    // Compute asymmetry if not provided
    if (data.max_imbalance == null && data.l_max_force && data.r_max_force) {
      const maxF = Math.max(data.l_max_force, data.r_max_force)
      if (maxF > 0) data.max_imbalance = Math.abs(data.l_max_force - data.r_max_force) / maxF * 100
    }

    const params = {}
    const recordedAt = parseDateStr(date)
    const map = (k, v) => { if (v != null && !isNaN(v)) params[k] = { value: v, recordedAt } }

    map('nordbord.peak_force_l', data.l_max_force)
    map('nordbord.peak_force_r', data.r_max_force)
    map('nordbord.asymmetry', data.max_imbalance != null ? Math.abs(data.max_imbalance) : null)

    return { playerName: name, testDate: recordedAt, testType: 'NordBord', data, params }
  }).filter(Boolean)
}

// ─── ForceFrame Parser ───
export function parseForceFrame(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    const date = str(row, 'Date')
    const test = str(row, 'Test')
    const direction = str(row, 'Direction')
    if (!name || !test) return null

    const data = {
      test_name: test,
      direction,
      l_max_force: col(row, 'L Max Force (N)'),
      r_max_force: col(row, 'R Max Force (N)'),
      max_imbalance: col(row, 'Max Imbalance'),
      l_max_ratio: col(row, 'L Max Ratio'),
      r_max_ratio: col(row, 'R Max Ratio'),
    }

    const params = {}
    const recordedAt = parseDateStr(date)
    const map = (k, v) => { if (v != null && !isNaN(v)) params[k] = { value: v, recordedAt } }

    // Hip AD/AB Squeeze = adductor squeeze strength
    const isHipAdAb = test.toLowerCase().includes('hip ad/ab')
    const isSqueeze = direction?.toLowerCase() === 'squeeze'
    const isPull = direction?.toLowerCase() === 'pull'

    if (isHipAdAb && isSqueeze) {
      // Average of L+R max force for squeeze
      const avgSqueeze = (data.l_max_force && data.r_max_force)
        ? (data.l_max_force + data.r_max_force) / 2
        : data.l_max_force || data.r_max_force
      map('groin.adductor_squeeze', avgSqueeze)

      // AD:AB ratio if we have both squeeze and pull
      if (data.l_max_ratio || data.r_max_ratio) {
        const ratio = data.l_max_ratio || data.r_max_ratio
        map('groin.ad_ab_ratio', ratio)
      }
    }

    return { playerName: name, testDate: recordedAt, testType: 'ForceFrame', data, params }
  }).filter(Boolean)
}

// ─── DynaMo ROM Parser ───
export function parseDynaMoROM(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    const date = str(row, 'Date')
    const movement = str(row, 'Movement')
    const bodyRegion = str(row, 'Body Region')
    if (!name || !movement) return null

    const data = {
      movement,
      body_region: bodyRegion,
      position: str(row, 'Position'),
      l_max_rom: col(row, 'L Max ROM'),
      r_max_rom: col(row, 'R Max ROM'),
      rom_asymmetry: str(row, 'ROM Asymmetry'),
    }

    const params = {}
    const recordedAt = parseDateStr(date)
    const map = (k, v) => { if (v != null && !isNaN(v)) params[k] = { value: v, recordedAt } }

    const mv = movement.toLowerCase()
    const region = (bodyRegion || '').toLowerCase()

    // Ankle dorsiflexion → C8, C16
    if (mv.includes('dorsiflexion') && region.includes('ankle')) {
      // Use the lower of L/R (limiting factor)
      const minDF = Math.min(data.l_max_rom || 999, data.r_max_rom || 999)
      if (minDF < 999) map('rom.ankle_df', minDF)
    }
    // Hip internal rotation → C10, C16
    if (mv.includes('internal rotation') && region.includes('hip')) {
      const minIR = Math.min(data.l_max_rom || 999, data.r_max_rom || 999)
      if (minIR < 999) map('rom.hip_ir', minIR)
    }

    return { playerName: name, testDate: recordedAt, testType: 'DynaMo_ROM', data, params }
  }).filter(Boolean)
}

// ─── Sprint F-V Profile Parser ───
export function parseSprintFV(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    if (!name) return null

    const data = {
      f0: col(row, 'F0 (N/kg)') || col(row, 'F0'),
      v0: col(row, 'V0 (m/s)') || col(row, 'V0'),
      pmax: col(row, 'Pmax (W/kg)') || col(row, 'Pmax'),
      fv_slope: col(row, 'FV Slope') || col(row, 'FV slope'),
      rfmax: col(row, 'RF max (%)') || col(row, 'RF max'),
      drf: col(row, 'Drf (%)') || col(row, 'Drf'),
      vopt: col(row, 'Vopt (m/s)') || col(row, 'Vopt'),
      max_speed: col(row, 'Max Speed (m/s)') || col(row, 'Max Speed'),
    }

    // Convert rfmax from decimal to percentage if needed
    if (data.rfmax && data.rfmax < 1) data.rfmax = data.rfmax * 100

    const params = {}
    // No date in the F-V file, use current date
    const recordedAt = new Date().toISOString().slice(0, 10)
    const map = (k, v) => { if (v != null && !isNaN(v)) params[k] = { value: v, recordedAt } }

    map('sprint_fv.f0', data.f0)
    map('sprint_fv.v0', data.v0)
    map('sprint_fv.pmax', data.pmax)
    map('sprint_fv.rfmax', data.rfmax)
    map('sprint_fv.drf', data.drf)
    // Max speed from sprint → also feeds gps.top_speed equivalent
    map('gps.top_speed', data.max_speed ? data.max_speed * 3.6 : null) // m/s → km/h

    return { playerName: name, testDate: recordedAt, testType: 'sprint_fv', data, params }
  }).filter(Boolean)
}

// ─── RAST Parser ───
export function parseRAST(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    if (!name) return null

    const data = {
      max_power: col(row, 'MaxPO'),
      min_power: col(row, 'MinPO'),
      avg_power: col(row, 'AvPO'),
      fatigue_index: col(row, 'FI'),
      total_time: col(row, 'TOTAL TIME'),
      anaerobic_capacity: col(row, 'AC'),
      relative_peak_power: col(row, 'RPPO'),
    }

    const params = {}
    const recordedAt = new Date().toISOString().slice(0, 10)

    return { playerName: name, testDate: recordedAt, testType: 'RAST', data, params }
  }).filter(Boolean)
}

// ─── GPS Acc/Dec Summary Parser ───
export function parseGPSAccDec(rows) {
  return rows.map(row => {
    const name = str(row, 'Name')
    if (!name) return null

    const data = {
      max_speed: col(row, 'Max Speed'),
      max_acceleration: col(row, 'Max Acceleration'),
      max_deceleration: col(row, 'Max Deceleration'),
    }

    const params = {}
    const recordedAt = new Date().toISOString().slice(0, 10)
    const map = (k, v) => { if (v != null && !isNaN(v)) params[k] = { value: v, recordedAt } }

    map('gps.top_speed', data.max_speed)

    return { playerName: name, testDate: recordedAt, testType: 'GPS_AccDec', data, params }
  }).filter(Boolean)
}

// ─── Auto-detect file type and parse ───
export function autoDetectAndParse(rows, fileName = '') {
  if (!rows?.length) return []
  const headers = Object.keys(rows[0]).join(' ').toLowerCase()
  const fn = fileName.toLowerCase()

  if (headers.includes('rsi-modified') && headers.includes('eccentric braking rfd'))
    return parseForcedecksCMJ(rows)
  if (headers.includes('rsi (flight time/contact time)') || (headers.includes('contact time') && fn.includes('dj')))
    return parseForcedecksDJ(rows)
  if (fn.includes('sldj') || (headers.includes('reps (l)') && headers.includes('reps (r)') && headers.includes('rsi')))
    return parseForcedecksSLDJ(rows)
  if (fn.includes('sj') && headers.includes('concentric rfd'))
    return parseForcedecksSJ(rows)
  if (headers.includes('nordbord') || headers.includes('iso prone') || (headers.includes('l max force') && headers.includes('r max force') && headers.includes('impulse imbalance')))
    return parseNordBord(rows)
  if (headers.includes('forceframe') || (headers.includes('mode') && headers.includes('direction') && headers.includes('l max force')))
    return parseForceFrame(rows)
  if (headers.includes('movement') && headers.includes('body region') && headers.includes('rom'))
    return parseDynaMoROM(rows)
  if (headers.includes('f0') && headers.includes('v0') && headers.includes('pmax'))
    return parseSprintFV(rows)
  if (headers.includes('maxpo') && headers.includes('minpo') && headers.includes('rppo'))
    return parseRAST(rows)
  if (headers.includes('max acceleration') && headers.includes('max deceleration'))
    return parseGPSAccDec(rows)

  return []
}

// ─── Merge params from multiple tests for one player ───
export function mergePlayerParams(testResults) {
  const byPlayer = {}
  for (const result of testResults) {
    const key = result.playerName
    if (!byPlayer[key]) byPlayer[key] = { playerName: key, params: {}, tests: [] }
    Object.assign(byPlayer[key].params, result.params)
    byPlayer[key].tests.push({ testType: result.testType, testDate: result.testDate, data: result.data })
  }
  return Object.values(byPlayer)
}

// ─── Date parsing helper ───
function parseDateStr(dateStr) {
  if (!dateStr) return new Date().toISOString().slice(0, 10)
  // MM/DD/YYYY or M/D/YYYY
  const mdy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10)
  // DD.MM.YYYY
  const dmy = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  return new Date().toISOString().slice(0, 10)
}

// ─── Backward-compatible exports ───
export const TEST_TYPES = {
  CMJ: { label: 'Counter-Movement Jump (CMJ)', device: 'ForceDecks', parser: parseForcedecksCMJ },
  DJ: { label: 'Drop Jump (DJ)', device: 'ForceDecks', parser: parseForcedecksDJ },
  SJ: { label: 'Squat Jump (SJ)', device: 'ForceDecks', parser: parseForcedecksSJ },
  SLDJ: { label: 'Single-Leg Drop Jump (SLDJ)', device: 'ForceDecks', parser: parseForcedecksSLDJ },
  NordBord: { label: 'NordBord (Eccentric Hamstring)', device: 'NordBord', parser: parseNordBord },
  ForceFrame: { label: 'ForceFrame (Hip/Knee)', device: 'ForceFrame', parser: parseForceFrame },
  DynaMo_ROM: { label: 'DynaMo ROM', device: 'DynaMo', parser: parseDynaMoROM },
  sprint_fv: { label: 'Sprint Force-Velocity Profile', device: 'Timing Gates', parser: parseSprintFV },
  RAST: { label: 'RAST (Anaerobic Sprint)', device: 'Timing Gates', parser: parseRAST },
  GPS_AccDec: { label: 'GPS Acc/Dec Summary', device: 'GPS', parser: parseGPSAccDec },
}

export function adaptPractitionerTest(testType, testData, testDate) {
  const parser = TEST_TYPES[testType]?.parser
  if (!parser) return {}
  const results = parser([testData])
  return results[0]?.params || {}
}

export function adaptMultipleTests(tests) {
  const allParams = {}
  for (const t of tests) {
    Object.assign(allParams, adaptPractitionerTest(t.test_type, t.data, t.test_date))
  }
  return allParams
}
