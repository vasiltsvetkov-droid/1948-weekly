# Soccer Sports Science Reference
## Practitioner-Focused Knowledge Base: Senior Male and Female Soccer

**Scope:** Senior soccer (football), male and female, elite and sub-elite. Covers load management, GPS monitoring, periodisation, injury prevention, testing, normative data, training patterns, S&C, recovery, and female athlete health. Author-year inline citations throughout. Intended for LLM training and applied practitioner use.

---

## 1. Load Monitoring Foundations

### Internal versus external load

**External load** is the objective, quantifiable work output of the player — total distance, high-speed running, sprint distance, acceleration counts, and player load (Halson, 2014; Bourdon et al., 2017). **Internal load** is the physiological and psychological response within the player to that work — heart rate, blood lactate, RPE, hormonal markers, and HRV (Impellizzeri et al., 2019). The same external training session produces different internal loads in different players depending on fitness, accumulated fatigue, psychological state, illness, and environmental conditions. Monitoring only external load without tracking the internal response is insufficient.

Two athletes performing identical GPS-measured work can have internal load responses diverging by 30–50% (Impellizzeri et al., 2004). A dissociation between external load (maintained or declining) and internal load (rising) is one of the earliest detectable signs of accumulated fatigue, illness, or maladaptation (Halson, 2014). Practical rule: when sRPE-derived internal load rises while GPS-derived external load stays flat or drops, reduce intensity or investigate causes before proceeding.

### Session RPE: the most practical internal load tool

The **session RPE (sRPE) method** (Foster et al., 2001) uses CR-10 scale RPE collected **30 minutes post-session** (not immediately after, to avoid end-of-session recency bias) and multiplied by session duration in minutes to yield training load in arbitrary units (AU).

**sRPE-TL = CR-10 RPE × Session duration (min)**

sRPE correlates at **r = 0.50–0.85** with HR-based TRIMP in soccer (Impellizzeri et al., 2004), is valid across sexes and competition levels, requires no technology, and is sensitive enough to distinguish training day intensity across the microcycle. Practitioners should collect sRPE privately (not publicly) to avoid social desirability bias, and train players to use the CR-10 scale standardly.

**Typical sRPE-TL benchmarks in elite soccer:**
- Match: 500–850 AU (varies by playing time, position, intensity)
- MD−4 acquisition: 350–500 AU
- MD−3 acquisition: 350–500 AU
- MD−2 tapering: 250–350 AU
- MD−1 activation: 100–200 AU
- MD+1 (starters, recovery): 50–100 AU
- MD+1 (non-starters, compensatory): 250–400 AU

### TRIMP variants for heart rate-based internal load

**Banister's TRIMP** (Banister, 1991): TRIMP = Duration (min) × ΔHR ratio × weighting factor.
- ΔHR ratio = (HRex − HRrest) / (HRmax − HRrest)
- Weighting factor: **0.64 × e^(1.92 × ΔHR ratio)** for males; **0.86 × e^(1.67 × ΔHR ratio)** for females

**Edwards' TRIMP**: Time in five HR zones × zone multipliers (1, 2, 3, 4, 5). Simpler, does not require individualised parameters. Widely used in soccer teams.

**Lucia's TRIMP**: Three zones anchored to ventilatory thresholds, with multipliers 1, 2, 3. Requires VT1 and VT2 values from lab testing (Lucia et al., 2003).

**Individualised TRIMP (iTRIMP)** (Manzi et al., 2009): Uses individual blood lactate curves to derive personal weighting constants. Most physiologically accurate, but requires laboratory testing and is rarely used in team sport daily monitoring.

### ACWR: calculation, thresholds, and limitations

The **Acute:Chronic Workload Ratio** divides the acute workload (7-day) by the chronic workload (28-day) (Gabbett, 2016):

**ACWR = 7-day load / 28-day load**

The traditionally cited "sweet spot" of **0.8–1.3** is associated with lowest injury risk, while **ACWR >1.5** is associated with a **2–4× increase in injury risk** (Gabbett, 2016; Malone et al., 2017). **Exponentially weighted moving averages (EWMA)** give more weight to recent data and are more sensitive than rolling averages for detecting injury likelihood (Murray et al., 2017; Williams et al., 2017).

**Limitations of ACWR (important to understand):**
- Impellizzeri et al. (2020, 2021) showed that substituting randomly generated chronic loads produced similar injury odds ratios to real data, challenging the causal model
- Wang et al. (2020) showed the ACWR-injury relationship disappeared when data were treated as continuous rather than binned into categories
- Correlation-based evidence does not support the specific 0.8–1.3 threshold as a universal standard
- High chronic load is protective regardless of acute:chronic ratio — training capacity matters more than the ratio alone

**Practical stance:** Use ACWR as one informational tool within a multivariate monitoring system. Do not apply rigid thresholds as automated intervention triggers. Prefer uncoupled calculations (separate acute and chronic denominators). Track individual trends over population norms.

### Monotony and strain

Monotony and strain (Foster, 1998) detect dangerous training patterns regardless of absolute load volume.

- **Monotony** = Mean daily load / SD of daily load (values >2.0 signal insufficient variation)
- **Strain** = Weekly load × Monotony (high strain with high monotony is the dangerous combination)
- Monotony >2.0 combined with high weekly load is associated with elevated illness and overtraining risk (Foster, 1998)
- Practical fix: vary session content, duration, and intensity day-to-day to keep monotony <1.5

### Decision rules for load adjustment

| Scenario | Decision | Rationale |
|---|---|---|
| ACWR 0.8–1.3, monotony <1.5, wellness scores normal | Maintain current plan | Adaptive training zone |
| ACWR <0.8, chronic load building phase | Increase load gradually (≤10%/week) | Under-preparation risk for competition |
| ACWR >1.5, rising sRPE vs flat/declining GPS | Reduce acute load, increase recovery emphasis | Overload and injury risk zone |
| Monotony >2.0 + high weekly TL | Vary session type, intensity, duration | Overtraining and illness risk |
| sRPE high but GPS load normal (internal-external dissociation) | Investigate fatigue, illness, sleep, nutrition | Early maladaptation signal |
| CMJ drop >5% from rolling 4-week mean | Reduce next session intensity or volume | Neuromuscular fatigue accumulation |
| ≥2 wellness items scoring low simultaneously | Flag player, consider load reduction | Cumulative stress signal |
| Player recently recovered from illness | Reduce acute load for 5–7 days post-illness | Immune suppression window |

---

## 2. GPS Monitoring in Soccer

### Key GPS metrics and thresholds

GPS systems quantify external load across multiple variables. Standard speed zones used in elite soccer (Gualtieri et al., 2023; Abt and Lovell, 2009):

| Zone | Name | Speed Threshold (Male) | Speed Threshold (Female) |
|---|---|---|---|
| Zone 1 | Walking | <7.0 km/h | <7.0 km/h |
| Zone 2 | Jogging | 7.0–14.4 km/h | 7.0–12.0 km/h |
| Zone 3 | Running | 14.4–19.8 km/h | 12.0–16.0 km/h |
| Zone 4 | High-speed running (HSR) | 19.8–25.2 km/h | 16.0–20.0 km/h |
| Zone 5 | Very high-speed running (VHSR) | 25.2–30.0 km/h | 20.0–24.0 km/h |
| Zone 6 | Sprint | >30.0 km/h | >24.0 km/h |

