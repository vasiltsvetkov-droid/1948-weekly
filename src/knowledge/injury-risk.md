# Injury Risk

Knowledge domain covering composite injury risk scoring, risk factors, thresholds, and the injury prevention paradox.

**Source sections:** §5.2–5.4 (ACWR Risk Zones & Implementation), §17.4 (Combined Injury Prevention), §19.5 (Hamstring Injury Risk Factors)

---

## Key Postulates

1. **ACWR >1.5 is associated with 2–4× higher non-contact injury risk** (Gabbett 2016; Hulin et al. 2016). However, ACWR should be used as a clinical guide combined with subjective wellness, HRV, and CMJ data — not as an absolute predictor (Impellizzeri et al. 2020).

2. **The Training-Injury Prevention Paradox:** Well-developed chronic training loads are protective. Under-trained athletes who encounter sudden load spikes face the greatest injury risk. The goal is to build chronic load progressively while avoiding acute spikes >10% per week (Gabbett 2016).

3. **Previous hamstring injury confers 2–3× increased risk** of recurrence (Orchard 2001). Extended RTP criteria and fascicle length monitoring are essential for previously injured players.

4. **Short BFlh fascicle length (<10.6 cm) carries 4× hamstring injury risk** (Timmins et al. 2016). Nordic Hamstring Curl programs increase fascicle length by 12–24% in 6–10 weeks but gains reverse within 2 weeks of detraining — year-round maintenance is mandatory (Bourne et al. 2017).

5. **73% of hamstring injuries occur in the 2nd half of matches** (Arnason 2004), implicating fatigue as a primary driver. Adequate match fitness and load management are the first line of defense.

6. **FIFA 11+ warm-up program reduces total injury rate by 37% and severe injuries by 29%** (Soligard et al. 2008). Combined with NHC (51% hamstring injury reduction) and Copenhagen Adductor protocol (41% adductor injury reduction), these form the evidence-based injury prevention stack.

7. **Injury risk remains approximately 2-fold elevated immediately after RTP** with exponential decline toward baseline over ~4 weeks (Gabbett et al. 2017). Load should not exceed 85% of normal in the first week back.

---

## Thresholds & Decision Rules

### Composite Injury Risk Score Weights

| Component | Weight | Metric | Source |
|-----------|--------|--------|--------|
| ACWR (total distance) | 30% | `acwr_total_distance` | Gabbett 2016; Hulin et al. 2016 |
| Mechanical load spike (acc+dec) | 25% | `acwr_mechanical` vs 4-week avg | Dalen et al. 2016 |
| Training Monotony | 20% | `monotony` (mean/SD daily loads) | Foster et al. 2001 |
| Speed deficit | 15% | `top_speed` / `personalMaxSpeed` | Issurin 2008 |
| Chronic load confidence | 10% | Number of prior weeks of data | History reliability |

### ACWR Component Scoring

| ACWR Total Distance | Risk Score (0–100) |
|---------------------|-------------------|
| ≤ 1.3 | 0 |
| 1.3–1.5 | 40 |
| 1.5–1.8 | 70 |
| > 1.8 | 100 |

### Mechanical Load Component Scoring

| Mechanical Ratio (current / 4-wk avg) | Risk Score (0–100) |
|---------------------------------------|-------------------|
| ≤ 1.3 | 0 |
| 1.3–1.4 | 40 |
| 1.4–1.6 | 70 |
| > 1.6 | 100 |

### Monotony Component Scoring

| Monotony Value | Risk Score (0–100) |
|---------------|-------------------|
| ≤ 1.5 | 0 |
| 1.5–2.0 | 40 |
| 2.0–2.5 | 70 |
| > 2.5 or Infinity | 100 |

### Speed Deficit Component Scoring

| Top Speed / Personal Max | Risk Score (0–100) |
|-------------------------|-------------------|
| ≥ 90% | 0 |
| 80–90% | 50 |
| < 80% | 100 |

### Injury Risk Score Zones

| Score (0–100) | Zone | Interpretation |
|--------------|------|----------------|
| 0–30 | Low | Current training load is well-managed |
| 31–49 | Moderate | Monitoring advised; address contributing factors |
| 50–69 | Elevated | Full wellness assessment recommended before next high-intensity session |
| 70–100 | High | Multiple concurrent risk factors; immediate load reduction and MD+2 rest day |

### Hamstring-Specific Risk Factors

