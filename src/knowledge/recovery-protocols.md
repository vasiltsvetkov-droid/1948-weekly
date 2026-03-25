# Recovery Protocols

## Source Sections
- §7.3 Post-Match Recovery Timeline
- §8.3 Day-by-Day Session Detail (MD+1, MD+2)
- §4 Subjective Wellness Monitoring (Sleep, Wellness)
- §13.4 Minimum Recovery Between Matches (Nutrition)

---

## Key Postulates

1. **Post-match recovery follows a predictable physiological timeline.** CK peaks at 24-48 h, neuromuscular deficits persist for 48-72 h, and near-full recovery occurs at 96-120 h. Training prescription must respect these windows (Dupont et al. 2010; Gathercole et al. 2015).

2. **MD+1 sessions must remain strictly below recovery thresholds.** HR <65% HRmax (Zone 1), total distance <2,000 m, zero sprinting, and zero eccentric loading. The session is a recovery flush, not a training stimulus.

3. **Rest on MD+2 is the single most impactful modifiable recovery variable.** Scheduling a rest day on MD+2 is associated with 2-3x lower non-contact injury rates in elite football (Dupont et al. 2010; Lago-Penas et al. 2011).

4. **Sleep extension (9-10 h) is a performance enhancer.** Extended sleep improves reaction time, sprint speed, and perceived fatigue in athletes (Mah et al. 2011). Poor sleep (PSQI >5) is a risk factor for under-recovery.

5. **Post-session nutrition timing is critical for glycogen restoration.** CHO intake of 1-1.5 g/kg within 30 minutes post-session is the priority recovery intervention, ahead of contrast therapy and active recovery.

6. **Subjective wellness monitoring (Hooper Index) detects overreaching earlier than most physiological markers.** A >20% decline from individual baseline warrants load reduction (Hooper & Mackinnon 1995; Saw et al. 2016).

---

## Thresholds & Decision Rules

### MD+1 Recovery Session Limits

| Parameter | Threshold | Rationale |
|-----------|-----------|-----------|
| Heart Rate | <65% HRmax (Zone 1) | Parasympathetic recovery zone; avoid sympathetic activation |
| Total Distance | <2,000 m | Minimal mechanical loading |
| Sprinting | 0 m (none) | No eccentric hamstring loading at high speed |
| Eccentric Loading | None | CK peak at 24-48 h; eccentric work exacerbates muscle damage |
| sRPE (% of match) | 20-30% | Recovery flush intensity only |
| Session Duration | 30-45 min | Pool walking/jogging, light bike, static stretching, mobility |

### MD+2 Rest / Minimal Load

| Parameter | Threshold | Rationale |
|-----------|-----------|-----------|
| sRPE (% of match) | 0-20% | Rest preferred; if training required: walking pace, <20 min |
| Injury Risk Reduction | 2-3x lower with rest day | Dupont et al. 2010 |
| Starters | Mandatory off or pool only | Full rest for match starters |
| If training required | Technical possession only | Walking pace, <20 min duration |

### Post-Match Recovery Timeline

| Time Post-Match | Physiological State | Training Recommendation |
|-----------------|--------------------|-----------------------|
| 0-6 h | Severe fatigue, CK rising, glycogen depleted | Nutrition/hydration focus only |
| 6-24 h (MD+1) | Max muscle damage, soreness peak | Active recovery, mobility, contrast baths |
| 24-48 h (MD+1/2) | CK peak, neuromuscular deficit | Light technical, low-intensity only |
| 48-72 h (MD+2/3) | Recovery phase | Rest MD+2 if possible; 2-3x lower injury risk |
| 72-96 h (MD+3/4) | Returning to baseline | Moderate load; strength training re-introduction |
| 96-120 h (MD+4/5) | Near-full recovery | High-intensity work appropriate |

### Sleep & Wellness Thresholds

| Parameter | Threshold | Action |
|-----------|-----------|--------|
| Sleep extension target | 9-10 h | Improves reaction time, sprint speed, perceived fatigue (Mah et al. 2011) |
| PSQI score | >5 | Indicates poor sleep quality; investigate disruptors |
| Hooper Index decline | >20% from baseline | Warrants load reduction |
| Body mass loss | >2% | Restrict full training; hydration deficit |
| HRV (RMSSD) | >5% below individual baseline | Potential under-recovery; reduce load |

### Nutrition Recovery Priorities