Acceleration/deceleration thresholds: **>2 m/s²** (moderate intensity), **>3 m/s²** (high intensity), **>4 m/s²** (maximal). Accelerations and decelerations are metabolically costly and neuromuscularly demanding, and are frequently underestimated by speed-zone analysis alone.

**Player Load** (Catapult proprietary metric): Sum of triaxial accelerometer data over a session, capturing collisions, jumps, tackles, and kicking — movements not captured by GPS distance alone. Correlates strongly with total distance (r = 0.88–0.96) and sRPE (r = 0.72–0.85) (Casamichana et al., 2013).

**Metabolic power** (di Prampero et al., 2005): Instantaneous energy cost estimate treating accelerated running as equivalent to uphill running at constant speed. High-intensity threshold: **>20 W/kg**. Captures approximately **6% more high-intensity activity** than speed-based analysis alone because it accounts for accelerations at lower speeds (Gaudino et al., 2013). However, the metabolic power model has been criticised for overestimating energy cost during high-intensity change-of-direction movements and underestimating at low accelerations.

### GPS hardware reliability

| System | Sampling Rate | Distance CV | HSR CV | Notes |
|---|---|---|---|---|
| Catapult Vector S7 | 10 Hz GPS + 100 Hz IMU | 0.17–1.3% | 4.8–7.2% | Most widely validated; ICC >0.95 for TD |
| STATSports Apex Pro | 10 Hz GPS + 600 Hz IMU | ~1.5% | ~5.5% | High IMU resolution; good COD detection |
| Polar Team Pro | 10 Hz GPS + HR | ~2.0% | ~8–11% | Good HR integration |
| GPSports SPI Pro X | 10 Hz GPS | ~2.2% | ~9–12% | Older system; less used now |

Minimum acceptable sampling rate: **10 Hz** for reliable high-speed tracking (Scott et al., 2016; Johnston et al., 2014). At 5 Hz, HSR data may contain errors >15%. VHSR CV can exceed 11.5% even at 10 Hz — treat VHSR and sprint counts with appropriate caution for individual sessions.

**Critical operational rules:**
- Assign each player the **same physical GPS unit** across all sessions (unit interchangeability is poor for high-speed metrics)
- **Never compare data between manufacturers** due to proprietary algorithm differences
- Allow 45–60 seconds acquisition time before session begins
- Record satellite count (>6 satellites) and horizontal dilution of precision (HDOP <2.0) as data quality markers
- Avoid use in covered stadiums or training facilities with poor satellite visibility — these systematically underestimate HSR and VHSR

### Absolute versus individualised speed thresholds

Absolute thresholds apply the same km/h cutoff to all players. This treats a player running at 25 km/h identically regardless of whether their maximum sprint speed (MSS) is 28 km/h or 35 km/h — a large and physiologically meaningful difference (Hunter et al., 2015).

**Individualised threshold approaches:**

1. **Maximal Aerobic Speed (MAS) / Anaerobic Speed Reserve (ASR):** MAS from a field test (30-15 IFT → VIFT ≈ MAS; or ~120% of 1-mile run speed). ASR = MSS − MAS. Zone thresholds expressed as % MAS (e.g., >100% MAS = high-intensity zone).

2. **% MSS thresholds:** High-speed running at **>70% MSS**, very high-speed at **>80% MSS**, sprint at **>90% MSS** (Buchheit and Simpson, 2017). This accounts for maximal velocity differences across players.

**Female-specific threshold consideration:** Female elite soccer players have lower absolute sprint speeds (average MSS ~27–29 km/h vs. ~31–34 km/h for males). Using the same absolute 25.2 km/h threshold underestimates female high-intensity output. Using relative thresholds based on MSS better captures true physiological demand (Nakamura et al., 2017; Compton et al., 2025).

### GPS decision-making framework in soccer

**Session-level decisions:**
- Compare today's external load (TD, HSR, sprint) to the target for that microcycle day (see Section 3 training week benchmarks)
- Flag sessions where HSR or sprint deviations exceed ±20% of target
- Cross-reference with sRPE collected 30 minutes post-session

**Weekly decisions:**
- Sum weekly TD, HSR, sprint distance, and accelerations
- Compare to preceding 4-week average; flag if acute:chronic exceeds 1.5
- Identify players receiving below-threshold HSR/sprint exposure (common for bench/rotation players)

**Seasonal decisions:**
- Track 4-week rolling averages to identify progressive overload or under-load periods
- Match demands should calibrate training targets — if HSR in matches increases during playoffs, chronic training HSR must be built accordingly

**Training-to-match ratios (TMR):** Compare HSR and sprint distances in training to match demands. Data consistently show training **under-doses sprint exposure**: TMR for sprint distance can be as low as **0.03–1.3** (Gualtieri et al., 2023), meaning players rarely reach match-level sprint demands in training. Small-sided games on small pitches (<100 m² per player) produce negligible sprint distances. This is a systematic gap in most soccer training programmes.

**Practical solution:** Deliberately include **large-sided games (>225 m² per player)** for HSR exposure and **>300 m² per player** for sprint exposure, or combine SSGs with **speed endurance runs** (90–120 m × 4–8 reps, 2–3 min rest) to ensure players reach match-level sprint exposures in training (Gualtieri et al., 2023).

---

## 3. Soccer Match Demands

### Male elite match demands

| Metric | Centre Back | Full Back | Central Mid | Wide Mid/Winger | Striker | Average |
|---|---|---|---|---|---|---|
| Total distance (km) | 10.8–11.5 | 11.0–12.5 | 11.5–12.8 | 11.2–13.5 | 10.5–12.0 | 10.5–13.0 |
| HSR distance (m, >19.8 km/h) | 600–900 | 900–1,300 | 800–1,100 | 1,000–1,500 | 900–1,300 | 800–1,200 |
| Sprint distance (m, >25.2 km/h) | 150–250 | 250–380 | 180–300 | 300–500 | 250–400 | 200–400 |
| Number of sprints | 10–20 | 25–40 | 15–25 | 30–50 | 20–35 | 15–40 |
| Accelerations (>3 m/s²) | 30–50 | 40–70 | 40–60 | 50–80 | 40–70 | 40–65 |

Sources: Martín-García et al. (2018); Gualtieri et al. (2023); Buchheit et al. (2021). Note: thresholds and position groupings vary between studies; these represent central estimates from elite UEFA-level competition.

Over the last 15 years, HSR volume in elite men's soccer has increased approximately **29%** and sprint distance approximately **50%** (Gualtieri et al., 2023), reflecting the increasing physical demands of the modern game. This has direct implications for training design: historical benchmarks are likely underestimates of current match demands.

### Female elite match demands

