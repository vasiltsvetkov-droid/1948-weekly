# Mechanical Load

Knowledge domain covering acceleration/deceleration loading, eccentric stress, metabolic power, and soft tissue risk from mechanical demands.

**Source sections:** §2.1 (GPS Metrics for Acc/Dec), §1.2 (Metabolic Power), §17.1–17.2 (Eccentric Training / NHC / Muscle Architecture)

---

## Key Postulates

1. **Mechanical load** is defined as the combined total of accelerations (>2.0 m/s², ≥0.5s) and decelerations (>2.0 m/s², ≥0.5s). Decelerations impose the greatest eccentric stress on the musculoskeletal system, particularly the hamstrings and quadriceps (Dalen et al. 2016).

2. **Metabolic power analysis reveals that 26% of match distance accounts for 42% of total energy expenditure** (Osgnach et al. 2010). Traditional speed-threshold methods underestimate the energy cost of accelerations and decelerations because high-intensity efforts frequently occur at low absolute speeds. The metabolic power approach captures ~35% more high-intensity activity than speed-based thresholds alone.

3. **HMLD (High Metabolic Load Distance)** — distance covered at metabolic power >25.5 W/kg — is the preferred metric for capturing mechanically demanding actions that GPS distance alone misses. Match benchmark: 1,000–2,000 m.

4. **Nordic Hamstring Curl (NHC) reduces hamstring injury rate by 51%** and new injury rate by 70% (Petersen et al. 2011). NHC increases BFlh fascicle length by 12–24% in 6–10 weeks (Bourne et al. 2017), but fascicle length gains reverse within 2 weeks of detraining.

5. **Short BFlh fascicle length (<10.6 cm) confers 4× greater hamstring injury risk** (Timmins et al. 2016). Each 0.5 cm gain in fascicle length is associated with ~75% reduction in injury risk.

6. **PlayerLoad (Catapult)** captures collisions, changes of direction, and impacts not detected by GPS distance. PlayerLoad 2D (horizontal plane) correlates more strongly with muscle damage markers than full 3D PL (Boyd et al. 2011). Particularly valuable for contact-heavy positions (central defenders).

7. **Copenhagen Adductor protocol reduces adductor injury risk by ~41%** in professional football (Haroy et al. 2019). Recommended dose: 2×/week pre-season, 1×/week in-season.

---

## Thresholds & Decision Rules

### ACWR Mechanical Load Zones

| ACWR Mechanical | Zone | Interpretation | Action |
|----------------|------|----------------|--------|
| ≤ 1.2 | Normal | Mechanical load within chronic baseline | Maintain current programming |
| 1.2–1.4 | Rising | Mechanical load trending above baseline | Monitor; avoid further acc/dec-heavy sessions |
| > 1.4 | Overload | Significant eccentric overload risk | Reduce high-deceleration drills; limit change-of-direction volume |
| > 1.6 | Critical | Severe mechanical spike | Immediate reduction; prioritize concentric-only and pool work |

### Metabolic Power Reference Values

| Metric | Training Range | Match Benchmark |
|--------|---------------|-----------------|
| HMLD (MetPow >25.5 W/kg) | 600–1,200 m/session | 1,000–2,000 m |
| High Efforts (MetPow >25.5 W/kg) | Varies | Varies |
| Average metabolic power | Varies by session type | ~10–13 W/kg |
| Energy expenditure | — | ~65 kJ/kg per match (~1,600 kcal for 75 kg) |
| Metabolic cost insight | 26% of match distance = 42% of energy expenditure | Osgnach et al. 2010 |

### Acceleration/Deceleration Thresholds

| Metric | Training Range | Match Benchmark |
|--------|---------------|-----------------|
| Accelerations (>2.5–3 m/s²) | 60–120/session | 120–200 |
| Decelerations (>2.5–3 m/s²) | 50–100/session | 100–180 |

### Muscle Architecture Risk Factors

