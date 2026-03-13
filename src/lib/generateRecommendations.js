/**
 * Generate up to 12 recommendations per player based on computed metrics.
 * All recommendations reference the Football Sports Science Knowledge Base.
 *
 * @param {Object} metrics - Output from computeMetrics()
 * @param {number} personalMaxSpeed - Player's recorded max speed (km/h)
 * @returns {{ type: string, title: string, text: string, ref: string }[]}
 */
export function generateRecommendations(metrics, personalMaxSpeed) {
  const recs = []
  const push = (rec) => { if (recs.length < 12) recs.push(rec) }

  const acwr = metrics.acwr_total_distance
  const acwrNrg = metrics.acwr_nrg
  const monotony = metrics.monotony
  const loadHsr = metrics.load_pct_hsr
  const loadSprint = metrics.load_pct_sprint
  const loadHmld = metrics.load_pct_hmld
  const loadAcc = metrics.load_pct_acc
  const loadDec = metrics.load_pct_dec
  const loadNrg = metrics.load_pct_nrg
  const injuryRisk = metrics.injury_risk
  const fatigueIndex = metrics.fatigue_index
  const rtt = metrics.rtt
  const rs = metrics.rs

  // Rule 1: ACWR Zone (Total Distance)
  if (acwr !== null) {
    if (acwr > 1.5) {
      push({
        type: 'alert',
        title: 'Reduce Training Load Immediately',
        text: `ACWR of ${acwr.toFixed(2)} is in the danger zone (>1.5), associated with a 2–4× elevated non-contact injury risk (Gabbett 2016). Reduce next week's load by 30–40%, prioritising low-intensity sessions (MD+1, MD+2 protocols) and avoiding sprint work above 90% Vmax until ACWR returns below 1.3. Cross-reference with HRV and Hooper Index before reintroducing high-intensity content. The fitness-fatigue model (Banister et al. 1975) indicates that a 1–2 week taper reducing volume by 40–60% while maintaining intensity will allow fatigue to dissipate faster than fitness, producing a recovery window.`,
        ref: 'Gabbett TJ (2016); Hulin et al. (2016); Banister et al. (1975); §5.2, §5.4, §6.2',
      })
    } else if (acwr >= 1.3) {
      push({
        type: 'caution',
        title: 'Monitor Load Closely Next Week',
        text: `ACWR of ${acwr.toFixed(2)} sits in the caution zone (1.3–1.5). Avoid further intensification next week. Maintain current volume or reduce by 10–15%, and ensure the MD+1 and MD+2 recovery protocols are strictly followed. Neuromuscular status (CMJ flight time:contraction time ratio) should be checked before high-intensity reintroduction. A >5% reduction in CMJ height from individual baseline indicates meaningful neuromuscular fatigue (Gathercole et al. 2015).`,
        ref: 'Gabbett TJ (2016); Gathercole et al. (2015); §5.2, §7.1, §8.3',
      })
    } else if (acwr < 0.8) {
      push({
        type: 'caution',
        title: 'Load Below Optimal — Consider Progressive Increase',
        text: `ACWR of ${acwr.toFixed(2)} suggests this week's load was below the chronic training baseline. If this reflects a scheduled deload within a mesocycle structure (Week 3 recovery phase per §10.1), no action is required. If unplanned, a structured progressive overload across the next 2–3 weeks (no more than 10% weekly increase) is recommended. The training-injury prevention paradox (Gabbett 2016) demonstrates that maintaining load below 0.8× chronic for multiple consecutive weeks reduces the body's capacity to tolerate match demands and elevates injury risk when loads eventually spike.`,
        ref: 'Gabbett TJ (2016); Malone et al. (2017); §5.2, §5.4, §10.1',
      })
    } else {
      push({
        type: 'positive',
        title: 'ACWR Within Optimal Range',
        text: `ACWR of ${acwr.toFixed(2)} is within the 0.8–1.3 sweet spot, the zone associated with lowest injury risk and appropriate training stimulus (Gabbett 2016). Maintain current load structure for next week, ensuring the MD-based distribution of hard and easy days is preserved. This supports the fitness-fatigue model principle where fitness adaptations accumulate (τ₁ ≈ 42–50 days) while fatigue is managed through session-level variation (τ₂ ≈ 7–14 days).`,
        ref: 'Gabbett TJ (2016); Banister et al. (1975); §5.2, §6.1, §8.1',
      })
    }
  }

  // Rule 2: Fatigue Index
  if (fatigueIndex !== null) {
    if (fatigueIndex > 5.0) {
      push({
        type: 'alert',
        title: 'High Fatigue Index — Internal Load Disproportionate',
        text: `Fatigue Index of ${fatigueIndex.toFixed(2)} indicates the cardiovascular (internal) cost of training significantly exceeds the mechanical (external) output. The heart is working disproportionately hard for the external work produced, a hallmark of accumulated fatigue. This pattern is associated with non-functional overreaching (Meeusen et al. 2013). Recommended actions: reduce next session intensity by 30–40%, prioritise recovery protocols (contrast baths, sleep extension to 9–10h per Mah et al. 2011), and monitor morning HRV (RMSSD >5% below baseline indicates under-recovery). Do not return to high-intensity training until Fatigue Index drops below 5.0.`,
        ref: 'Meeusen et al. (2013); Mah et al. (2011); Banister et al. (1975); §6.1, §7.3',
      })
    } else if (fatigueIndex > 0.5) {
      push({
        type: 'caution',
        title: 'Mild Fatigue Detected — Monitor Recovery',
        text: `Fatigue Index of ${fatigueIndex.toFixed(2)} indicates mild fatigue — the internal cardiovascular cost is slightly elevated relative to external output. This is within manageable range but should be monitored. Ensure the next training day follows the MD-based recovery protocol: MD+1 should be active recovery (HR <65% HRmax, total distance <2000m, no sprinting) and MD+2 should ideally be a full rest day (associated with 2–3× lower non-contact injury rates per Dupont et al. 2010).`,
        ref: 'Dupont et al. (2010); Saw et al. (2016); §7.3, §8.3',
      })
    } else if (fatigueIndex <= -0.1) {
      push({
        type: 'positive',
        title: 'Low Fatigue — Recovery Status Favorable',
        text: `Fatigue Index of ${fatigueIndex.toFixed(2)} indicates low fatigue. The player's cardiovascular system is efficiently supporting the external work demands without disproportionate strain. This is an optimal state for introducing higher-intensity training content or maintaining current loading. Recovery protocols are adequate.`,
        ref: 'Banister et al. (1975); Saw et al. (2016); §6.1',
      })
    }
  }

  // Rule 3: Mechanical Load
  if (metrics.mechanical_load) {
    const acwrMech = metrics.acwr_mechanical
    if (acwrMech !== null) {
      if (acwrMech > 1.4) {
        const pctOver = Math.round((acwrMech - 1) * 100)
        push({
          type: 'alert',
          title: 'Mechanical Overload — Soft Tissue Risk Elevated',
          text: `The week's combined acceleration and deceleration volume exceeded the 4-week chronic baseline by ${pctOver}%. High-intensity acc/dec spikes are primary drivers of eccentric overload in the hamstrings and quadriceps (Dalen et al. 2016). Metabolic power analysis reveals that 26% of match distance accounts for 42% of total energy expenditure through these acceleration-based mechanisms (Osgnach et al. 2010). Reduce high-deceleration drills next session, avoid plyometric loading, and ensure 48h between sessions with high mechanical demand.`,
          ref: 'Dalen et al. (2016); Osgnach et al. (2010); §1.2, §2.1',
        })
      } else if (acwrMech > 1.2) {
        push({
          type: 'caution',
          title: 'Mechanical Load Rising — Monitor Soft Tissue Response',
          text: `Acceleration/deceleration volume is trending upward relative to the chronic baseline. A moderate increase is acceptable within progressive overload, but exceeding 1.4× chronic mechanical load in a single week significantly elevates soft tissue injury risk. Short biceps femoris fascicle length (<10.6 cm) confers 4× greater hamstring injury risk (Timmins et al. 2016), and eccentric overload from high acc/dec volumes compounds this risk. Ensure Nordic Hamstring Curl maintenance (1×/week in-season, 3×12 reps per Petersen et al. 2011).`,
          ref: 'Dalen et al. (2016); Timmins et al. (2016); Petersen et al. (2011); §2.1, §17.1',
        })
      }
    }
  }

  // Rule 4: Training Monotony
  if (monotony !== null && isFinite(monotony)) {
    if (monotony > 2.0) {
      push({
        type: 'alert',
        title: 'High Training Monotony — Load Variability Too Low',
        text: `Training monotony of ${monotony.toFixed(2)} indicates day-to-day load variation is insufficient. Foster et al. (2001) demonstrated that monotony values above 2.0 are associated with overreaching, illness, and injury. Strain (weekly load × monotony) values >6,000 AU are a combined warning signal. The microcycle should follow tactical periodization principles (Frade): horizontal alternation of dominant energy systems across consecutive days, with clear separation between MD-4 high-intensity (SSGs 3v3/4v4, sprint work) and MD+1/+2 recovery (pool, mobility, HR <65% HRmax).`,
        ref: 'Foster et al. (2001); §3.1, §8.1, §11.4',
      })
    } else if (monotony > 1.5) {
      push({
        type: 'caution',
        title: 'Moderate Monotony — Increase Day-to-Day Load Variation',
        text: `Monotony of ${monotony.toFixed(2)} indicates moderate load uniformity. The target for a well-structured microcycle is below 1.5, following the MD-based structure where MD-4 is the highest intensity day (60–70% match sRPE, 70–80% match HSR), MD-3 is moderate (70–80% sRPE), and MD+1/+2 are recovery (<30% sRPE). Adjusting session intensity distribution will reduce monotony and improve supercompensation quality.`,
        ref: 'Foster et al. (2001); §3.1, §8.1',
      })
    }
  }

  // Rule 5: HSR Achievement
  if (loadHsr !== null) {
    if (loadHsr < 70) {
      push({
        type: 'info',
        title: 'High-Speed Running Underdone — Injury Risk on Match Day Elevated',
        text: `Zone 4+5 distance reached only ${loadHsr.toFixed(0)}% of the weekly match reference target. Insufficient high-speed running exposure in training is a significant injury risk factor when match demands then require it at full intensity (Malone et al. 2017). Recommended weekly HSR training volume should be 0.6–0.9× match load for lowest injury risk. Volumes below 0.5× match load are associated with elevated injury risk. Add a dedicated speed-endurance or transition game session to address the deficit.`,
        ref: 'Malone et al. (2017); §2.4, §8.2',
      })
    } else if (loadHsr > 150) {
      push({
        type: 'caution',
        title: 'High-Speed Volume Exceeds Safe Limit',
        text: `Zone 4+5 distance exceeded the weekly target by ${(loadHsr - 100).toFixed(0)}%. While high-speed exposure is essential for maintaining hamstring muscle architecture and fast-twitch activation, training volumes above 1.2× match load are associated with elevated hamstring strain risk (Malone et al. 2017). Biceps femoris fascicle length gains from NHC training reverse within 2 weeks of detraining (Bourne et al. 2017), making the balance between exposure and overload critical.`,
        ref: 'Malone et al. (2017); Bourne et al. (2017); §2.4, §17.2',
      })
    }
  }

  // Rule 6: Sprint Exposure
  if (loadSprint !== null && loadSprint < 100) {
    push({
      type: 'caution',
      title: 'Sprint Exposure Deficit — Speed Residual at Risk',
      text: `Weekly sprint volume reached only ${loadSprint.toFixed(0)}% of the match sprint reference. Sprint fitness has one of the shortest residual training effects (5 ± 3 days — Issurin 2008), meaning speed qualities decay rapidly without repeated maximal sprint stimuli. A dedicated sprint top-up session (10–15 efforts at >90% Vmax with full recovery between reps) is recommended before match day. Speed (max velocity) requires the most frequent maintenance training of all physical qualities.`,
      ref: 'Issurin VB (2008); Malone et al. (2017); §6.3, §11.5',
    })
  }

  // Rule 7: Max Speed Exposure
  if (personalMaxSpeed && metrics.top_speed) {
    const speedPct = metrics.top_speed / personalMaxSpeed
    if (speedPct < 0.90) {
      push({
        type: 'caution',
        title: 'Max Speed Exposure Missing This Week',
        text: `Top speed this week (${metrics.top_speed.toFixed(1)} km/h) did not reach 90% of the player's recorded maximum (${personalMaxSpeed.toFixed(1)} km/h). Regular exposure to near-maximal sprint velocities is required to maintain hamstring muscle architecture and fast-twitch fibre activation. The MD-1 activation session should include 3–5 maximal acceleration efforts (20–30m at 95–100% Vmax) to preserve the speed residual. Football-specific: most match sprints are <20m (acceleration dominant — Cometti et al. 2001), making acceleration training the priority.`,
        ref: 'Issurin VB (2008); Cometti et al. (2001); §6.3, §16.3',
      })
    }
  }

  // Rule 8: HMLD Achievement
  if (loadHmld !== null && loadHmld < 70) {
    push({
      type: 'info',
      title: 'HMLD Underdone — Metabolic Acceleration Stimulus Insufficient',
      text: `High Metabolic Load Distance reached ${loadHmld.toFixed(0)}% of the weekly target. HMLD captures high-intensity efforts that GPS speed thresholds miss — particularly accelerations and decelerations at moderate absolute speeds. Traditional speed-threshold methods underestimate energy cost of these actions because high-intensity efforts frequently occur at low absolute speeds (Osgnach et al. 2010). SSG formats (3v3, 4v4 on reduced pitch) are effective for increasing HMLD density without increasing total running volume.`,
      ref: 'Osgnach et al. (2010); §1.2, §2.1, §9.1',
    })
  }

  // Rule 9: Acc/Dec Volume
  if ((loadAcc !== null && loadAcc < 70) || (loadDec !== null && loadDec < 70)) {
    push({
      type: 'info',
      title: 'Acceleration/Deceleration Volume Below Target',
      text: `Acceleration and/or deceleration counts are below 70% of the match reference. High-intensity acc/dec contribute to neuromuscular preparation for match demands. SSG formats (3v3, 4v4 on reduced pitch) can increase acc/dec density. Pressing rules ("press immediately upon ball loss") increase physical intensity by 6–12% HR (Casamichana et al. 2014), while reducing player numbers and pitch size drives more acc/dec per minute. Ensure at least one SSG-dominant session per microcycle.`,
      ref: 'Dalen et al. (2016); Casamichana et al. (2014); §2.1, §9.1, §9.4',
    })
  }

  // Rule 10: NRG Overload
  if (loadNrg !== null && loadNrg > 130) {
    push({
      type: 'caution',
      title: 'Metabolic Overload — Weekly Energy Expenditure Exceeded Target',
      text: `Weekly NRG expenditure exceeded the prescribed target by ${(loadNrg - 100).toFixed(0)}%. Consistent metabolic overloading leads to non-functional overreaching and suppression of the testosterone:cortisol ratio — T:C ratio <0.025 indicates overreaching risk (Meeusen et al. 2013). Reduce session duration or intensity in the next 1–2 training days. Carbohydrate replenishment (1–1.5 g/kg within 30 min post-session) is critical for glycogen resynthesis. Estimated match energy expenditure is ~65 kJ/kg (~1,600 kcal for 75 kg player) — weekly totals should be managed accordingly.`,
      ref: 'Meeusen et al. (2013); Osgnach et al. (2010); §1.2, §10.2',
    })
  }

  // Rule 11: Readiness to Train low
  if (rtt !== null && rtt < 40) {
    push({
      type: 'alert',
      title: 'Low Readiness to Train — Load and Recovery Imbalance',
      text: `RTT of ${(rtt / 10).toFixed(1)}/10 indicates the player's training load is poorly calibrated relative to match demands and/or the acute-to-chronic workload balance is unfavorable. Priority: review the weekly load prescription against the MD-based microcycle structure (§8.1). The optimal weekly HSR distribution targets MD-4 at 70–80% match HSR, MD-3 at 55–65%, MD-2 at 40–55%, and MD-1 at 25–35%. Ensure recovery days are genuinely low-load (MD+1: <30% sRPE, MD+2: rest or <20%).`,
      ref: 'Malone et al. (2015); §5.4, §8.1, §8.2',
    })
  }

  // Rule 12: Injury Risk Score
  if (injuryRisk > 60) {
    const factors = []
    if (acwr !== null && acwr > 1.3) factors.push(`ACWR spike (${acwr.toFixed(2)})`)
    const acwrMech = metrics.acwr_mechanical
    if (acwrMech !== null && acwrMech > 1.3) factors.push('mechanical overload')
    if (monotony !== null && isFinite(monotony) && monotony > 2.0) factors.push(`training monotony (${monotony.toFixed(2)})`)
    if (personalMaxSpeed && metrics.top_speed && metrics.top_speed / personalMaxSpeed < 0.90) factors.push('speed deficit')
    if (fatigueIndex !== null && fatigueIndex > 5.0) factors.push(`high fatigue index (${fatigueIndex.toFixed(2)})`)
    if (factors.length === 0) factors.push('combined low-magnitude risk factors')
    const factorList = factors.slice(0, 4).join(', ')

    push({
      type: 'alert',
      title: 'Elevated Injury Risk — Multiple Risk Factors Active',
      text: `The composite injury risk score of ${(injuryRisk / 10).toFixed(1)}/10 reflects simultaneous activation of multiple risk factors this week. Key contributors: ${factorList}. Immediate load reduction and a full wellness assessment (Hooper Index, CMJ flight time, subjective fatigue score, morning HRV) are recommended before the next high-intensity session. Scheduling a rest day on MD+2 is associated with 2–3× lower non-contact injury rates (Dupont et al. 2010). Clearance from the sports science team is advised before returning to match-intensity training.`,
      ref: 'Gabbett TJ (2016); Dupont et al. (2010); Hooper & Mackinnon (1995); §5.2, §7.3, §4.1',
    })
  }

  return recs
}