| Metric | Centre Back | Full Back / Wide Mid | Central Mid | Striker | Average |
|---|---|---|---|---|---|
| Total distance (km) | 9.5–10.5 | 10.0–11.5 | 10.5–11.5 | 9.5–11.0 | 9.0–11.5 |
| HSR distance (m, >16.0 km/h) | 1,200–1,600 | 1,600–2,200 | 1,800–2,500 | 1,400–2,000 | 1,400–2,100 |
| HSR distance (m, >19.8 km/h) | 500–700 | 700–1,100 | 700–1,000 | 600–900 | 600–1,000 |
| Sprint distance (m, >24 km/h) | 80–180 | 150–300 | 120–250 | 150–280 | 120–250 |

Sources: Datson et al. (2014, 2017); Gualtieri et al. (2023); Compton et al. (2025).

**Key sex difference in match demands:** Female players cover approximately **10–15% less total distance** and produce **40–55% less sprint distance** than male counterparts in elite competition, largely explained by differences in maximal sprint speed rather than aerobic capacity (Datson et al., 2017). Wide midfielders in female soccer cover the most total distance (~10,985 m) and HSR (~2,882 m at relative thresholds). Approximately **76% of sprints in female soccer are under 5 m** and 95% are under 10 m, emphasising the importance of short-distance acceleration capacity over top-speed running (Datson et al., 2017).

### Post-match neuromuscular fatigue timeline

| Timepoint | CMJ Change | Perceptual Soreness | CK | Sprint Performance | Recommended Training |
|---|---|---|---|---|---|
| Immediately post-match | −10 to −14% | Low–Moderate | Elevated | −5 to −8% | Recovery only |
| 24 hours | −5 to −8% (often lowest point) | Peak soreness | Very high (~1,000–2,000 IU/L) | −4 to −6% | Active recovery, regeneration |
| 48 hours | −2 to −5% | High but declining | Elevated | Near-baseline | Light technical or gym work |
| 72 hours | Approaching baseline | Moderate | Still elevated in some | Recovered | Return to acquisition training |
| 96 hours | Baseline or above | Low | Near-baseline | Baseline | Full training resumable |

Sources: Nédélec et al. (2012, 2014); Brownstein et al. (2017); Silva et al. (2018).

**Female-specific recovery:** A systematic review and meta-analysis (González-García et al., 2022) found CMJ in female players shows **delayed onset of decline** (not significantly impaired immediately post-match, ES = −0.04; declining at 12–24 h, ES = −0.38 to −0.42), while CK and LDH remain significantly elevated at 72 h (ES = 3.79 and 7.46 respectively). Female players may experience **less acute neuromuscular impairment** but **prolonged metabolic marker elevation** compared to males. Practical implication: female soccer microcycles may need to retain the same recovery window as male equivalents despite the initial CMJ data appearing better.

**Congested fixtures (≤3–4 days between matches):**
- Reduce weekly training volume by 30–40%
- Eliminate or compress acquisition sessions
- Preserve intensity in short activation sessions
- Implement squad rotation — match exposure is the primary load driver
- Dupont et al. (2010): playing 2 matches/week associated with ~6× higher injury rate vs 1 match/week
- CK concentrations from match 2 are significantly higher than match 1 in 3-day turnarounds, indicating incomplete metabolic recovery even when CMJ appears restored

---

## 4. Soccer Training Week Structure

### Single-match week microcycle (standard 7-day block)

The training week is structured around match day (MD) using a three-phase model: **recovery phase (MD+1, MD+2)**, **acquisition phase (MD−4, MD−3)**, and **tapering phase (MD−2, MD−1)** (Buchheit et al., 2021; Frade, 2003).

| Day | Phase | Volume (% match TD) | HSR Target (% match) | Acc/Dec Focus | Session Character |
|---|---|---|---|---|---|
| MD (Match) | Competition | 100% | 100% | High | Competition |
| MD+1 (starters) | Recovery | 7–15% | 0–5% | Low | Pool, bike, massage, light jog |
| MD+1 (non-starters) | Compensatory | 60–80% | 50–70% | Moderate | Running, SSGs, match intensity |
| MD+2 | Full rest or active recovery | — | — | None | Day off or walk/stretch |
| MD−4 | Acquisition 1 | 50–65% | 30–50% | Moderate–High | Strength, small-pitch SSGs |
| MD−3 | Acquisition 2 | 55–70% | 40–60% | Moderate–High | Speed endurance, large-pitch SSGs |
| MD−2 | Tapering 1 | 40–55% | 20–35% | Low–Moderate | Tactical, set pieces, positional |
| MD−1 | Tapering 2 | 25–35% | 10–20% | Low | Activation, brief, 45–60 min max |

Sources: Buchheit et al. (2021); Teixeira et al. (2022); Casas et al. (2025).

**Rest day placement:** MD+2 rest day is associated with **2–3× lower non-contact injury rate** compared to training at MD+2 (Buchheit et al., 2023). MD+1 rest for starters is also common, with MD+2 used for light recovery sessions.

### Managing starters versus non-starters

Non-starters in professional soccer accumulate significantly lower weekly loads than starters, with between-group effect sizes of **d = 0.40–0.49** for total distance and **d = 0.62–0.74** for HSR and sprint distance (Teixeira et al., 2022). This creates a chronic load deficiency in rotation players who then face sudden acute load spikes when called upon to play. Strategies:

1. **MD+1 compensatory session** for non-starters: running-based session or SSG targeting 60–80% of match distances
2. **Individual load top-ups**: dedicated speed endurance runs for players below weekly HSR targets
3. **Track individual chronic load weekly**: non-starters who drop below 50% of their own baseline HSR exposure for 2+ weeks become match-unfit

### Double-match week (≤3–4 days between matches)

With two matches in one week, the acquisition phase is eliminated. The microcycle compresses to:
- Match 1 → MD+1 recovery → short activation/tactical session → Match 2

Where possible, insert 48 hours between Match 1 and next training. Prioritise sleep, nutrition, and passive recovery. Gym work is contraindicated between matches unless the player is a chronic non-starter needing load stimulus. Individual readiness should gate training participation using CMJ or wellness data.

### Training methods: SSGs, possession, position-specific

**Small-sided games (SSGs)** are the dominant training tool in soccer, combining physical, technical, and tactical demands simultaneously. Physical output varies sharply with pitch size, player numbers, and rules (Dellal et al., 2012):

| SSG Format | Pitch Size (m²/player) | TD (m) | HSR (m) | Sprint Distance (m) | sRPE |
|---|---|---|---|---|---|
| 3v3 | 60–100 | 4,000–5,500 | 200–400 | <50 | 6–7/10 |
| 5v5 | 100–180 | 5,500–7,500 | 400–700 | 50–150 | 5–7/10 |
| 8v8 | 200–280 | 7,000–9,000 | 800–1,400 | 100–250 | 5–6/10 |
| 11v11 | 700–900 | 9,500–12,000 | 1,200–2,000 | 200–400 | 4–6/10 |

To replicate match-level sprint demands, pitch area must exceed **300 m² per player**. Most club SSG training uses smaller pitches, systematically under-dosing sprint exposure.