| Risk Factor | Relative Risk | Intervention |
|------------|---------------|-------------|
| Previous hamstring injury | 2–3× (Orchard 2001) | Extended RTP criteria; fascicle length monitoring |
| Short BFlh fascicle length (<10.6 cm) | 4× (Timmins 2016) | NHC program; year-round maintenance |
| Fatigue (2nd half of match) | 73% of injuries (Arnason 2004) | Load management; match fitness |
| Insufficient warm-up | Consistent association | FIFA 11+ every session |
| Age > 28 | Increasing risk | Extended pre-season NHC volume |

---

## Analysis Templates

### Injury Risk Zone Classification

```
IF ${injuryRisk} >= 70:
  → HIGH RISK: Injury Risk score of ${injuryRisk} indicates elevated risk
    from multiple concurrent factors. A full wellness assessment (Hooper Index,
    CMJ flight time, morning HRV) is recommended before the next high-intensity
    session. Scheduling a rest day on MD+2 is associated with 2–3× lower
    non-contact injury rates (Dupont et al. 2010).

ELSE IF ${injuryRisk} >= 50:
  → ELEVATED RISK: Injury Risk score of ${injuryRisk} indicates moderate-to-high
    risk. Review contributing factors (ACWR, mechanical spikes, monotony, speed
    deficit) and address the dominant risk driver. Wellness assessment recommended.

ELSE IF ${injuryRisk} >= 30:
  → MODERATE RISK: Injury Risk score of ${injuryRisk} indicates moderate risk.
    Continue monitoring ACWR trend, mechanical load, and training monotony.
    No immediate intervention required but vigilance is advised.

ELSE:
  → LOW RISK: Injury Risk score of ${injuryRisk} indicates low risk. Current
    training load is well-managed across all risk dimensions. Maintain
    current programming.
```

### Risk Factor Decomposition

```
COMPOSITE SCORE BREAKDOWN:
  ACWR component (30%):        ${acwr_total_distance} → score × 0.30
  Mechanical spike (25%):       acc+dec ratio vs 4-wk avg → score × 0.25
  Training monotony (20%):      ${monotony} → score × 0.20
  Speed deficit (15%):          ${top_speed} / ${personalMaxSpeed} → score × 0.15
  Chronic load confidence (10%): history weeks → score × 0.10

  PRIORITY ACTION: Address the component with the highest individual
  risk score first.
```

---

## Chart Specifications

No additional chart specifications for this domain. Injury risk visualization is already implemented in the existing codebase.

---

## References

- Arnason A, et al. (2004). Risk factors for injuries in football. *Am J Sports Med.*
- Bourne MN, et al. (2017). Impact of exercise selection on hamstring muscle architecture. *AJSM.*
- Dalen T, et al. (2016). Player load, acceleration, and deceleration during forty-five competitive matches of elite soccer. *J Strength Cond Res.*
- Dupont G, et al. (2010). Effect of 2 soccer matches in a week on physical performance and injury rate. *BJSM.*
- Foster C, et al. (2001). A new approach to monitoring exercise training. *J Strength Cond Res.*
- Gabbett TJ. (2016). The training-injury prevention paradox. *BJSM*, 50(5), 273–280.
- Gabbett TJ, et al. (2017). If overuse injury is a 'training load error', should undertraining be viewed the same way? *BJSM.*
- Harøy J, et al. (2019). The adductor strengthening programme prevents groin problems. *BJSM.*
- Hulin BT, et al. (2016). The acute:chronic workload ratio predicts injury. *BJSM*, 50(4), 231–236.
- Impellizzeri FM, et al. (2020). ACWR: conceptual issues, current evidence and future directions. *Sports Med.*
- Issurin VB. (2008). Block periodization versus traditional training theory. *J Sports Med Phys Fitness.*
- Malone S, et al. (2017). High chronic training loads and exposure to bouts of maximal velocity running reduce injury risk. *JOSPT*, 47(12).
- Orchard JW. (2001). Intrinsic and extrinsic risk factors for muscle strains in Australian football. *Am J Sports Med.*
- Petersen J, et al. (2011). Preventive effect of eccentric training on acute hamstring injuries. *AJSM.*
- Soligard T, et al. (2008). Comprehensive warm-up programme to prevent injuries in young female footballers. *BMJ.*
- Timmins RG, et al. (2016). Short biceps femoris fascicles and eccentric knee flexor weakness increase hamstring injury risk. *BJSM.*
