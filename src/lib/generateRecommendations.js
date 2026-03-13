/**
 * Generate up to 9 recommendations per player based on computed metrics.
 *
 * @param {Object} metrics - Output from computeMetrics()
 * @param {number} personalMaxSpeed - Player's recorded max speed (km/h)
 * @returns {{ type: string, title: string, text: string, ref: string }[]}
 */
export function generateRecommendations(metrics, personalMaxSpeed) {
  const recs = []
  const push = (rec) => { if (recs.length < 9) recs.push(rec) }

  const acwr = metrics.acwr_total_distance
  const monotony = metrics.monotony
  const loadHsr = metrics.load_pct_hsr
  const loadSprint = metrics.load_pct_sprint
  const loadHmld = metrics.load_pct_hmld
  const loadAcc = metrics.load_pct_acc
  const loadDec = metrics.load_pct_dec
  const loadNrg = metrics.load_pct_nrg
  const injuryRisk = metrics.injury_risk

  // Rule 1: ACWR Zone
  if (acwr !== null) {
    if (acwr > 1.5) {
      push({
        type: 'alert',
        title: 'Reduce Training Load Immediately',
        text: `ACWR of ${acwr.toFixed(2)} is in the danger zone (>1.5), associated with a 2–4× elevated non-contact injury risk (Gabbett 2016). Reduce next week's load by 30–40%, prioritising low-intensity sessions (MD+1, MD+2 protocols) and avoiding sprint work above 90% Vmax until ACWR returns below 1.3. Cross-reference with HRV and Hooper Index before reintroducing high-intensity content.`,
        ref: 'Gabbett TJ (2016); Hulin et al. (2016); §5.2, §5.4',
      })
    } else if (acwr >= 1.3) {
      push({
        type: 'caution',
        title: 'Monitor Load Closely Next Week',
        text: `ACWR of ${acwr.toFixed(2)} sits in the caution zone (1.3–1.5). Avoid further intensification next week. Maintain current volume or reduce by 10–15%, and ensure the MD+1 and MD+2 recovery protocols are strictly followed. Neuromuscular status (CMJ) should be checked before high-intensity reintroduction.`,
        ref: 'Gabbett TJ (2016); §5.2, §7.1, §8.3',
      })
    } else if (acwr < 0.8) {
      push({
        type: 'caution',
        title: 'Load Below Optimal — Consider Progressive Increase',
        text: `ACWR of ${acwr.toFixed(2)} suggests this week's load was below the chronic training baseline. If this reflects a scheduled deload, no action is required. If unplanned, a structured progressive overload across the next 2–3 weeks (no more than 10% weekly increase) is recommended. Maintaining load below 0.8× chronic for multiple consecutive weeks reduces the body's capacity to tolerate match demands and elevates injury risk when loads eventually spike.`,
        ref: 'Malone et al. (2017); §5.2, §5.4, §10.1',
      })
    } else {
      push({
        type: 'positive',
        title: 'ACWR Within Optimal Range',
        text: `ACWR of ${acwr.toFixed(2)} is within the 0.8–1.3 sweet spot, the zone associated with lowest injury risk and appropriate training stimulus (Gabbett 2016). Maintain current load structure for next week, ensuring the MD-based distribution of hard and easy days is preserved. This range supports fitness development while minimising cumulative fatigue.`,
        ref: 'Gabbett TJ (2016); §5.2, §8.1',
      })
    }
  }

  // Rule 2: Mechanical Load
  if (metrics.mechanical_load && metrics.flags) {
    // We need chronic mechanical from the metrics context — approximate via ACWR mechanical
    const acwrMech = metrics.acwr_mechanical
    if (acwrMech !== null) {
      if (acwrMech > 1.4) {
        const pctOver = Math.round((acwrMech - 1) * 100)
        push({
          type: 'alert',
          title: 'Mechanical Overload — Soft Tissue Risk Elevated',
          text: `The week's combined acceleration and deceleration volume exceeded the 4-week chronic baseline by ${pctOver}%. High-intensity acc/dec spikes are primary drivers of eccentric overload in the hamstrings and quadriceps (Dalen et al. 2016). Reduce high-deceleration drills next session, avoid plyometric loading, and ensure 48h between sessions with high mechanical demand. This pattern is associated with elevated groin and hamstring strain risk.`,
          ref: 'Dalen et al. (2016); Osgnach et al. (2010); §2.1',
        })
      } else if (acwrMech > 1.2) {
        push({
          type: 'caution',
          title: 'Mechanical Load Rising — Monitor Soft Tissue Response',
          text: `Acceleration/deceleration volume is trending upward relative to the chronic baseline. A moderate increase is acceptable within progressive overload, but exceeding 1.4× chronic mechanical load in a single week significantly elevates soft tissue injury risk (Dalen et al. 2016). Ensure subsequent sessions allow 24–48h of reduced mechanical demand before repeating high acc/dec content.`,
          ref: 'Dalen et al. (2016); §2.1, §8.3',
        })
      }
    }
  }

  // Rule 3: Training Monotony
  if (monotony !== null && isFinite(monotony)) {
    if (monotony > 2.0) {
      push({
        type: 'alert',
        title: 'High Training Monotony — Load Variability Too Low',
        text: `Training monotony of ${monotony.toFixed(2)} indicates day-to-day load variation is insufficient. Foster et al. (2001) demonstrated that monotony values above 2.0 are associated with overreaching, illness, and injury. The microcycle should alternate clearly between high-load days (MD-2, match intensity) and recovery days (MD+1, MD+2). Introducing small-sided games on hard days and mobility/pool work on easy days will reduce monotony without reducing total weekly load.`,
        ref: 'Foster et al. (2001); §3.1, §8.1',
      })
    } else if (monotony > 1.5) {
      push({
        type: 'caution',
        title: 'Moderate Monotony — Increase Day-to-Day Load Variation',
        text: `Monotony of ${monotony.toFixed(2)} indicates moderate load uniformity across training days. The target profile for a well-structured microcycle is a monotony value below 1.5, with clear separation between hard and easy days. Adjusting session intensity distribution — increasing the contrast between MD-2 peak days and MD+1 recovery days — will reduce this value and improve supercompensation quality.`,
        ref: 'Foster et al. (2001); §3.1, §8.1',
      })
    }
  }

  // Rule 4: HSR Achievement
  if (loadHsr !== null) {
    if (loadHsr < 70) {
      push({
        type: 'info',
        title: 'High-Speed Running Underdone — Injury Risk on Match Day Elevated',
        text: `Zone 4+5 distance reached only ${loadHsr.toFixed(0)}% of the weekly match reference target. Insufficient high-speed running exposure in training is a significant injury risk factor when match demands then require it at full intensity (Malone et al. 2017). At least 0.6–0.9× match HSR load should be achieved weekly for adequate soft-tissue preparation. Add a dedicated speed-endurance or transition game session to address the deficit.`,
        ref: 'Malone et al. (2017); §2.4, §8.2',
      })
    } else if (loadHsr > 150) {
      push({
        type: 'caution',
        title: 'High-Speed Volume Exceeds Safe Limit',
        text: `Zone 4+5 distance exceeded the weekly target by ${(loadHsr - 100).toFixed(0)}%. While high-speed exposure is essential, training volumes above 1.2× match load are associated with elevated hamstring strain risk (Malone et al. 2017). Ensure subsequent sessions allow adequate soft-tissue recovery. Avoid repeating high-speed running sessions within 48h of this loading spike.`,
        ref: 'Malone et al. (2017); §2.4, §19',
      })
    }
  }

  // Rule 5: HMLD Achievement
  if (loadHmld !== null && loadHmld < 70) {
    push({
      type: 'info',
      title: 'HMLD Underdone — Metabolic Acceleration Stimulus Insufficient',
      text: `High Metabolic Load Distance reached ${loadHmld.toFixed(0)}% of the weekly target. HMLD captures high-intensity efforts that GPS speed thresholds miss — particularly accelerations and decelerations at moderate absolute speeds. Osgnach et al. (2010) showed that 26% of match distance accounts for 42% of total energy expenditure via this mechanism. Insufficient HMLD exposure means the metabolic and neuromuscular demands of acceleration-based actions are underprepared for match day.`,
      ref: 'Osgnach et al. (2010); §1.2, §2.1',
    })
  }

  // Rule 6: Sprint Exposure
  if (loadSprint !== null && loadSprint < 100) {
    push({
      type: 'caution',
      title: 'Sprint Exposure Deficit — Speed Residual at Risk',
      text: `Weekly sprint volume reached only ${loadSprint.toFixed(0)}% of the match sprint reference. Sprint fitness has one of the shortest residual training effects (approximately 5 ± 3 days — Issurin 2008), meaning speed qualities decay rapidly without repeated maximal sprint stimuli. A dedicated sprint top-up session (10–15 efforts at >90% Vmax with full recovery between reps) is recommended before match day to restore the speed residual.`,
      ref: 'Malone et al. (2017); Issurin VB (2008); §6.3',
    })
  }

  if (personalMaxSpeed && metrics.top_speed) {
    const speedPct = metrics.top_speed / personalMaxSpeed
    if (speedPct < 0.90) {
      push({
        type: 'caution',
        title: 'Max Speed Exposure Missing This Week',
        text: `Top speed this week (${metrics.top_speed.toFixed(1)} km/h) did not reach 90% of the player's recorded maximum (${personalMaxSpeed.toFixed(1)} km/h). Regular exposure to near-maximal sprint velocities is required to maintain hamstring muscle architecture and fast-twitch fibre activation. A minimum of two maximal acceleration efforts per microcycle is recommended to preserve speed residuals and reduce the neuromuscular risk of maximal sprinting in matches without prior training stimulus.`,
        ref: 'Issurin VB (2008); §6.3, §16',
      })
    }
  }

  // Rule 7: Acc/Dec Volume
  if ((loadAcc !== null && loadAcc < 70) || (loadDec !== null && loadDec < 70)) {
    push({
      type: 'info',
      title: 'Acceleration/Deceleration Volume Below Target',
      text: `Acceleration and/or deceleration counts are below 70% of the match reference. High-intensity acc/dec are primary contributors to total energy expenditure and soft-tissue loading — particularly eccentric demand on quadriceps and hamstrings (Osgnach et al. 2010; Dalen et al. 2016). SSG formats (3v3, 4v4 on reduced pitch) are an effective prescription for increasing acc/dec density without increasing total running volume. Ensure at least one SSG-dominant session per microcycle.`,
      ref: 'Dalen et al. (2016); Osgnach et al. (2010); §2.1, §9.1',
    })
  }

  // Rule 8: NRG Overload
  if (loadNrg !== null && loadNrg > 130) {
    push({
      type: 'caution',
      title: 'Metabolic Overload — Weekly Energy Expenditure Exceeded Target',
      text: `Weekly NRG expenditure exceeded the prescribed target by ${(loadNrg - 100).toFixed(0)}%. Consistent metabolic overloading without adequate recovery leads to non-functional overreaching and suppression of the testosterone:cortisol ratio (Meeusen et al. 2013). Reduce session duration or intensity in the next 1–2 training days. Prioritise nutritional recovery — carbohydrate replenishment within 30 minutes post-session is critical for glycogen resynthesis at this load level.`,
      ref: 'Meeusen et al. (2013); §10.2',
    })
  }

  // Rule 9: Injury Risk Score
  if (injuryRisk > 60) {
    const factors = []
    if (acwr !== null && acwr > 1.3) factors.push(`ACWR spike (${acwr.toFixed(2)})`)
    const acwrMech = metrics.acwr_mechanical
    if (acwrMech !== null && acwrMech > 1.3) factors.push('mechanical overload')
    if (monotony !== null && isFinite(monotony) && monotony > 2.0) factors.push(`training monotony (${monotony.toFixed(2)})`)
    if (personalMaxSpeed && metrics.top_speed && metrics.top_speed / personalMaxSpeed < 0.90) factors.push('speed deficit')
    if (factors.length === 0) factors.push('combined low-magnitude risk factors')
    const factorList = factors.slice(0, 3).join(', ')

    push({
      type: 'alert',
      title: 'Elevated Injury Risk — Multiple Risk Factors Active',
      text: `The composite injury risk score of ${(injuryRisk / 10).toFixed(1)}/10 reflects simultaneous activation of multiple risk factors this week. Key contributors: ${factorList}. Immediate load reduction and a full wellness assessment (Hooper Index, CMJ, subjective fatigue score) are recommended before the next high-intensity session. Clearance from the sports science team is advised before returning to match-intensity training.`,
      ref: 'Gabbett TJ (2016); Hulin et al. (2016); §5.2, §9',
    })
  }

  return recs
}
