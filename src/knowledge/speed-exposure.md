# Speed Exposure

Knowledge domain covering sprint residual training effects, Vmax exposure monitoring, and HSR training volume thresholds.

**Source sections:** §6.3 (Residual Training Effects), §16 (Sprint Mechanics), §2.4 (HSR Thresholds)

---

## Key Postulates

1. **Speed (max velocity) has the shortest residual training effect of all physical qualities at 5±3 days** (Issurin 2008). This means maximal speed work must appear in every microcycle to prevent neuromuscular detraining. Of all qualities, speed requires the most frequent maintenance (3–4 sessions/week).

2. **Vmax exposure below 90% of personal maximum indicates a speed deficit.** Insufficient exposure to near-maximal sprinting reduces the neuromuscular system's preparedness for match-intensity efforts and is associated with elevated injury risk when speed demands spike during competition (Malone et al. 2017).

3. **HSR training volume of 0.6–0.9× match load** across the weekly microcycle is associated with the lowest injury risk. Volumes below 0.5× match load (under-exposure) or above 1.2× match load (overexposure) are both associated with elevated injury rates (Malone et al. 2017).

4. **Most football sprints are <20 m** (acceleration-dominant) (Cometti et al. 2001). Acceleration ability (0–10 m) is more trainable than maximal velocity. For most field positions, improving horizontal force production (F0) through force-oriented training is the priority.

5. **The F-V (Force-Velocity) profile** determines sprint performance. Players with a force deficit (high V0, low F0) benefit from heavy resisted sprints; players with a velocity deficit (high F0, low V0) benefit from max speed runs and light resisted sprints (Morin & Samozino 2016).

6. **Wide midfielders perform the most sprints per match (35.8 ± 13.4)** and most frequently reach maximal velocity (Di Salvo et al. 2009). Position-specific speed exposure targets must account for these differences.

7. **MD-4 is the critical speed exposure day** in the microcycle. GPS targets should include 8–12 sprints above 90% Vmax. MD-1 should include 3–5 maximal sprints as a neuromuscular primer. Speed residual effect of 5 days means speed must be activated no later than MD-4 for match readiness.

---

## Thresholds & Decision Rules

### Speed Residual Training Effects

| Quality | Residual Effect Duration | Maintenance Frequency | Implication |
|---------|------------------------|----------------------|-------------|
| Speed (max velocity) | 5±3 days | 3–4 sessions/week | Shortest residual; train every microcycle |
| Speed-strength (power) | 15±5 days | 2 sessions/week | Can tolerate slightly less frequency |
| Anaerobic capacity | 18±4 days | 2 sessions/week | Moderate maintenance need |
| Aerobic endurance | 25–35 days | 1–2 sessions/week | Longest residual; lowest maintenance |

### Vmax Exposure Thresholds

| Top Speed / Personal Max | Zone | Interpretation | Action |
|-------------------------|------|----------------|--------|
| < 80% | Danger | Severe speed deficit; neuromuscular detraining | Immediate maximal sprint exposure; review microcycle structure |
| 80–90% | Caution | Insufficient Vmax exposure | Increase sprint volume at MD-4; add activation sprints at MD-1 |
| ≥ 90% | Good | Adequate neuromuscular preparation | Maintain current sprint programming |

### HSR Training Volume vs Match Load

| Weekly HSR / Match HSR | Zone | Injury Risk | Action |
|-----------------------|------|-------------|--------|
| < 0.5× | Under-exposure | Elevated | Progressively increase HSR; ensure MD-4 includes high-speed running |
| 0.6–0.9× | Optimal | Lowest risk | Maintain; this is the target range |
| 1.0–1.2× | Acceptable | Moderate | Monitor recovery; may be appropriate in overloading weeks |
| > 1.2× | Overexposure | Elevated | Reduce HSR volume; check for scheduling errors or excessive SSG intensity |

### Sprint Distance Thresholds

| Metric | Training Range | Match Benchmark |
|--------|---------------|-----------------|
| Sprint distance (>7.0 m/s) | 50–200 m/session | 200–400 m |
| HSR distance (>5.5 m/s) | 200–600 m/session | 800–1,200 m |
| Number of sprints | Varies by session | 30–60 per match |
| Max velocity | Varies | 30–35 km/h |

---

## Analysis Templates

### Speed Exposure Assessment

