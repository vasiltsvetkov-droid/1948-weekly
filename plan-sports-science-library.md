# Plan: Sports Science Knowledge Library Integration

## Current State

- **Analysis engine**: Rule-based (`computeMetrics.js` + `generateRecommendations.js`)
- **Existing KB**: Single monolithic file `football_sports_science_kb.md` (1324 lines, 26 sections) — referenced in code comments/citations but **never loaded or parsed at runtime**
- **Charts**: 5 Recharts visualizations in `PlayerDetail.jsx`
- **Recommendations**: Up to 12 rule-based cards with hardcoded text templates
- **No LLM integration** — all text is template literals

---

## Goal

Make the app **structurally reference** a library of MD files at runtime so that:
1. Every analysis output is grounded in sports science postulates
2. Analysis text is richer and more detailed
3. More charts/graphs are generated from the data
4. Adding/editing an MD file automatically updates what the app knows

---

## Proposed Directory Structure

```
src/
  knowledge/
    index.js                    # Registry — exports all modules as a structured map
    load-management.md          # ACWR, training load, spikes, deload protocols
    periodization.md            # Microcycle, mesocycle, tactical periodization
    fatigue-monitoring.md       # Internal vs external load, fatigue index, HRV, wellness
    injury-risk.md              # Risk factors, thresholds, injury prevention paradox
    mechanical-load.md          # Acc/dec, eccentric load, soft tissue risk
    speed-exposure.md           # Sprint residuals, Vmax exposure, HSR thresholds
    recovery-protocols.md       # MD+1/+2 protocols, sleep, nutrition, contrast therapy
    position-demands.md         # Position-specific benchmarks and targets
    return-to-play.md           # RTP criteria, GPS benchmarks, clearance protocols
    training-monotony.md        # Monotony/strain model, Foster's thresholds
    match-demands.md            # Match physical profile, metabolic power, energy systems
    strength-power.md           # S&C programming, force-velocity, Nordic curls
```

Each MD file follows a **consistent schema**:

```markdown
# Topic Title

## Key Postulates
- Numbered list of core principles the app must enforce

## Thresholds & Decision Rules
| Metric | Zone | Range | Action | Source |
|--------|------|-------|--------|--------|

## Analysis Templates
<!-- Paragraph templates with ${metric} placeholders for each zone -->

## Chart Specifications
<!-- What charts this topic demands, axes, reference lines, zones -->

## References
- Academic citations
```

---

## Implementation Steps

### Step 1: Create the `src/knowledge/` directory and MD files

- Split your existing `football_sports_science_kb.md` (and any new MD files you have) into the ~12 topic files above
- Each file must include: **Postulates**, **Thresholds**, **Analysis Templates**, **Chart Specs**, **References**
- You provide the MD content; I structure it into the schema

### Step 2: Build the Knowledge Loader (`src/knowledge/index.js`)

A build-time module that:
- Imports all `.md` files using Vite's `?raw` import (returns string at build time, zero runtime cost)
- Parses each MD file into a structured JS object: `{ postulates[], thresholds[], templates{}, chartSpecs[], refs[] }`
- Exports a `KNOWLEDGE` map keyed by topic slug

```js
// Example usage anywhere in the app:
import { KNOWLEDGE } from '../knowledge'
const acwrRules = KNOWLEDGE['load-management'].thresholds
const fatigueTemplates = KNOWLEDGE['fatigue-monitoring'].templates
```

**Parser approach**: Simple markdown section parser (split on `## ` headings, parse tables into arrays of objects). No external dependency needed — ~80 lines of code.

### Step 3: Refactor `generateRecommendations.js` → Knowledge-Driven

Current: 12 hardcoded rules with inline text templates.

New approach:
- Each rule **reads its thresholds from `KNOWLEDGE[topic].thresholds`** instead of hardcoded numbers
- Each rule **reads its text from `KNOWLEDGE[topic].templates`** instead of inline template literals
- Each rule **attaches the relevant postulates** from the MD file to the output
- New field on each recommendation: `postulates[]` — the sports science principles that justify it
- New field: `detailedAnalysis` — a longer paragraph pulled from the MD template with full metric context
- **Unlocks more than 12 recommendations** — each MD file can define its own set of rules

### Step 4: Add New Analysis Sections to `PlayerDetail.jsx`

#### 4a: More Analysis Text

Add a new **"Detailed Analysis"** panel below existing recommendation cards:
- For each triggered recommendation, render its `detailedAnalysis` paragraph
- Include the relevant postulates as expandable/collapsible citations
- Group analysis by topic (Load Management, Fatigue, Speed, etc.)