**Speed endurance training** (Bangsbo, 2012) directly targets HSR and sprint fitness. Two types:
- **Speed endurance production:** 2–6 × 20–40 s at 90–100% maximal effort, 3–5 min rest, develops sprint capacity
- **Speed endurance maintenance:** 8–12 × 30 s at 80–90% maximal effort, 1–2 min rest, develops repeat sprint ability

---

## 5. Periodisation in Soccer

### Season structure

**Pre-season (4–8 weeks, typically June–August for northern hemisphere clubs):**
- General preparation (weeks 1–2): aerobic base, anatomical adaptation strength, conditioning runs, low ball work
- Specific preparation (weeks 3–5): increased ball work, SSG volume, power strength, speed development
- Pre-competition (weeks 6–8): tactical organisation, match simulation, taper to first competitive match
- Volume peaks in early pre-season; intensity increases progressively through the block
- Target: enter first competitive match with chronic load >70% of anticipated in-season average

**In-season (30–42 weeks):** Maintenance of physical qualities through the microcycle structure above. Strength: 2 × 2–4 sets × 3–6 reps at ≥85% 1RM maintains gains. Speed qualities need direct exposure through training ≥2× weekly to avoid detraining.

**Off-season/transition (3–6 weeks):** Active rest and rehabilitation. Aerobic base maintained with 2–3 low-intensity sessions per week. Full detraining (complete rest) causes VO2max decline of ~7% within 12 days (Coyle et al., 1984) and muscle strength loss from week 3–4.

### Tactical periodisation

**Tactical periodisation** (Frade, 2003; Mourinho application; reviewed by Delgado-Bordonau and Mendez-Villanueva, 2012; Tamarit, 2014) organises the entire training week around the team's game model. All physical conditioning is delivered through game-related exercises, with the dominant training principle for each day determined by the specific muscular contraction type required:

| Morphocycle Day | Dominant Contraction Type | Scale of Play | Duration | Physical Focus |
|---|---|---|---|---|
| MD−4 | Eccentric (tension-strength) | Sub-principles | 60–75 min | Reduced contacts, high neuromuscular load |
| MD−3 | Aerobic-dominant (duration-endurance) | Main principles | 75–90 min | Large groups, higher volume |
| MD−2 | Explosive/concentric (velocity-strength) | Sub-sub-principles | 45–60 min | Fast, intense, short, explosive |
| MD−1 | Low intensity (recovery activation) | Individual | 25–45 min | Minimal fatigue, mental readiness |

Tactical periodisation has gained widespread use in Europe and South America despite limited controlled experimental evidence for its superiority over other methods (Delgado-Bordonau and Mendez-Villanueva, 2012). Its primary strength is the integration of tactical and physical development within the same exercises.

### Traditional versus tactical periodisation comparison

| Feature | Traditional/Physical | Tactical Periodisation |
|---|---|---|
| Physical development method | Isolated running, gym | Game-embedded exercises |
| Tactical integration | Separate sessions | All sessions are tactical |
| Periodisation driver | Volume/intensity manipulation | Game model and morphocycle |
| Evidence base | Strong (controlled trials) | Limited RCT evidence |
| Flexibility for multi-match weeks | Variable | More structured framework |
| Use in elite clubs | Common | Growing, especially Europe |

---

## 6. Injury Prevention in Soccer

### Epidemiology of soccer injuries

The UEFA Elite Club Injury Study (Ekstrand et al., 2011, 2016, 2023) tracking 50+ professional clubs annually provides the most comprehensive soccer injury data:

| Injury Type | Incidence (per 1,000 h) | % of All Injuries | Average Absence (days) |
|---|---|---|---|
| Hamstring strain | 0.9–1.2 (match), 0.1–0.2 (training) | 12–17% | 14–21 |
| Groin/adductor | 0.5–0.8 (match) | 10–13% | 14–28 |
| Ankle sprain | 0.5–0.7 (match) | 10–14% | 7–14 |
| ACL rupture | 0.06–0.08 (match) | 1–3% | 150–250+ |
| Knee MCL | 0.2–0.4 (match) | 4–6% | 21–40 |
| Calf/gastrocnemius | 0.3–0.5 (match) | 5–8% | 7–21 |
| Thigh contusion | 0.3–0.5 (match) | 5–8% | 3–10 |

Injuries per club per season average **50.4** (Ekstrand et al., 2023). Champions League clubs record significantly higher injury burdens than UEFA average, likely due to higher match density. **Hamstring injuries** remain the most prevalent across 20 years of study.

### FIFA 11+: the cornerstone prevention programme

The **FIFA 11+ warm-up programme** (Soligard et al., 2008) is the most evidence-backed injury prevention protocol in soccer. It takes approximately **20 minutes** and replaces the standard warm-up, comprising three parts:

**Part 1: Running exercises (6 exercises, ~8 min)**
1. Running straight ahead (at half pace, then full)
2. Hip out
3. Hip in
4. Circling partner
5. Jumping with shoulder contact
6. Quick forwards and backwards

**Part 2: Strength, plyometrics, and balance (6 exercises, ~10 min, each with 3 progressions)**
1. The bench (plank progressions)
2. Sideways bench (side plank progressions)
3. Hamstrings (Nordic curl progressions)
4. Single leg balance (eyes open → closed → with ball)
5. Squats with toe raises
6. Jumping (two-foot → single-leg → bounding)

**Part 3: Running (3 exercises, ~2 min)**
Running at 75–80% pace with cutting, planting, and acceleration exercises.

**Evidence for FIFA 11+:**
- Original RCT (Soligard et al., 2008): **32% reduction in overall injury rate**, 47% reduction in overuse injuries, 55% reduction in severe injuries (n = 1,892 female amateur players)
- Male collegiate study (Silvers-Granelli et al., 2015): **46.1% total injury reduction**, 63.9% reduction in ACL injuries (n = 1,800 male players)
- Systematic review (Bizzini and Dvorak, 2015): 30–50% injury reduction across studies
- Meta-analysis (Al Attar et al., 2016): significant injury reduction across populations; ankle sprains −50%, hamstring injuries −52%
- **Compliance is the critical variable**: teams with high compliance (>15 sessions) show significantly greater reduction than teams with intermediate or low compliance (Steffen et al., 2013)
- Implementation barrier: ~40% of coaches report time constraints; solution is to replace existing warm-up rather than add to it

### Nordic Hamstring Exercise (NHE)

The Nordic Hamstring Exercise is the most evidence-backed single exercise for hamstring injury prevention in soccer (van der Horst et al., 2015; Al Attar et al., 2017; van Dyk et al., 2019).

**Standard NHE protocol:**

| Week | Sessions/Week | Sets × Reps | Volume (reps/week) |
|---|---|---|---|
| 1–2 | 1 | 2 × 5 | 10 |
| 3–4 | 2 | 2 × 6 | 24 |
| 5–6 | 3 | 3 × 6–8 | 54–72 |
| 7–10 | 3 | 3 × 10 | 90 |
| 11–13 | 3 | 3 × 12-10-8 | 90 |
| Maintenance | 1–2 | 2 × 8–10 | 16–20 |

Protocol based on van der Horst et al. (2015) and Petersen et al. (2011).