```
IF ${speedPct} < 80:
  → DANGER — SEVERE SPEED DEFICIT: Top speed this week reached only
    ${speedPct}% of the recorded personal maximum. Speed has the shortest
    residual training effect (5±3 days; Issurin 2008), and this level of
    deficit indicates significant neuromuscular detraining. The player is
    not prepared for match-intensity sprinting demands. Immediate maximal
    sprint exposure is required — include 8–12 sprints at >90% Vmax in
    the next MD-4 session.

ELSE IF ${speedPct} < 90:
  → CAUTION — SPEED DEFICIT: Top speed reached ${speedPct}% of personal
    maximum. While not critical, insufficient Vmax exposure reduces the
    neuromuscular system's readiness for match-intensity efforts and is
    associated with elevated injury risk when sprint demands spike during
    competition (Malone et al. 2017). Increase sprint volume at MD-4 and
    include 3–5 activation sprints at MD-1.

ELSE:
  → GOOD — ADEQUATE SPEED EXPOSURE: Top speed reached ${speedPct}% of
    personal maximum, meeting the ≥90% threshold for neuromuscular
    preparedness. Sprint programming is appropriately maintained.
```

### HSR/Sprint Load Assessment

```
IF ${loadHsr} < 50:
  → HSR UNDER-EXPOSURE: Weekly HSR at ${loadHsr}% of match reference is
    below the 60% minimum for the optimal 0.6–0.9× range. Under-exposure
    to high-speed running reduces tissue tolerance and elevates injury risk
    when match demands spike.

ELSE IF ${loadHsr} >= 60 AND ${loadHsr} <= 90:
  → HSR OPTIMAL: Weekly HSR at ${loadHsr}% of match reference falls within
    the optimal 0.6–0.9× range associated with lowest injury risk
    (Malone et al. 2017).

ELSE IF ${loadHsr} > 120:
  → HSR OVEREXPOSURE: Weekly HSR at ${loadHsr}% of match reference exceeds
    the 1.2× threshold. Elevated volume of high-speed running increases
    musculoskeletal strain. Reduce HSR-intensive sessions.

IF ${loadSprint} < 50:
  → SPRINT UNDER-EXPOSURE: Weekly sprint distance at ${loadSprint}% of
    match reference. Ensure at least one session per microcycle includes
    sprints at >90% Vmax to maintain neuromuscular readiness.
```

---

## Chart Specifications

### Speed Exposure Gauge

| Property | Value |
|----------|-------|
| Type | gauge |
| Title | Speed Exposure Gauge |
| Value | `top_speed` / `personalMaxSpeed` × 100 (%) |
| Min | 0% |
| Max | 110% |
| Zones | 0–80%: red (danger), 80–90%: amber (caution), 90–110%: green (good) |
| Needle label | Current week top speed as % of personal max |
| Subtitle | "Vmax Exposure" |

### HSR + Sprint Weekly Trend (Stacked-Area Chart)

| Property | Value |
|----------|-------|
| Type | stacked-area |
| Title | HSR + Sprint Weekly Trend |
| X-axis | Week number (rolling 12 weeks) |
| Y-axis | Distance (m) |
| Series | `hsr_distance` (label: "HSR Distance >5.5 m/s"), `sprint_distance` (label: "Sprint Distance >7.0 m/s") |
| Colors | HSR: blue, Sprint: red |
| Reference line | Match HSR benchmark (horizontal dashed line from match reference `hsr`) |
| Optimal band | 60–90% of match HSR reference shaded light green |
| Data window | 12 weeks |

---

## References

- Cometti G, et al. (2001). Isokinetic strength and anaerobic power of elite, subelite and amateur French soccer players. *Int J Sports Med.*
- Di Salvo V, et al. (2009). Analysis of high intensity activity in Premier League soccer. *Int J Sports Med.*
- Issurin VB. (2008). Block periodization versus traditional training theory: a review. *J Sports Med Phys Fitness.*
- Malone S, et al. (2017). High chronic training loads and exposure to bouts of maximal velocity running reduce injury risk in elite Gaelic football. *JOSPT*, 47(12).
- Morin JB, Samozino P. (2016). Interpreting power-force-velocity profiles for individualized and specific training. *Int J Sports Physiol Perf.*
- Vescovi JD, McGuigan MR. (2008). Relationships between sprinting, agility, and jump ability in female athletes. *J Sports Sci.*