#### 4b: More Charts (driven by `chartSpecs` in each MD file)

Add these new Recharts visualizations:

| # | Chart | Data Source | Driven By |
|---|-------|------------|-----------|
| 1 | **Mechanical Load Trend** (12-week line chart) | `acwr_mechanical` from history | `mechanical-load.md` |
| 2 | **Speed Exposure Gauge** (bullet/radial chart) | `top_speed / personalMaxSpeed` | `speed-exposure.md` |
| 3 | **Load Achievement Radar** (radar chart) | All `load_pct_*` metrics | `load-management.md` |
| 4 | **Monotony & Strain Trend** (dual-axis line) | `monotony`, `strain` from history | `training-monotony.md` |
| 5 | **HSR + Sprint Weekly Trend** (stacked area) | `hsr_distance`, `sprint_distance` | `speed-exposure.md` |
| 6 | **Recovery Status Timeline** (area chart with zones) | `rs` from history with zone bands | `recovery-protocols.md` |
| 7 | **Position Benchmark Comparison** (grouped bar) | Current metrics vs position benchmarks | `position-demands.md` |

Each chart renders **only if the corresponding knowledge module's chartSpecs define it** — so adding a new chart is as simple as adding a `## Chart Specifications` section to an MD file and registering its renderer.

### Step 5: Create a Chart Registry (`src/lib/chartRegistry.js`)

Maps chart spec types from MD files to React chart components:

```js
const CHART_REGISTRY = {
  'line-trend':    TrendLineChart,
  'radar':         LoadRadarChart,
  'stacked-area':  StackedAreaChart,
  'dual-axis':     DualAxisChart,
  'gauge':         GaugeChart,
  'grouped-bar':   GroupedBarChart,
  'zone-area':     ZoneAreaChart,
}
```

`PlayerDetail.jsx` iterates over all `KNOWLEDGE` modules, collects their `chartSpecs`, and renders matching components. This means **new MD files can introduce new charts without touching React code** (as long as they use an existing chart type).

### Step 6: Wire Up the Pipeline

Update the data flow:

```
CSV Upload → computeMetrics() → [no change]
                    ↓
         generateRecommendations()
                    ↓ reads from
              KNOWLEDGE map ← parsed from src/knowledge/*.md
                    ↓ produces
         recommendations[] with:
           - type, title, text (existing)
           - postulates[] (NEW)
           - detailedAnalysis (NEW)
           - chartSpecs[] (NEW — which charts to show)
                    ↓
         PlayerDetail.jsx renders:
           - Existing 5 charts
           - NEW charts from chartSpecs
           - Expanded analysis text panels
           - Postulate citations
```

---

## File Change Summary

| File | Action |
|------|--------|
| `src/knowledge/*.md` (12 files) | **CREATE** — Your MD content, structured per schema |
| `src/knowledge/index.js` | **CREATE** — Loader, parser, KNOWLEDGE map export |
| `src/lib/generateRecommendations.js` | **REFACTOR** — Read thresholds/templates from KNOWLEDGE |
| `src/lib/chartRegistry.js` | **CREATE** — Map chart spec types to components |
| `src/pages/PlayerDetail.jsx` | **EXTEND** — Add new chart sections + detailed analysis panel |
| `src/components/DetailedAnalysis.jsx` | **CREATE** — Expandable analysis text + postulates |
| `src/components/charts/` (7 files) | **CREATE** — New Recharts chart components |

---

## What You Need To Provide

1. **Your MD files** — whatever topics you have. I will:
   - Structure them into the schema above (Postulates / Thresholds / Templates / Chart Specs / References)
   - Split or merge as needed to match the ~12 topic modules

2. **Priority order** — which topics matter most, so we build those first

3. **Any additional chart ideas** — beyond the 7 proposed above

---

## Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| MD files loaded at build time vs runtime | **Build time** (Vite `?raw`) | Zero runtime cost, works offline (PWA), no API needed |
| Parser: external lib vs custom | **Custom** (~80 lines) | Only need heading + table parsing; avoids dependency |
| Thresholds: keep in JS or move to MD | **Move to MD** | Single source of truth; non-developers can edit thresholds |
| Chart rendering: hardcoded vs registry | **Registry** | Adding new charts via MD without touching React |
| LLM integration | **Not needed now** | Rule-based + knowledge-driven templates produce deterministic, correct output. LLM can be layered on later for narrative generation |