| Priority | Intervention | Dose / Timing |
|----------|-------------|---------------|
| 1 | Carbohydrate | 1-1.5 g/kg within 30 min post-session |
| 2 | Hydration | Replace 150% of fluid lost (body mass delta) |
| 3 | Protein | 0.3-0.4 g/kg with CHO post-session |
| 4 | Contrast therapy | Cold water immersion or contrast baths within 1-2 h |
| 5 | Active recovery | Pool walking, light bike (MD+1 only) |

---

## Analysis Templates

### Recovery Status Zone Interpretation

```
Recovery Status (RS) = ${rs}

ZONE CLASSIFICATION:
- If RS 0-30 (Poor/Red Zone):
  "Recovery Status of ${rs}/100 is in the poor zone. This indicates significant accumulated fatigue
  with elevated overreaching and injury risk. Immediate load reduction is recommended: restrict to
  MD+1-level sessions (HR <65% HRmax, TD <2,000 m, no sprinting) until RS returns above 30.
  Prioritize sleep extension (9-10 h), nutrition (CHO 1-1.5 g/kg within 30 min post-session),
  contrast therapy, and Hooper Index monitoring. A rest day (MD+2 protocol) should be inserted
  into the schedule — rest on MD+2 is associated with 2-3x lower non-contact injury rates
  (Dupont et al. 2010)."

- If RS 30-60 (Moderate/Yellow Zone):
  "Recovery Status of ${rs}/100 is in the moderate zone. The player is recovering but not yet at
  optimal readiness. Training can proceed at reduced intensity (60-70% of match sRPE). Ensure
  MD+1 protocols are strictly followed (HR <65% HRmax, TD <2,000 m, zero sprints). Monitor
  sleep quality (target 9-10 h), nutrition timing (CHO 1-1.5 g/kg within 30 min), and daily
  Hooper Index for >20% baseline decline. Avoid back-to-back high-intensity days."

- If RS 60-100 (Good/Green Zone):
  "Recovery Status of ${rs}/100 is in the good zone. The player demonstrates adequate recovery
  between sessions, with internal and external load in balance. Normal microcycle loading can
  proceed. Continue standard recovery protocols: MD+1 active recovery, MD+2 rest (preferred),
  sleep hygiene (9-10 h target), and post-session nutrition (CHO 1-1.5 g/kg within 30 min)."
```

---

## Chart Specifications

### Recovery Status Timeline

```yaml
chart_type: zone-area
title: "Recovery Status Timeline"
description: "12-week recovery status trend with zone bands indicating recovery quality"
x_axis:
  label: "Week"
  range: 12 weeks (rolling)
  type: temporal
y_axis:
  label: "Recovery Status (RS)"
  range: [0, 100]
  metric: rs
zones:
  - name: "Poor"
    range: [0, 30]
    color: "#e74c3c"  # red
    opacity: 0.2
  - name: "Moderate"
    range: [30, 60]
    color: "#f39c12"  # yellow
    opacity: 0.2
  - name: "Good"
    range: [60, 100]
    color: "#27ae60"  # green
    opacity: 0.2
data_series:
  - metric: rs
    label: "Recovery Status"
    type: area
    color: "#2c3e50"
    fill_opacity: 0.3
reference_lines:
  - value: 30
    label: "Poor/Moderate boundary"
    style: dashed
    color: "#e74c3c"
  - value: 60
    label: "Moderate/Good boundary"
    style: dashed
    color: "#f39c12"
```

---

## References

- Dupont G, et al. (2010). Effect of 2 soccer matches in a week on physical performance and injury rate. *BJSM*.
- Lago-Penas C, et al. (2011). The influence of match schedule on match performance in elite football.
- Gathercole RJ, et al. (2015). Maximal and submaximal vertical jump testing and the assessment of fatigue. *Int J Sports Physiol Perf*.
- Mah CD, et al. (2011). The effects of sleep extension on athletic performance. *Sleep*.
- Hooper SL, Mackinnon LT. (1995). Monitoring overtraining in athletes: recommendations. *Sports Med*.
- Saw AE, et al. (2016). Subjective monitoring of sport and exercise: literature review. *BJSM*.
- Foster C, et al. (2001). A new approach to monitoring exercise training. *J Strength Cond Res*.
- Banister EW, et al. (1975). A systems model of training for athletic performance. *Aust J Sports Med*.
- Meeusen R, et al. (2013). Prevention, diagnosis, and treatment of the overtraining syndrome. *Med Sci Sports Exerc*.
