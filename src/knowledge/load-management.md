# Load Management

Knowledge domain covering ACWR zones, training load monitoring, spike detection, and deload protocols.

**Source sections:** §5 (ACWR and Workload Ratio Models), §2.4 (ACWR for GPS Metrics), §6 (Fitness-Fatigue Model)

---

## Key Postulates

1. **Acute:Chronic Workload Ratio (ACWR)** is the ratio of the current week's training load (acute, 7-day) to the rolling 4-week average (chronic, 28-day). It serves as a clinical guide for load management, not an absolute injury predictor (Impellizzeri et al. 2020).

2. **EWMA is preferred over rolling averages.** Exponentially Weighted Moving Average (EWMA) with decay constants λ_acute = 0.25 (7-day) and λ_chronic = 0.069 (28-day) reduces day-1 spike artifacts inherent in simple rolling averages (Hulin et al. 2016).

3. **The Training-Injury Prevention Paradox:** Higher chronic training loads are protective against injury, provided load is built progressively. Under-trained athletes who experience sudden load spikes are at the highest risk (Gabbett 2016).

4. **Weekly load increases should not exceed 10%** of the previous week's total to avoid spike-driven injury risk (Gabbett 2016).

5. **HSR training volume of 0.6–0.9× match load** across the microcycle is associated with the lowest injury rates. Volumes below 0.5× or above 1.2× match load elevate injury risk (Malone et al. 2017).

6. **Fitness-Fatigue Model (Banister 1975):** Performance = Fitness (slow build, slow decay, τ₁ ≈ 42–50 days) minus Fatigue (fast build, fast decay, τ₂ ≈ 7–14 days). A 1–2 week taper reduces fatigue faster than fitness, producing a supercompensation window. Volume should be reduced 40–60% while maintaining intensity.

7. **Deload protocol:** Within a 4-week mesocycle, Week 3 should reduce volume by 30–40% while maintaining moderate intensity to allow supercompensation and restoration.

---

## Thresholds & Decision Rules

### ACWR Risk Zones

| ACWR Range | Zone | Interpretation | Action |
|-----------|------|----------------|--------|
| < 0.8 | Under-prepared | Insufficient training stimulus; detraining risk | Progressively increase load; consider load spike protocol |
| 0.8–1.3 | Sweet spot | Optimal training zone; lowest injury risk | Maintain current programming |
| 1.3–1.5 | Caution | Elevated risk; monitor closely | Review next week schedule; reduce match-intensity sessions |
| > 1.5 | Danger | High injury risk; 2–4× elevated non-contact injury rate | Immediate load reduction; full wellness assessment |

### HSR Training Volume vs Match Load

| Weekly HSR as Fraction of Match HSR | Risk Level | Action |
|--------------------------------------|-----------|--------|
| < 0.5× match load | Elevated risk (under-exposure) | Increase HSR exposure progressively |
| 0.6–0.9× match load | Lowest injury risk | Optimal range — maintain |
| 1.0–1.2× match load | Acceptable | Monitor; ensure adequate recovery |
| > 1.2× match load | Elevated risk (overexposure) | Reduce HSR volume |

### Weekly Load Progression

| Rule | Threshold | Source |
|------|-----------|--------|
| Maximum weekly load increase | ≤ 10% per week | Gabbett 2016 |
| Training monotony alert | > 2.0 (mean daily load / SD) | Foster et al. 2001 |
| Training strain alert | > 6,000 AU (weekly load × monotony) | Foster et al. 2001 |

---

## Analysis Templates

### ACWR Zone Classification

```
IF ${acwr} > 1.5:
  → DANGER ZONE: ACWR of ${acwr} is in the danger zone (>1.5), associated with
    2–4× elevated non-contact injury risk (Gabbett 2016; Hulin et al. 2016).
    Immediate load reduction is recommended. A full wellness assessment
    (Hooper Index, CMJ flight time, morning HRV) should precede the next
    high-intensity session.

ELSE IF ${acwr} > 1.3:
  → CAUTION ZONE: ACWR of ${acwr} is in the caution zone (1.3–1.5). Monitor
    closely and avoid further load intensification next week. Cross-reference
    with Fatigue Index and wellness data before progressing.

ELSE IF ${acwr} < 0.8:
  → UNDER-PREPARED: ACWR of ${acwr} is below 0.8, indicating insufficient
    training stimulus relative to the chronic baseline. Sustained underloading
    reduces the body's capacity to tolerate match demands and elevates injury
    risk when loads spike (Malone et al. 2017). Progressive load increase
    is recommended.

ELSE:
  → OPTIMAL: ACWR of ${acwr} is within the 0.8–1.3 sweet spot, the zone
    associated with lowest injury risk and appropriate training stimulus
    (Gabbett 2016).
```

### Weekly Load Spike Detection

```
IF current_week_load > previous_week_load × 1.10:
  → SPIKE DETECTED: Weekly load increased by more than 10% compared to the
    previous week. Load spikes of this magnitude are associated with elevated
    injury risk, particularly when chronic load is low (Gabbett 2016).
    Consider redistributing load across the remaining microcycle.
```

---

## Chart Specifications

### ACWR Trend (Line-Trend Chart)

| Property | Value |
|----------|-------|
| Type | line-trend |
| Title | ACWR Trend |
| X-axis | Week number (rolling 12 weeks) |
| Y-axis | ACWR value |
| Series | `acwr_total_distance`, `acwr_nrg` |
| Reference lines | y = 0.8 (label: "Under-prepared"), y = 1.3 (label: "Caution"), y = 1.5 (label: "Danger") |
| Zone fills | green: 0.8–1.3, amber: 1.3–1.5, red: >1.5, blue: <0.8 |
| Data window | 12 weeks |

### Load Achievement Radar

| Property | Value |
|----------|-------|
| Type | radar |
| Title | Load Achievement Radar |
| Axes | `total_distance`, `hsr`, `sprint`, `hmld`, `nrg`, `acc`, `dec` |
| Values | Each axis = (weekly total / match reference) × 100, i.e. `load_pct_total_distance`, `load_pct_hsr`, `load_pct_sprint`, `load_pct_hmld`, `load_pct_nrg`, `load_pct_acc`, `load_pct_dec` |
| Reference ring | 100% (match reference baseline) |
| Optimal band | 60–90% shaded green |
| Units | % of match reference |

---

## References

- Banister EW, et al. (1975). A systems model of training for athletic performance. *Aust J Sports Med.*
- Gabbett TJ. (2016). The training-injury prevention paradox. *BJSM*, 50(5), 273–280.
- Hulin BT, et al. (2016). The acute:chronic workload ratio predicts injury. *BJSM*, 50(4), 231–236.
- Impellizzeri FM, et al. (2020). ACWR: conceptual issues, current evidence and future directions. *Sports Med.*
- Malone S, et al. (2017). High chronic training loads and exposure to bouts of maximal velocity running reduce injury risk in elite Gaelic football. *JOSPT*, 47(12).
- Foster C, et al. (2001). A new approach to monitoring exercise training. *J Strength Cond Res.*
- Clarke DC, Skiba PF. (2013). Rationale and resources for teaching the mathematical modeling of athletic training and performance. *Adv Physiol Educ.*
