# Fatigue Monitoring

Knowledge domain covering internal vs external load dissociation, fatigue index, HRV, wellness monitoring, and neuromuscular markers.

**Source sections:** §3 (Internal Metrics), §4 (Wellness Monitoring), §6 (Fitness-Fatigue Model), §7 (Neuromuscular & Biochemical Markers)

---

## Key Postulates

1. **Fatigue Index (FI)** measures the dissociation between internal (cardiovascular) and external (mechanical) load. FI = (Heart Exertion % of match ref) − (NRG expenditure % of match ref). A positive FI means the body is working harder cardiovascularly for the same external output, indicating accumulated fatigue (Banister et al. 1975).

2. **Subjective wellness measures outperform commonly used objective measures** for monitoring training response in athletes (Saw et al. 2016). The Hooper Index (sleep, fatigue, stress, soreness; each 1–7) should be collected every morning before training.

3. **HRV (RMSSD)** is the primary marker of parasympathetic activity and recovery status. Normal range for elite footballers is 40–80 ms. A 7-day rolling average baseline with Z-score alerting is the recommended monitoring approach (HRV4Training methodology). HRV-guided training produces superior aerobic gains vs fixed-plan training (Kiviniemi et al. 2007).

4. **CMJ (Countermovement Jump)** flight time or FT:CT ratio is the primary neuromuscular fatigue marker. Post-match CMJ height decreases 5–10% at 24h, returning to baseline by 72h in most players. An Eccentric Utilization Ratio (EUR = CMJ/SJ) < 1.0 post-match indicates stretch-shortening cycle fatigue.

5. **Testosterone:Cortisol (T:C) ratio** below 0.025 indicates overreaching risk. A decreasing testosterone trend combined with increasing cortisol signals a catabolic state requiring load reduction.

6. **CK (Creatine Kinase)** is highly individual with up to 10-fold variation between players. Always compare against individual baseline, not population norms. Values >500 U/L post-match are typical; individual baseline × 3–5 warrants concern (Twist & Highton 2013).

7. **Fitness-Fatigue dissociation:** After a high training block, fitness is high but masked by fatigue. Fatigue decays quickly (τ ≈ 7–14 days) while fitness decays slowly (τ ≈ 42–50 days). A taper of 40–60% volume reduction while maintaining intensity reveals the fitness supercompensation window (Banister et al. 1975; Clarke & Skiba 2013).

8. **Post-match recovery timeline:** Severe fatigue at 0–6h; CK peak at 24–48h; neuromuscular deficit through 48–72h; baseline return at 72–96h. Scheduling rest on MD+2 reduces non-contact injury rates 2–3× (Dupont et al. 2010).

---

## Thresholds & Decision Rules

### Fatigue Index Zones

| Fatigue Index Value | Zone | Interpretation | Action |
|--------------------|------|----------------|--------|
| ≤ −0.1 | Low fatigue | Internal cost proportionate or lower than external output | Recovery status favorable; proceed as planned |
| −0.1 to 0.5 | Neutral | Internal and external load roughly balanced | No action required |
| 0.5–5.0 | Mild fatigue | Cardiovascular cost disproportionately higher than mechanical output | Monitor closely; consider reducing intensity if trend persists |
| > 5.0 | High fatigue | Significant cardiovascular strain relative to external output | Load reduction recommended; full wellness assessment (Hooper, HRV, sleep) |

### HRV Thresholds

| Metric | Threshold | Interpretation | Action |
|--------|-----------|----------------|--------|
| RMSSD | Normal range 40–80 ms | Baseline parasympathetic activity | Individual baseline tracking |
| RMSSD | > 5% below individual baseline | Under-recovery | Reduce load; assess sleep and nutrition |
| RMSSD trend | Declining over 3+ days | Cumulative fatigue accumulation | Mandatory recovery day |

### Neuromuscular Markers

| Marker | Threshold | Interpretation | Action |
|--------|-----------|----------------|--------|
| CMJ flight time | > 5% below individual baseline | Meaningful neuromuscular fatigue | Reduce high-intensity and eccentric load |
| CMJ EUR (CMJ/SJ) | < 1.0 | Stretch-shortening cycle fatigue | Avoid plyometric and reactive training |
| RSI (drop jump) | > 10% below baseline | CNS fatigue | Reduce neural-intensive training |

### Biochemical Markers