**Evidence summary:**
- van der Horst et al. (2015): **72% reduction** in hamstring injury incidence (OR = 0.282) in amateur soccer
- Petersen et al. (2011): **60% lower rate** of overall hamstring injuries in professional soccer (NNT = 25)
- Meta-analysis (Al Attar et al., 2017; van Dyk et al., 2019): **51% reduction** in hamstring injuries across sports
- Implementation challenge: despite strong evidence, only ~11% of Champions League clubs regularly use NHE (Bahr et al., 2015)
- Primary barrier: **delayed-onset muscle soreness (DOMS)** in weeks 1–3, particularly in players with no prior eccentric hamstring training
- Mitigation: start with reduced volume (2 × 5), give 72 hours between NHE sessions, conduct in start of season before fitness training ramps

**Hamstring injury risk factors (screen for):**
- Previous hamstring injury (strongest predictor, RR = 2.1–6.0; Petersen et al., 2011)
- Poor eccentric hamstring strength (H:Q functional ratio < 0.8)
- Asymmetry in eccentric strength >15% between limbs (Croisier et al., 2008)
- High acute sprint load in first 4 weeks of pre-season
- Advanced age (>28 years) in male players

### ACL injury prevention in female soccer

Female soccer players sustain **2–8× more ACL injuries** than males. In NCAA data (2009–2019), the rate ratio was **3.10** (women's vs men's soccer) (Dalton et al., 2020). Contributing factors:

**Biomechanical/neuromuscular:**
- Greater knee valgus during cutting and landing
- Quadriceps dominance (lower H:Q ratio than males)
- Stiffer landing mechanics with less knee and hip flexion
- Delayed hamstring activation relative to quadriceps

**Anatomical:**
- Wider Q-angle (12–15° women vs 8–10° men)
- Smaller ACL cross-sectional area relative to body mass
- Narrower intercondylar notch

**Hormonal:**
- Estrogen receptors on ACL tissue; elevated estrogen during pre-ovulatory phase may transiently reduce ligament stiffness
- Meta-analysis (Herzberg et al., 2017): oral contraceptive users had **20% lower ACL injury rate** — mechanism unclear, possibly hormonal or through athlete lifestyle factors

**Practical prevention protocol:**
- Implement year-round neuromuscular training programmes (FIFA 11+ is sufficient foundation)
- Add specific plyometric landing mechanics training: bilateral → unilateral → reactive tasks
- Screen for high knee valgus during landing (tuck jump, LESS assessment)
- Include hip abductor and external rotator strengthening (resistance band clams, lateral band walks, cable hip abduction)
- Never modify training to avoid certain cycle phases — apply neuromuscular programmes consistently

### ACL return-to-play criteria

Return to competitive play requires meeting criteria across multiple domains simultaneously (Grindem et al., 2016; Ardern et al., 2016):

| Domain | Criterion | Notes |
|---|---|---|
| Time post-surgery | ≥9 months | <9 months: 7× reinjury risk (Grindem et al., 2016) |
| Quadriceps LSI | ≥90% | Isometric or isokinetic at 60°/s |
| Hamstring LSI | ≥90% | Isokinetic at 60°/s |
| Hop test battery LSI | ≥90% all 4 tests | Single-hop, triple-hop, crossover-hop, 6m timed hop |
| Psychological readiness | ACL-RSI ≥65 (recommended), ≥56 (minimum) | 0–100 scale; <56 associated with poor outcomes |
| Sport-specific movement | No pain, valgus, or hesitation | Cutting, deceleration, reactive agility tasks |
| Training load | Completed ≥2 weeks full squad training | Not cleared on test results alone |

Meeting these criteria reduces reinjury risk by **84%** compared to time-only clearance (Grindem et al., 2016). ACL-RSI score is the strongest single predictor of successful return to pre-injury level (Ardern et al., 2015).

### Ankle sprain prevention

Ankle sprains are the second most common soccer injury (10–15% of all injuries). Prevention evidence:

- **Balance training** (balance board, single-leg progressions): 36% reduction in lateral ankle sprains (Schiftan et al., 2015)
- **FIFA 11+** includes single-leg balance exercises and achieves ~50% ankle sprain reduction
- **Taping and bracing**: functional ankle bracing reduces recurrent sprains (OR = 0.49); appropriate for players with previous ankle sprain history
- **Previous ankle sprain is the dominant risk factor** (OR = 4.9) — all previously injured players should use prophylactic bracing or extensive proprioceptive training

### Load-injury relationship in soccer

Malone et al. (2017, 2018) demonstrated in elite Gaelic football (transferable to soccer) that:
- Chronic workload >4,500 AU was **protective** (injury risk ~5%) even when ACWR was elevated
- ACWR >2.0 combined with low chronic load (<2,500 AU) was **highest risk** (injury risk ~11–25%)
- The "protective effect" of high chronic training is the clearest practical finding — training capacity buffers against acute load spikes

Subsequent analyses in professional soccer (Bowen et al., 2017; McCall et al., 2017) confirmed:
- Players accumulating >5,000 AU chronic load had half the injury rate of those below this threshold
- Weekly load changes of >1,500 AU (absolute spike rather than % change) were more predictive of injury than ACWR alone in some datasets
- Players returning from ≥4 weeks absence face the highest acute injury risk in the first 2 match appearances

---

## 7. Physical Testing in Soccer

### Testing philosophy and standardisation

Testing serves three functions: **baseline profiling**, **monitoring training adaptation**, and **injury screening**. Testing should be standardised for time of day (circadian rhythms affect performance by 5–6%), warm-up protocol (10–15 min dynamic, standardised), environmental conditions, and testing order (anthropometry → flexibility → neuromuscular → speed/power → aerobic). Test frequency is typically:
- Pre-season start (full battery)
- Pre-season end / week 1 in-season (full battery)
- Mid-season (~month 3–4, abbreviated)
- End of season (abbreviated + injury analysis)

### Aerobic capacity tests

**Yo-Yo Intermittent Recovery Test Level 1 (Yo-Yo IR1):**
- Protocol: 20m shuttles at progressively increasing speed with 10 s active recovery between shuttles
- Measured: distance covered (m)
- Sensitivity: ~14% improvement per 8-week training block in untrained; ~4% in trained (Bangsbo et al., 2008)
- sRPE for post-test should be ~8–9/10 if maximal effort confirmed
- ICC = 0.97; CV = 3.5–8.1%

**Yo-Yo IR2:**
- Same protocol, shorter recovery (5 s)
- More demanding; used for elite senior male players
- ICC = 0.94–0.98

**30-15 Intermittent Fitness Test (30-15 IFT):**
- Protocol: 30 s shuttle runs at progressively increasing speed, 15 s passive rest between stages
- Output: maximal aerobic speed estimate (VIFT) ≈ MAS
- ICC = 0.90–0.96; more reliable than Yo-Yo for deriving MAS for individualised training prescription
- Preferred by many practitioners over Yo-Yo for prescribing speed endurance intensities

**Field VO2max estimation:**
- Yo-Yo IR1: VO2max ≈ (distance/1000) × 0.0084 + 36.4 (Bangsbo et al., 2008) — male; separate equations for females
- 30-15 IFT: VO2max ≈ 28.156 + 0.0038 × (VIFT − 4)² — (Buchheit, 2008)