| Factor | Threshold | Risk | Intervention |
|--------|-----------|------|-------------|
| BFlh fascicle length | < 10.6 cm | 4× hamstring injury risk | NHC program (12–24% increase in 6–10 weeks) |
| Fascicle length detraining | 2 weeks without NHC | Gains reverse | Year-round maintenance (1×/week in-season) |
| NHC fascicle gain per 0.5 cm | — | ~75% risk reduction per 0.5 cm | Progressive eccentric volume |

---

## Analysis Templates

### Mechanical Load Zone Classification

```
IF ${acwrMechanical} > 1.6:
  → CRITICAL MECHANICAL OVERLOAD: ACWR mechanical at ${acwrMechanical}
    represents a severe spike in acceleration/deceleration loading relative
    to the 4-week baseline. Eccentric overload risk on hamstrings and
    quadriceps is substantially elevated (Dalen et al. 2016). Immediate
    reduction in high-deceleration drills, change-of-direction work, and
    SSG volume is required. Prioritize concentric-only movement and pool
    recovery sessions.

ELSE IF ${acwrMechanical} > 1.4:
  → MECHANICAL OVERLOAD: ACWR mechanical at ${acwrMechanical} exceeds the
    1.4 overload threshold. The current week's combined acceleration and
    deceleration volume significantly exceeds the chronic baseline. Reduce
    high-intensity direction changes and deceleration-heavy drills in the
    next 2–3 sessions. Ensure NHC maintenance is current.

ELSE IF ${acwrMechanical} > 1.2:
  → RISING MECHANICAL LOAD: ACWR mechanical at ${acwrMechanical} is trending
    above baseline (>1.2). While not yet at overload threshold, avoid
    stacking additional acc/dec-intensive sessions. Monitor closely over
    the next microcycle.

ELSE:
  → NORMAL MECHANICAL LOAD: ACWR mechanical at ${acwrMechanical} is within
    the chronic baseline (≤1.2). Mechanical loading is appropriately managed.
    Maintain eccentric prevention protocols (NHC, Copenhagen).
```

### Metabolic Power Context

```
NOTE: Traditional speed-based metrics underestimate the true physiological
cost of training by ~35%. Metabolic power analysis (Osgnach et al. 2010)
captures the energy cost of accelerations and decelerations at low absolute
speeds. When assessing player load, always consider HMLD and NRG expenditure
alongside HSR and sprint distance for a complete picture of mechanical stress.
```

---

## Chart Specifications

### Mechanical Load Trend (Line-Trend Chart)

| Property | Value |
|----------|-------|
| Type | line-trend |
| Title | Mechanical Load Trend |
| X-axis | Week number (rolling 12 weeks) |
| Y-axis | ACWR mechanical value |
| Series | `acwr_mechanical` |
| Reference lines | y = 1.2 (label: "Rising", color: amber), y = 1.4 (label: "Overload", color: red) |
| Zone fills | green: ≤1.2, amber: 1.2–1.4, red: >1.4 |
| Data window | 12 weeks |

---

## References

- Bourne MN, et al. (2017). Impact of exercise selection on hamstring muscle architecture and eccentric strength. *AJSM.*
- Boyd LJ, et al. (2011). The reliability of MinimaxX accelerometers for measuring physical activity in Australian football. *Int J Sports Physiol Perf.*
- Dalen T, et al. (2016). Player load, acceleration, and deceleration during forty-five competitive matches of elite soccer. *J Strength Cond Res.*
- Harøy J, et al. (2019). The adductor strengthening programme prevents groin problems among male football players. *BJSM.*
- Osgnach C, et al. (2010). Energy cost and metabolic power in elite soccer: a new match analysis approach. *Med Sci Sports Exerc.*
- Petersen J, et al. (2011). Preventive effect of eccentric training on acute hamstring injuries in male soccer players. *AJSM.*
- Timmins RG, et al. (2016). Short biceps femoris fascicles and eccentric knee flexor weakness increase hamstring injury risk in elite football. *BJSM.*
