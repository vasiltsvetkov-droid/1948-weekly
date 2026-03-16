# Position-Specific Demands

## Source Sections
- §14 Position-Specific Demands
- §1.3 Position-Specific Running Demands
- §10.4 Position-Specific Volume Differences

---

## Key Postulates

1. **Position determines physical loading profile.** Wide midfielders perform the most sprints per match (35.8 +/- 13.4), central midfielders cover the most total distance (up to 13,000 m), and central defenders have the lowest total distance but highest duel intensity (Di Salvo et al. 2009; Bradley et al. 2013).

2. **Weekly training targets must be position-specific.** A one-size-fits-all weekly volume prescription under-prepares some positions and over-loads others. GPS monitoring should benchmark against position-specific weekly targets, not squad averages.

3. **Training priorities differ by position.** CB: explosive strength, reactive power, short acceleration (0-5 m). FB: repeat sprint ability, hip flexor strength, change of direction. CM: aerobic power, strength endurance. WM: maximal speed development, sprint mechanics, F-V profiling. ST: explosive power, SSC efficiency, plyometric volume.

4. **Injury profiles are position-dependent.** CB: adductor strains, hamstring (deceleration-based), ACL. FB: bilateral asymmetry creates unique injury risk. WM: highest sprint volume drives hamstring injury risk. Position-specific injury prevention should guide S&C programming.

5. **PlayerLoad often underrepresents true physical load for central defenders** due to high contact frequency and body challenges not captured by GPS distance metrics (Boyd et al. 2011).

---

## Thresholds & Decision Rules

### Weekly GPS Training Targets by Position

| Position | Weekly TD (km) | Weekly HSR (km) | Weekly Sprints | Weekly Accels | Key Characteristic |
|----------|---------------|-----------------|----------------|---------------|-------------------|
| CB (Central Back) | 40-50 | 2.0-3.5 | 100-150 | 400-600 | Lowest TD; high duel intensity |
| FB (Full Back) | 50-65 | 3.5-5.0 | 150-220 | 500-700 | High HSR; bilateral asymmetry |
| CM (Central Midfielder) | 55-70 | 3.0-4.5 | 120-180 | 500-700 | Highest TD; box-to-box |
| WM (Wide Midfielder) | 50-65 | 4.0-6.0 | 180-280 | 550-750 | Highest sprint count |
| ST (Striker) | 45-58 | 3.5-5.0 | 140-200 | 450-650 | Short sprints, explosive actions |

### Match Running Demands by Position

| Position | Match TD (m) | Match HSR >5.5 m/s (m) | Sprints/Match | Key Match Profile |
|----------|-------------|------------------------|---------------|-------------------|
| CD | 10,200-11,500 | 350-600 | 20-35 | Lowest total distance; high defensive duel intensity |
| FB | 11,000-12,500 | 700-1,000 | 30-50 | High HSR, bilateral asymmetry attack/defense |
| CM | 11,500-13,000 | 600-900 | 25-40 | Highest total distance; box-to-box |
| WM | 11,000-12,500 | 900-1,200 | 35.8 +/- 13.4 | Highest sprint count |
| ST | 10,000-11,500 | 600-900 | 25-40 | Short sprints, explosive actions |

### Position-Specific Training Priorities

| Position | Primary Training Priority | Secondary Priority | Strength Emphasis |
|----------|--------------------------|-------------------|------------------|
| CB | Explosive strength, reactive power | 1v1 aerial duels, 0-5 m acceleration | High (relative strength, duels) |
| FB | Repeat sprint ability (RSA) | Hip flexor strength, change of direction | Speed-endurance, repeat sprint |
| CM | Aerobic capacity (VO2max >60 mL/kg/min) | Strength endurance, high volume SSG | Aerobic capacity, endurance |
| WM | Maximal speed development | RSA, sprint mechanics, F-V profiling | Speed, acceleration, RSA |
| ST | Explosive power, SSC efficiency | Plyometric volume, short sprint (2-8 m) | Power, explosive actions |

---

## Analysis Templates

### Position Benchmark Comparison

```
Player Position: ${position}

WEEKLY LOAD vs POSITION BENCHMARKS:
- Total Distance: ${total_dist} km vs position target range
- HSR Distance: ${hsr_dist} km vs position target range
- Sprint Count: ${sprint_count} vs position target range
- Acceleration Count: ${accel_count} vs position target range

INTERPRETATION FRAMEWORK:
- If metric < lower bound of position range:
  "Under-exposure risk for ${position}. Current ${metric_name} of ${metric_value} is below the
  position-specific minimum target. Chronic under-loading at this position reduces match readiness
  and may leave the player under-prepared for the demands of competition. Consider increasing
  ${metric_name} volume progressively (max 10% week-on-week) toward the position-specific range."

- If metric is within position range:
  "On target for ${position}. Current ${metric_name} of ${metric_value} is within the expected
  weekly range for this position. Maintain current loading and monitor ACWR to ensure the acute
  load remains within the 0.8-1.3 sweet spot relative to the 4-week chronic baseline."

- If metric > upper bound of position range:
  "Over-exposure risk for ${position}. Current ${metric_name} of ${metric_value} exceeds the
  position-specific upper target. This may indicate excessive volume that increases injury risk,
  particularly for soft tissue injuries specific to this position. Review session composition
  and consider redistributing load across the microcycle."
```

---

## Chart Specifications

### Position Benchmark Comparison

```yaml
chart_type: grouped-bar
title: "Position Benchmark Comparison"
description: "Current weekly metrics vs position-average match demands, grouped by metric"
x_axis:
  label: "Metric"
  categories:
    - "Total Distance (km)"
    - "HSR Distance (km)"
    - "Sprint Count"
    - "Acceleration Count"
y_axis:
  label: "Value"
  type: linear
  auto_scale: true
series:
  - name: "Current Week"
    metrics: [total_dist, hsr_dist, sprint_count, accel_count]
    color: "#2c3e50"
  - name: "Position Target (Low)"
    source: position_benchmarks_low
    color: "#95a5a6"
    opacity: 0.6
  - name: "Position Target (High)"
    source: position_benchmarks_high
    color: "#95a5a6"
    opacity: 0.6
  - name: "Position Match Average"
    source: position_match_avg
    color: "#e74c3c"
    style: marker
grouping: by_metric
bar_style:
  width: 0.25
  gap: 0.05
annotations:
  - type: range_band
    source: position_target_range
    color: "#27ae60"
    opacity: 0.15
    label: "Target Range"
```

---

## References

- Di Salvo V, et al. (2007). Performance characteristics according to playing position in elite soccer. *Int J Sports Med*.
- Di Salvo V, et al. (2009). Analysis of high intensity activity in Premier League soccer. *Int J Sports Med*.
- Bradley PS, et al. (2009). High-intensity running in English FA Premier League soccer. *J Sports Sci*.
- Bradley PS, et al. (2013). Match performance and physical capacity of players in the top three competitive standards of English professional soccer. *Human Movement Science*.
- Boyd LJ, et al. (2011). The reliability of MinimaxX accelerometers for measuring physical activity in Australian football. *Int J Sports Physiol Perf*.
- Malone S, et al. (2017). High chronic training loads and exposure to bouts of maximal velocity running reduce injury risk. *JOSPT*, 47(12).