### Speed and agility tests

| Test | Protocol | Male Elite Norms | Female Elite Norms | ICC | CV |
|---|---|---|---|---|---|
| 10m sprint | Electronic timing gates, standing start | 1.65–1.80 s | 1.80–2.00 s | 0.98 | 1.0–2.5% |
| 20m sprint | Electronic timing gates, standing start | 2.90–3.10 s | 3.20–3.40 s | 0.97 | 1.2–2.8% |
| 40m sprint | Electronic timing gates, standing start | 5.00–5.30 s | 5.50–5.90 s | 0.95 | 1.5–3.0% |
| Flying 10m | 30m total, gates at 20m and 30m | 0.95–1.10 s | 1.10–1.25 s | 0.96 | 2.0–3.5% |
| 5-0-5 agility | 5m sprint, 180° turn, 5m return | 2.20–2.40 s | 2.30–2.55 s | 0.92–0.95 | 2.5–4.5% |
| T-test | 10+5+5+10 m T-pattern shuttle | 9.5–10.5 s | 10.2–11.5 s | 0.89–0.97 | 1.5–3.8% |

Sources: Haugen et al. (2013); Nikolaidis et al. (2016); Datson et al. (2022); Compton et al. (2025).

### Jump and neuromuscular tests

| Test | Protocol | Male Elite Norms | Female Elite Norms | ICC | CV |
|---|---|---|---|---|---|
| CMJ height (cm) | Countermovement, hands on hips | 36–45 (range 33–57) | 28–36 | 0.92–0.99 | 1.8–5.5% |
| SJ height (cm) | Squat jump, static start | 32–40 | 25–33 | 0.95–0.99 | 2.0–4.5% |
| Single-leg CMJ (cm) | Unilateral, non-dominant flagged | 28–36 | 20–28 | 0.88–0.96 | 4.5–8.0% |
| Drop jump RSI | Drop from 40 cm, contact time/flight time | 1.4–2.2 | 1.0–1.6 | 0.90–0.96 | 5–10% |
| CMJ LSI (bilateral asymmetry) | Unilateral / bilateral × 100 | ≥90% (flag if <85%) | ≥90% | — | — |

Sources: Asimakidis et al. (2024); Compton et al. (2025).

**CMJ as a neuromuscular readiness marker:**
- Track **4-week rolling mean** as the individual reference
- Flag sessions where CMJ drops **>5%** from this rolling mean
- A drop of **>8–10%** warrants training modification
- CMJ asymmetry **>10–15%** warrants physiotherapy screening
- Assess CMJ at the **same time each week** (e.g., Tuesday morning before training) for consistency

### Strength tests

| Test | Protocol | Male Elite Norms | Female Elite Norms | Reference |
|---|---|---|---|---|
| Back squat 1RM | Full depth, bilateral, free weight | 1.5–2.0 × BW | 1.0–1.5 × BW | Wisloff et al. (2004) |
| Nordic NHE peak force | Load cell at ankles during NHE | 277.5–403.7 N | Not well established | Asimakidis et al. (2024) |
| H:Q ratio (con/con, 60°/s) | Isokinetic dynamometer | 0.55–0.65 | 0.50–0.60 | Croisier et al. (2008) |
| Functional H:Q (ecc H / con Q) | Isokinetic at 60°/s | 0.80–1.00 | 0.70–0.90 | Croisier et al. (2008) |
| Hip abductor strength | Handheld dynamometer, side-lying | >1.5 N/kg | >1.2 N/kg | Niemuth et al. (2005) |

**Risk thresholds from strength testing:**
- H:Q ratio <0.45: consider rebalancing hamstring to quadriceps volume
- Limb asymmetry >15% in any strength measure: physio review and individualised strengthening
- NHE force <200 N: elevate hamstring injury risk, prioritise NHE loading progression

### Injury screening tests

**FMS (Functional Movement Screen):**
- Seven movement patterns scored 0–3 (total 0–21)
- Composite score **≤14** associated with higher injury incidence (Kiesel et al., 2007; Cook et al., 2014)
- Individual pain scores (0) or bilateral asymmetries: **2.73× more predictive** of injury than composite scores alone (Mokha et al., 2016)
- Limitations: poor reliability in some items (deep squat, hurdle step); composite score is contested

**LESS (Landing Error Scoring System):**
- Qualitative assessment of double-leg drop-landing from a 30 cm box
- 22-point checklist; scores >7 indicate high-risk landing mechanics
- Particularly useful for ACL screening in female players

**Tuck Jump Assessment:**
- Qualitative assessment of 10 consecutive two-legged tuck jumps
- Scores 0–10 based on form errors (knee valgus, asymmetry, foot placement, etc.)
- Score >6 warrants neuromuscular correction programme

---

## 8. Normative Data: Soccer

### Male elite soccer comprehensive norms

| Variable | Value (mean ± SD) | Range | Level | Reference |
|---|---|---|---|---|
| VO2max (mL/kg/min) | 58.2 | 50–67.6 | Elite professional | Asimakidis et al. (2025) |
| Yo-Yo IR1 (m) | 2,190 ± 490 | 1,400–2,800 | Elite international | Bangsbo et al. (2008) |
| Yo-Yo IR2 (m) | 1,100 ± 280 | 600–1,600 | Elite professional | Schmitz et al. (2018) |
| 30-15 IFT VIFT (km/h) | 19.8 ± 1.1 | 17.5–22.5 | Elite | Buchheit (2008) |
| 10m sprint (s) | 1.72 ± 0.06 | 1.59–1.87 | Elite | Haugen et al. (2013) |
| 20m sprint (s) | 3.01 ± 0.08 | 2.83–3.20 | Elite | Haugen et al. (2013) |
| 40m sprint (s) | 5.10 ± 0.12 | 4.80–5.35 | Elite | Haugen et al. (2013) |
| CMJ height (cm) | 39.7 ± 5.5 | 28–57 | Elite professional | Asimakidis et al. (2024) |
| SJ height (cm) | 36.2 ± 4.8 | 26–52 | Elite | — |
| Body mass (kg) | 77.5 ± 6.5 | 63–93 | Elite professional | Stolen et al. (2005) |
| Body fat (%) | 10.2 ± 2.1 | 6–16 | Elite | Stolen et al. (2005) |
| Back squat 1RM (×BW) | 1.7 ± 0.2 | 1.2–2.1 | Elite | Wisloff et al. (2004) |

### Position-specific male Yo-Yo IR1 norms

| Position | Yo-Yo IR1 (m) | Reference |
|---|---|---|
| Goalkeeper | 1,100–1,600 | Bangsbo et al. (2008); Mohr et al. (2003) |
| Centre back | 1,600–2,000 | Mohr et al. (2003) |
| Full back | 1,900–2,400 | Mohr et al. (2003) |
| Central midfielder | 2,100–2,600 | Mohr et al. (2003) |
| Wide midfielder | 2,100–2,500 | Mohr et al. (2003) |
| Striker/forward | 1,800–2,200 | Mohr et al. (2003) |