| Marker | Normal Range | Alert Threshold | Interpretation |
|--------|-------------|-----------------|----------------|
| CK | 100–200 U/L | Individual baseline × 3–5 | Excessive muscle damage |
| T:C ratio | 0.025–0.060 | < 0.025 | Overreaching risk; catabolic state |
| Blood urea | 3.5–7.0 mmol/L | > 8.0 mmol/L | Inadequate recovery |
| Ferritin | 30–150 μg/L | < 30 μg/L | Iron deficiency risk |

### Wellness Alert Thresholds

| Tool | Alert Threshold | Source |
|------|-----------------|--------|
| Hooper Index (total 4–28) | > 20% decline from individual baseline | Hooper & Mackinnon 1995 |
| PSQI (sleep quality) | Score > 5 | Pittsburgh Sleep Quality Index |
| Training Monotony | > 2.0 | Foster et al. 2001 |
| Training Strain | > 6,000 AU | Foster et al. 2001 |

---

## Analysis Templates

### Fatigue Zone Classification

```
IF ${fatigueIndex} > 5.0:
  → HIGH FATIGUE: Fatigue Index of ${fatigueIndex} indicates significant
    cardiovascular strain relative to external output. This pattern is
    associated with overreaching and elevated illness/injury risk
    (Meeusen et al. 2013). Load reduction and a comprehensive wellness
    assessment (Hooper Index, HRV, sleep quality) are strongly recommended.

ELSE IF ${fatigueIndex} > 0.5:
  → MILD FATIGUE: Fatigue Index of ${fatigueIndex} indicates the
    cardiovascular (internal) cost of training is disproportionately higher
    than the mechanical (external) output. This suggests accumulated fatigue
    where the body is working harder for the same external work
    (Banister et al. 1975; Saw et al. 2016). Monitor trend over the next
    2–3 sessions.

ELSE IF ${fatigueIndex} >= -0.1:
  → NEUTRAL: Fatigue Index of ${fatigueIndex} is in the neutral zone.
    Internal and external load are roughly balanced. No immediate concern.

ELSE:
  → LOW FATIGUE: Fatigue Index of ${fatigueIndex} indicates low fatigue —
    the internal cardiovascular cost is proportionate or lower than the
    external mechanical output. Recovery status is favorable. The player
    is well-positioned for high-intensity training.
```

### Multi-Day Fatigue Trend

```
IF high_fatigue_days >= 2 AND ${fatigueIndex} > 5.0:
  → COMPOUNDING FATIGUE: High Fatigue Index observed across multiple
    training days, creating a compounding recovery deficit. This negatively
    affects adaptation and increases overtraining risk. Extended recovery
    (48–72h low load) is recommended before the next high-intensity session.
```

---

## Chart Specifications

No chart specifications for this domain. Fatigue monitoring charts would require HRV data, wellness questionnaire scores, and CMJ force plate data not currently available in the GPS CSV import format. Future integration with HRV and wellness APIs would enable:

- HRV trend line (7-day rolling RMSSD with baseline and ±5% alert bands)
- Wellness dashboard (Hooper Index components stacked over time)
- CMJ flight time trend with neuromuscular fatigue threshold

---

## References

- Banister EW, et al. (1975). A systems model of training for athletic performance. *Aust J Sports Med.*
- Clarke DC, Skiba PF. (2013). Rationale and resources for teaching the mathematical modeling of athletic training and performance. *Adv Physiol Educ.*
- Dupont G, et al. (2010). Effect of 2 soccer matches in a week on physical performance and injury rate. *BJSM.*
- Foster C, et al. (2001). A new approach to monitoring exercise training. *J Strength Cond Res.*
- Gathercole RJ, et al. (2015). Countermovement jump performance to assess fatigue. *Int J Sports Physiol Perf.*
- Hooper SL, Mackinnon LT. (1995). Monitoring overtraining in athletes. *Sports Med.*
- Kiviniemi AM, et al. (2007). Endurance training guided individually by daily heart rate variability measurements. *Eur J Appl Physiol.*
- Meeusen R, et al. (2013). Prevention, diagnosis, and treatment of the overtraining syndrome. *Med Sci Sports Exerc.*
- Saw AE, et al. (2016). Subjective monitoring of sport and exercise: literature review. *BJSM.*
- Twist C, Highton J. (2013). Monitoring fatigue and recovery in rugby league players. *Int J Sports Physiol Perf.*
