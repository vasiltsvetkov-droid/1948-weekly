# Training Monotony

## Source Sections
- §3.1 sRPE and Monotony (Foster's Model)
- §5.4 Practical ACWR Implementation

---

## Key Postulates

1. **Training monotony quantifies day-to-day load variation within a microcycle.** Monotony = weekly mean daily load / SD of daily loads. High monotony indicates insufficient contrast between hard and easy days, reducing the supercompensation stimulus and increasing overreaching/illness risk (Foster et al. 2001).

2. **Monotony > 2.0 is the critical risk threshold.** Values above 2.0 are associated with overreaching, illness, and elevated injury risk. A well-structured MD-based microcycle with clear differentiation between high-intensity days (MD-4) and recovery days (MD+1, MD+2) should produce monotony well below 2.0.

3. **Strain = weekly load x monotony.** Strain values > 6,000 AU are associated with elevated overreaching and illness risk. Strain captures both the total volume (weekly load) and the uniformity of its distribution (monotony), making it a more informative composite metric than either alone.

4. **The ideal microcycle has distinct intensity layers.** MD+1: 20-30% match sRPE. MD+2: 0-20% (rest preferred). MD-4: 60-70% (highest intensity). MD-3: 70-80%. MD-2: 60-70%. MD-1: 30-40%. This variation drives monotony below 1.5 in a well-structured week.

5. **Monotony should be cross-referenced with ACWR, Hooper Index, CMJ, and HRV** for decision-making. A high monotony value combined with elevated ACWR (>1.3) and declining wellness markers warrants immediate load redistribution (Foster et al. 2001; Saw et al. 2016).

---

## Thresholds & Decision Rules

### Monotony Classification

| Monotony Value | Classification | Risk Level | Action |
|---------------|---------------|------------|--------|
| <= 1.0 | Excellent | Low | Optimal day-to-day variation; maintain structure |
| 1.0-1.5 | Good | Low-Moderate | Acceptable; minor improvement possible |
| 1.5-2.0 | Moderate | Approaching risk | Review session intensity distribution; increase contrast |
| > 2.0 | High Risk | High | Overreaching/illness/injury risk; redistribute load immediately |

### Strain Thresholds

| Strain (AU) | Classification | Action |
|-------------|---------------|--------|
| < 3,000 | Low | Normal; adequate recovery likely |
| 3,000-6,000 | Moderate | Monitor wellness markers; standard protocols |
| > 6,000 | Warning | Elevated overreaching/illness risk; reduce volume or improve load distribution |

### Monotony Calculation

| Component | Formula | Notes |
|-----------|---------|-------|
| Daily Load | sRPE x session duration (min) | Borg CR-10 collected 20-30 min post-session |
| Weekly Load | Sum of all daily loads | 7-day sum |
| Weekly Mean | Weekly load / number of training days | Average daily load |
| Weekly SD | Standard deviation of daily loads | Variation measure |
| Monotony | Weekly mean / Weekly SD | Uniformity index |
| Strain | Weekly load x Monotony | Composite risk metric |

### Target sRPE Distribution for Low Monotony

| Day | % Match sRPE | Rationale |
|-----|-------------|-----------|
| MD+1 | 20-30% | Recovery flush |
| MD+2 | 0-20% (rest) | Injury risk reduction |
| MD-4 | 60-70% | Highest intensity training day |
| MD-3 | 70-80% | Moderate-high; tactical development |
| MD-2 | 60-70% | Load reduction begins |
| MD-1 | 30-40% | Activation only |

---

## Analysis Templates

### Monotony Zone Interpretation

```
Training Monotony = ${monotony}

ZONE CLASSIFICATION:
- If monotony <= 1.0 (Excellent):
  "Training Monotony of ${monotony} indicates excellent day-to-day load variation. The
  microcycle has clear differentiation between hard and easy days, supporting supercompensation
  and reducing overtraining risk (Foster et al. 2001). The MD-based structure is being
  well-executed with appropriate contrast between high-intensity days (MD-4) and recovery
  days (MD+1, MD+2)."

- If monotony 1.0-1.5 (Good):
  "Training Monotony of ${monotony} indicates good load variation with some room for
  improvement. The target for a well-structured microcycle is below 1.5 (Foster et al. 2001).
  Slightly increasing the contrast between hard days (MD-4 peak at 60-70% match sRPE) and
  recovery days (MD+1 at 20-30%, MD+2 rest) will improve this further."

- If monotony 1.5-2.0 (Moderate / Approaching Risk):
  "Training Monotony of ${monotony} is approaching the risk threshold. The microcycle lacks
  sufficient variation between sessions. Review the session intensity distribution: ensure
  MD+1 is truly recovery-level (20-30% match sRPE), MD+2 is rest or minimal load (0-20%),
  and that not all sessions cluster around similar intensity. The target is below 1.5 with
  the critical threshold at 2.0 (Foster et al. 2001). Cross-reference with Hooper Index
  and HRV for signs of overreaching."

- If monotony > 2.0 (High Risk):
  "Training Monotony of ${monotony} exceeds the critical 2.0 threshold associated with
  overreaching, illness, and elevated injury risk (Foster et al. 2001). Immediate action
  required: redistribute load across the microcycle to create greater contrast between
  high-intensity and recovery days. Ensure MD+1 (20-30% sRPE) and MD+2 (rest/0-20% sRPE)
  are strictly enforced. Check strain (weekly load x monotony) — values above 6,000 AU
  compound the risk. Monitor Hooper Index, CMJ flight time, and HRV for emerging
  overreaching markers."
```

---

## Chart Specifications

### Monotony & Strain Trend

```yaml
chart_type: dual-axis
title: "Monotony & Strain Trend"
description: "12-week trend of training monotony (left axis) and total NRG expenditure as strain proxy (right axis)"
x_axis:
  label: "Week"
  range: 12 weeks (rolling)
  type: temporal
y_axis_left:
  label: "Monotony"
  range: [0, 3.0]
  metric: monotony
y_axis_right:
  label: "Total NRG (J/kg)"
  metric: total_nrg
  auto_scale: true
data_series:
  - metric: monotony
    label: "Training Monotony"
    axis: left
    type: line
    color: "#2c3e50"
    marker: circle
  - metric: total_nrg
    label: "Total NRG (strain proxy)"
    axis: right
    type: bar
    color: "#3498db"
    opacity: 0.5
reference_lines:
  - value: 2.0
    axis: left
    label: "Monotony Risk Threshold"
    style: dashed
    color: "#e74c3c"
  - value: 1.5
    axis: left
    label: "Monotony Caution"
    style: dotted
    color: "#f39c12"
annotations:
  - type: zone
    axis: left
    range: [2.0, 3.0]
    color: "#e74c3c"
    opacity: 0.08
    label: "High Risk Zone"
```

---

## References

- Foster C, et al. (2001). A new approach to monitoring exercise training. *J Strength Cond Res*.
- Impellizzeri FM, et al. (2004). Use of RPE-based training load in soccer. *Med Sci Sports Exerc*.
- Saw AE, et al. (2016). Subjective monitoring of sport and exercise: literature review. *BJSM*.
- Gabbett TJ. (2016). The training-injury prevention paradox. *BJSM*, 50(5), 273-280.
- Hulin BT, et al. (2016). The acute:chronic workload ratio predicts injury. *BJSM*, 50(4), 231-236.
- Meeusen R, et al. (2013). Prevention, diagnosis, and treatment of the overtraining syndrome. *Med Sci Sports Exerc*.