### Female elite soccer comprehensive norms

| Variable | Value (mean ± SD) | Range | Level | Reference |
|---|---|---|---|---|
| VO2max (mL/kg/min) | 52.5 ± 4.0 | 44–62 | Elite | Datson et al. (2014); Compton et al. (2025) |
| Yo-Yo IR1 (m) | 1,360 ± 370 | 800–2,000 | Elite | Bangsbo et al. (2008) |
| Yo-Yo IR2 (m) | 620 ± 180 | 350–900 | Elite | Schmitz et al. (2018) |
| 30-15 IFT VIFT (km/h) | 17.2 ± 1.1 | 15.0–19.5 | Elite | Buchheit (2008) |
| 10m sprint (s) | 1.87 ± 0.07 | 1.72–2.05 | Elite | Datson et al. (2022); Compton et al. (2025) |
| 20m sprint (s) | 3.29 ± 0.10 | 3.05–3.55 | Elite | Compton et al. (2025) |
| CMJ height (cm) | 30.3 ± 4.3 | 22–42 | Elite international | Compton et al. (2025) |
| Body fat (%) | 18.5 ± 3.5 | 14–27 | Elite | Datson et al. (2014) |
| H:Q ratio (con/con, 60°/s) | 0.57 ± 0.08 | 0.45–0.75 | Elite | Croisier et al. (2008) |

Note: Female norms vary widely based on level (national vs. club), nation (Scandinavian teams tend to score higher on aerobic tests), and testing methodology. The Compton et al. (2025) meta-analysis (n = 18,722 female players from 288 studies) currently represents the best available reference.

### Male versus female soccer norm comparison

| Variable | Male Elite | Female Elite | Sex Difference (%) |
|---|---|---|---|
| VO2max (mL/kg/min) | 58 | 52.5 | −9.5% |
| Yo-Yo IR1 (m) | 2,190 | 1,360 | −38% |
| 10m sprint (s) | 1.72 | 1.87 | +8.7% (slower) |
| CMJ (cm) | 39.7 | 30.3 | −23.7% |
| Match total distance (km) | 11.5 | 10.2 | −11% |
| Match HSR distance (m) | 1,000 | 750–1,000* | −15–25%* |

*HSR distance comparison depends heavily on whether the same absolute thresholds or sex-specific thresholds are applied.

---

## 9. Strength and Conditioning for Soccer

### In-season S&C: maintenance principles

Research consistently shows that **2 strength sessions per week at maintained intensity** (≥85% 1RM, 2–4 sets × 3–6 reps) prevents strength loss during the season (Rønnestad et al., 2011). Volume can be reduced by **40–60%** from pre-season peak without detraining, but intensity must be preserved. A single weekly session is insufficient for maintenance in most players.

**Exercise selection priorities for soccer:**

| Category | Primary Exercises | Rationale |
|---|---|---|
| Posterior chain / hamstring | Romanian deadlift, Nordic curl, leg curl | Hamstring injury prevention |
| Hip extension / power | Back squat, hip thrust, trap bar deadlift | Sprint and jump performance |
| Adductor / groin | Copenhagen plank, adductor machine, lateral lunges | Groin injury prevention |
| Single-leg stability | Split squat, single-leg RDL, step-up | Transfer to on-pitch movements |
| Core anti-rotation | Pallof press, cable chops, plank progressions | Trunk stability for kicking and tackling |
| Upper body | Rowing variations, press variations | Postural balance and contact resilience |

**Nordic Hamstring Exercise in-season protocol:**
- Phase 1 (weeks 1–4): 1 session/week, 2 sets × 6–8 reps (introduction, manage DOMS)
- Phase 2 (weeks 5–10): 2 sessions/week, 3 × 8–10 reps (maintenance)
- Phase 3 (in-season maintenance): 1–2 sessions/week, 2 × 8–10 reps (prevention)

**Copenhagen Adductor Plank protocol (Harøy et al., 2019):**
- 8-week pre-season block: progressing from 3 × 2 s holds per side to 3 × 8–10 s per side
- Reduced groin injuries by **41%** in professional male soccer
- In-season maintenance: 1–2 sessions/week, 3 × 4–6 s per side

### Plyometric programming for soccer

| Phase | Intensity | Ground Contacts / Session | Frequency | Examples |
|---|---|---|---|---|
| Anatomical adaptation | Low | 60–80 | 2×/week | Bilateral jumps, skipping, bounding |
| Strength-speed | Moderate | 80–100 | 2×/week | Box jumps, split jumps, medicine ball |
| Power conversion | High | 80–120 | 2–3×/week | Depth jumps, reactive bounds, plyometric sprints |
| In-season maintenance | Moderate | 60–80 | 2×/week | Bilateral and unilateral combinations |

Plyometric training for ≥10 weeks improves CMJ height by an average of **~8%** and sprint times by **~2–3%** in soccer players (Sáez de Villarreal et al., 2012). Combine lower-body plyometrics with bilateral landing mechanics teaching to simultaneously address ACL prevention.

---

## 10. Recovery, Nutrition, and Female Health in Soccer

### HRV monitoring for soccer players

**LnrMSSD** is the recommended daily monitoring metric. Protocol: upon waking, supine position, 60-second recording via validated app (HRV4Training, Elite HRV, Kubios) or GPS/HR system with overnight HRV feature. Seven-day rolling average (minimum 3 valid data points per week) provides the baseline reference.

Decision thresholds (individual, not population-based):
- **CV of weekly LnrMSSD >10%**: excessive autonomic perturbation, investigate load or lifestyle
- **Consecutive day-to-day decline >0.5 × individual SWC**: flag for load reduction
- **Positive adaptation pattern**: rising weekly LnrMSSD mean, stable or declining CV

The Hooper Index (fatigue, sleep quality, stress, muscle soreness each rated 1–7, total 7–49) has a **signal-to-noise ratio of 5.5** for detecting match-induced fatigue versus **1.5** for LnrMSSD (Rabbani et al., 2019). Use both: wellness questionnaire for daily sensitivity, HRV for weekly autonomic trends.

### Match-day nutrition for soccer

- **24–36 h pre-match**: 8–10 g/kg CHO to maximise glycogen stores (Burke et al., 2011)
- **Pre-match meal (3–4 h before)**: 1–3 g/kg CHO, moderate protein, low fat, low fibre
- **Match warm-up**: 0.5–1.0 g/kg CHO (sports drink, gel)
- **During match (>75 min)**: 30–60 g CHO/h via sports drink at half-time; gels or chews supplementary
- **Post-match (0–30 min)**: 1.0–1.5 g/kg CHO + 0.3–0.4 g/kg protein immediately
- **Recovery meal (1–2 h post)**: repeat CHO + protein dose, hydration to replace sweat losses
- Female players have lower absolute glycogen stores per kg lean mass; CHO targets should be scaled to body mass, not taken from male studies (Burke et al., 2019)

### Female-specific considerations in soccer

**Menstrual cycle and performance:**
- Evidence for performance fluctuation across the menstrual cycle is **inconsistent and predominantly low quality** (McNulty et al., 2020; Meignié et al., 2021)
- No systematic reviews support altering competitive scheduling based on cycle phase
- Practical approach: track cycles for ≥3 months using FitrWoman or similar; monitor individual symptom patterns; modify training when symptoms impair quality
- ~50% of elite female soccer players use hormonal contraceptives; these show only **trivial effects on exercise performance** (Elliott-Sale et al., 2020)
- Severe dysmenorrhea (affecting ~20% of female athletes) may warrant medical intervention (NSAIDs, OCP regulation) rather than training modification alone

**RED-S screening in female soccer:**
- Prevalence: 22–33% of professional female soccer players show RED-S risk markers (Dasa et al., 2024; Moss et al., 2020)
- Screen with **LEAF-Q** (25-item questionnaire; score ≥8/49 indicates risk; sensitivity 78%, specificity 90%) at start of season and mid-season
- Practical signs: amenorrhea or oligomenorrhea, frequent stress fractures, persistent energy deficit, performance plateau despite training
- Management: ≥45 kcal/kg FFM/day energy availability; calcium 1,500 mg/day; vitamin D ≥600 IU/day; multidisciplinary team involvement

**ACL risk reduction protocol for female soccer:**
1. FIFA 11+ every training session (compliance is the key variable)
2. Additional hip/knee stability work 2–3×/week
3. Plyometric landing mechanics teaching in pre-season
4. FMS/LESS screening to identify high-risk movement patterns
5. Load management to avoid acute spikes in the return-from-layoff period

---

## 11. Technology and Performance Analysis in Soccer

### Match analysis metrics

Modern soccer performance analysis uses GPS, optical tracking (Hawk-Eye, Tracab, Second Spectrum), and video to quantify:

- **Physical KPIs**: total distance, HSR, sprint distance, acceleration/deceleration counts, player load
- **Tactical KPIs**: pressing intensity (PPDA — passes allowed per defensive action), defensive shape metrics, space coverage
- **Technical KPIs**: pass accuracy, key passes, progressive carries, expected goals (xG), expected assists (xA)

For physical performance analysis, practitioners should track **physical performance profiles** over the season, comparing individual match data to rolling averages to detect performance decrement (fatigue) or improvement (fitness gain).

### Force plates for readiness monitoring

Commercial force plate platforms (Vald ForceDecks, AMTI, Kistler) allow rapid CMJ assessment (30–60 s per player) for daily or weekly neuromuscular screening. Key variables beyond jump height:
- **Eccentric deceleration impulse**: sensitive to fatigue, drops before CMJ height
- **Reactive strength index modified (RSImod)**: CMJ height / time to takeoff; more sensitive than height alone
- **Jump height bilateral asymmetry**: flags potential injury risk
- **Concentric mean power**: tracks training adaptation over weeks

---

## References (key, author-year)

Al Attar et al. (2016, 2017). FIFA 11+ injury prevention meta-analyses.
Ardern et al. (2016). Return-to-sport consensus statement.
Asimakidis et al. (2024, 2025). Systematic reviews of physical fitness in elite male soccer.
Bangsbo et al. (2008). Yo-Yo IR test review.
Banister (1991). TRIMP model.
Bizzini and Dvorak (2015). FIFA 11+ systematic review.
Bourdon et al. (2017). Monitoring athlete training loads — consensus statement.
Brownstein et al. (2017). Neuromuscular fatigue post-match.
Buchheit (2008). 30-15 IFT reliability and validity.
Buchheit et al. (2021). Microcycle periodization in elite football.
Burke et al. (2011, 2019). Nutrition for training and competition.
Casamichana et al. (2013). Player load in soccer.
Compton et al. (2025). Physical fitness norms in female soccer (meta-analysis, n = 18,722).
Croisier et al. (2008). Strength imbalances and hamstring injury prediction.
Dalton et al. (2020). ACL injury rates in NCAA soccer.
Datson et al. (2014, 2017, 2022). Female soccer physiology and match demands.
Delgado-Bordonau and Mendez-Villanueva (2012). Tactical periodisation review.
Dupont et al. (2010). Congested fixture injury risk.
Ekstrand et al. (2011, 2016, 2023). UEFA Elite Club Injury Study.
Elliott-Sale et al. (2020). Hormonal contraceptives and exercise performance.
Foster (1998). Overtraining indicators — monotony and strain.
Foster et al. (2001). sRPE method validation.
Gabbett (2016). Training-injury prevention paradox.
Gaudino et al. (2013). Metabolic power in soccer.
González-García et al. (2022). Female soccer recovery meta-analysis.
Grindem et al. (2016). ACL return-to-sport criteria.
Gualtieri et al. (2023). High-speed running and sprinting in professional soccer.
Halson (2014). Monitoring athlete training loads.
Harøy et al. (2019). Copenhagen adductor plank and groin injury reduction.
Haugen et al. (2013). Speed and agility norms in elite soccer.
Herzberg et al. (2017). Oral contraceptives and ACL injury rate.
Impellizzeri et al. (2004, 2019, 2020, 2021). Internal load and ACWR critique.
Johnston et al. (2014). GPS sampling rate validity.
Kiesel et al. (2007). FMS and injury prediction.
Lauersen et al. (2014, 2018). Strength training and injury prevention meta-analyses.
Malone et al. (2017, 2018). ACWR and injury risk in Gaelic football.
Manzi et al. (2009). iTRIMP model.
Martín-García et al. (2018). Position-specific GPS demands.
McNulty et al. (2020). Menstrual cycle and exercise performance meta-analysis.
Melin et al. (2014). LEAF-Q validity.
Mjolsnes et al. (2004). Nordic hamstring training effect on strength.
Mohr et al. (2003). Physical demands in top-class soccer.
Mokha et al. (2016). FMS and asymmetry as injury predictors.
Morton et al. (2018). Protein intake for muscle protein synthesis.
Mountjoy et al. (2014, 2018, 2023). RED-S framework.
Murray et al. (2017). EWMA for ACWR.
Nakamura et al. (2017). Relative speed thresholds in female soccer.
Nédélec et al. (2012, 2014). Recovery from soccer match play.
Nikolaidis et al. (2016). Sprint performance in female soccer.
Petersen et al. (2011). NHE and hamstring injury prevention in professional soccer.
Rabbani et al. (2019). Hooper Index vs HRV sensitivity.
Rønnestad et al. (2011). In-season strength maintenance.
Schiftan et al. (2015). Balance training and ankle sprain prevention.
Scott et al. (2016). GPS reliability review.
Silvers-Granelli et al. (2015). FIFA 11+ in male collegiate soccer.
Silva et al. (2018). Post-match recovery timeline.
Soligard et al. (2008). FIFA 11+ original RCT.
Steffen et al. (2013). FIFA 11+ compliance and injury reduction.
Stolen et al. (2005). Physiology of soccer review.
Tamarit (2014). Tactical periodisation.
Teixeira et al. (2022). Starter vs non-starter load differences.
van der Horst et al. (2015). NHE RCT in amateur soccer.
van Dyk et al. (2019). NHE meta-analysis.
Wisloff et al. (2004). Strength and sprint/jump performance in soccer.
