# Feature 04 — Mesocycle Analysis

**Route:** `/mesocycle`
**Component:** `src/pages/Mesocycle.jsx`
**Related lib:** `src/lib/computeMesocycle.js`, `src/lib/exportReport.js` (`generateMesocycleHTML`, `downloadHTML`, `downloadPDF`)
**Related hooks:** `src/hooks/useMesocycle.js` (`useMesocycles`, `useMesocycleData`, `useSquadMesocycle`), `src/hooks/useWeeklyData.js` (`useWeeks`), `src/hooks/useTeams.js` (`useTeams`)

---

## Purpose

The Mesocycle page provides a squad-level, 4-week (monthly) view of training load and readiness — the mesocycle counterpart to the single-week microcycle dashboard. It aggregates four consecutive microcycles into averaged indexes, summed totals, directional trends, and an auto-generated structured narrative (positives, concerns, recommendations) per player.

It answers:
- "Across the last 4 training weeks, how did each player trend?"
- "Which players have rising injury risk or falling recovery status over the mesocycle?"
- "What team-wide Performance Index did we average for the block, and is the squad trending up or down?"
- "What should we adjust for the next 4-week block?"

---

## User-Facing Behavior

1. **Header controls (top right):**
   - **Team selector** — filters squad rows by `players.team_id`. "All Teams" (empty string) shows everyone. Only rendered if `teams.length > 0`.
   - **Period selector** — lists 4-week blocks built from all distinct `week_start_date`s in `weekly_aggregates`, grouped in chunks of 4 starting from the oldest, then reversed so newest is first (`YYYY-MM-DD — YYYY-MM-DD`). If fewer than 4 weeks exist, the dropdown shows a disabled "Not enough data (need 4+ weeks)" entry.
   - **Export button** — opens a dropdown with "Export HTML" and "Export PDF". Disabled while exporting. Only rendered when `squad.length > 0`.

2. **Team Performance Index (TPI) card** — squad-average `api` (divided by 10) for the selected period, labeled "Mesocycle Team Performance Index (avg) — Averaged across 4 microcycles". Color thresholds:
   - `>= 7.0` → green `#10B981`
   - `5.0 – 6.9` → amber `#F59E0B`
   - `< 5.0` → red `#EF4444`
   - `null` → em dash, muted.

3. **Squad table** — one row per player for the 4-week period. Columns: `Player`, `Pos`, `PI`, `RTT`, `RS`, `TMI`, `Injury Risk`, `Trend`, `→`.
   - All index cells render the averaged 0–100 value divided by 10 to one decimal; `null` → em dash.
   - Injury Risk cell is colored by threshold (≥7 green, ≥5 amber, else red). Rows are tinted by injury risk (`<=4` red tint, `<=6` amber tint, else none).
   - Trend arrow reflects the `summary.trends.performance` direction: `↑` green (increasing), `↓` red (decreasing), `→` muted (stable).
   - Clicking a row navigates to `/player/:id`.

4. **Player Mesocycle Summary cards** (below the table) — one glass card per player with a `summary`. Each card contains:
   - Header with photo/initial, name, position badge, and an **Overall Assessment** badge — `Good` (green), `Moderate` (amber), `Needs Attention` (red), or `Insufficient Data`.
   - **Microcycle Overview** — a 4-cell grid showing `Wk 1–4` labels and that week's PI (`value / 10`, one decimal).
   - **Positives** — green-bordered bullets auto-generated from the aggregate.
   - **Concerns** — red-bordered bullets.
   - **Recommendations** — blue-bordered bullets for the next mesocycle.

5. **Empty / loading states:**
   - Either the weeks query or the squad query loading → "Loading…".
   - No periods built → "Need at least 4 weeks of data for mesocycle analysis."
   - Period selected but no matching rows → "No data for this period."

6. **Export:**
   - `Export HTML` — calls `generateMesocycleHTML(squad, periodLabel, teamName)` and triggers a download via `downloadHTML`.
   - `Export PDF` — same HTML rendered to PDF through `downloadPDF` (async; button shows "Exporting…").
   - Filenames: `mesocycle-report-<period-label>.html|pdf`.

---

## Data Model (Supabase)

### Read by the feature

**`weekly_aggregates`** — the only table queried at runtime. Mesocycle output is computed in-memory from the weekly rows. Columns consumed (all numeric unless noted):

- Key: `id`, `player_id` (FK → `players`), `week_start_date` (date), `created_at`.
- Headline indexes (stored 0–100, displayed ÷10): `api`, `rtt`, `rs`, `tmi`, `injury_risk`.
- ACWR: `acwr_total_distance`, `acwr_sprint`, `acwr_mechanical`, `acwr_nrg`.
- Load vs. match reference (%): `load_pct_total_distance`, `load_pct_hsr`, `load_pct_sprint`, `load_pct_hmld`, `load_pct_nrg`, `load_pct_acc`, `load_pct_dec`.
- Totals summed across the mesocycle: `total_distance`, `hsr_distance`, `sprint_distance`, `total_nrg`.
- Averages: `fatigue_index`, `monotony`.

**`players`** — joined via Supabase embed `players(name, position, team_id, photo_url)` for labels, team filtering, and avatars.

**`teams`** — read by `useTeams()` to populate the team selector (`id`, `name`).

### Defined but NOT written by this feature

**`mesocycle_aggregates`** (in `supabase/schema.sql` lines 140–181) exists as a persistence target for the same computed shape, with `unique(player_id, mesocycle_start_date)`. Columns mirror the output of `computeMesocycle`: averaged indexes (`api`, `rtt`, `rs`, `tmi`, `injury_risk`), averaged ACWR, averaged `load_pct_*`, summed totals, averaged `fatigue_index`/`monotony`, `summary jsonb`, and `week_dates jsonb`. The current UI never inserts into this table — aggregation is recomputed on every page load. It is effectively reserved for future caching/persistence of mesocycle snapshots.

RLS: `authenticated` role has full read/write on all tables via `auth_all` policies.

---

## API Endpoints (Supabase queries)

There is no custom REST/Edge layer. All access is via `@supabase/supabase-js` from the hooks in `src/hooks/useMesocycle.js`:

1. **`useMesocycles(playerId)`** — per-player list of available 4-week blocks. Used by `PlayerDetail`, not by this page.
   ```
   from('weekly_aggregates')
     .select('week_start_date')
     .eq('player_id', playerId)
     .order('week_start_date', { ascending: true })
   ```
   Groups the returned dates into consecutive chunks of 4 (non-overlapping); reverses so newest is first.

2. **`useMesocycleData(playerId, weekDates, player)`** — per-player mesocycle for a given 4-date list.
   ```
   from('weekly_aggregates')
     .select('*')
     .eq('player_id', playerId)
     .in('week_start_date', weekDates)
     .order('week_start_date', { ascending: true })
   ```
   Requires `weekDates.length >= 4`; requires at least 2 returned rows before calling `computeMesocycle`.

3. **`useSquadMesocycle(weekDates, teamId)`** — the query powering this page.
   ```
   from('weekly_aggregates')
     .select('*, players(name, position, team_id, photo_url)')
     .in('week_start_date', weekDates)
   ```
   Then in JS: optionally filters by `row.players.team_id === teamId`, groups rows by `player_id`, sorts each group by `week_start_date`, and calls `computeMesocycle(weeks, player)` per player.

4. **`useWeeks()`** — `select('week_start_date').order(..., { ascending: false })`, deduplicated in JS. Drives the period-builder.

5. **`useTeams()`** — fetches teams for the selector.

All queries are filtered server-side by RLS (the user must be an authenticated Supabase session).

---

## Key Business Logic

All heavy lifting lives in `src/lib/computeMesocycle.js`.

### Period construction (`src/pages/Mesocycle.jsx:44-52`)

```js
const sortedWeeks = [...weeks].sort((a, b) => a.localeCompare(b))
for (let i = 0; i + 3 < sortedWeeks.length; i += 4) {
  periods.push({
    label: `${sortedWeeks[i]} — ${sortedWeeks[i + 3]}`,
    weeks: sortedWeeks.slice(i, i + 4),
  })
}
periods.reverse()
```

- Builds **non-overlapping** 4-week windows from the oldest week forward.
- Any trailing weeks (count not divisible by 4) are discarded from the selector.
- Period labels use raw `week_start_date` ISO strings.

### `computeMesocycle(weeks, player)` (`src/lib/computeMesocycle.js:11-76`)

Given `weeks` (oldest-first array of `weekly_aggregates` rows) it returns:
- `mesocycle_start_date` = `weeks[0].week_start_date`, `mesocycle_end_date` = last row's date.
- For every numeric index (`api`, `rtt`, `rs`, `tmi`, `injury_risk`, all `acwr_*`, all `load_pct_*`, `fatigue_index`, `monotony`): arithmetic mean of non-null values; `null` if all null.
- For totals (`total_distance`, `hsr_distance`, `sprint_distance`, `total_nrg`): sum of non-null values; `null` if all null.
- `summary` — structured JSON produced by `buildSummary`.
- `week_dates` — array of the 4 `week_start_date`s.

### Trend detection (`computeMesocycle.js:78-87`)

```js
const change = first > 0 ? ((last - first) / first) * 100 : 0
if (change > 10) return 'increasing'
if (change < -10) return 'decreasing'
return 'stable'
```

- Uses only the **first and last** non-null values of the metric — not a regression across all 4 weeks. This means a single outlier at the start or end can dominate the verdict.
- Guards against divide-by-zero by returning `0` change when `first <= 0`.
- ±10 % is the classification threshold.
- Trends are computed for: `performance` (via `api`), `rtt`, `rs`, `tmi`, `injury_risk`, `total_nrg`.

### Narrative generation — `buildSummary` (`computeMesocycle.js:94-202`)

Auto-generates `{ trends, concerns, positives, recommendations, weekOverviews, overallAssessment }`:

**Concerns** are pushed when:
- `injury_risk / 10 > 5` (i.e. score < 5/10 safety).
- `trends.injury_risk === 'increasing'`.
- `acwr_nrg` outside `[0.8, 1.3]`.
- `monotony > 2.0` and finite.
- `fatigue_index > 5.0`.
- `trends.rs === 'decreasing'`.
- `load_pct_sprint < 70`.

**Positives** are pushed when:
- `api / 10 >= 7`.
- `trends.performance === 'increasing'`.
- `acwr_nrg` within `[0.8, 1.3]`.
- `monotony <= 1.5` and finite.
- `rtt / 10 >= 7`.
- `rs / 10 >= 7`.
- `trends.injury_risk === 'decreasing'`.
- `load_pct_total_distance` within `[90, 110]`.

**Recommendations** (non-exhaustive list, one-to-many mapping):
- Rising or elevated injury risk → deload week at 60-70 % volume.
- `monotony > 1.5` → alternate high-intensity (MD-4) and recovery (MD+1) sessions.
- `load_pct_sprint < 70` → 1–2 targeted sprint sessions/wk at >85 % Vmax.
- `load_pct_hsr < 70` → SSGs or dedicated speed-endurance work.
- Declining RS → recovery-focused deload at the start of the next block.
- `acwr_nrg > 1.3` → progressively reduce load, ≤10 % week-on-week.
- `acwr_nrg < 0.8` → progressively increase load, ≤10 % week-on-week.
- If none of the above fire: "Current training structure is effective. Maintain…"

**`overallAssessment`** — derived solely from averaged `api`: `>= 7.0` = Good, `>= 5.0` = Moderate, `< 5.0` = Needs Attention, `null` = Insufficient Data.

### TPI on the page (`src/pages/Mesocycle.jsx:79-81`)

```js
const tpi = squad.length
  ? squad.reduce((sum, s) => sum + (s.api || 0), 0) / squad.length
  : null
```

Note `s.api || 0` — a player with `api === null` is counted as 0 rather than excluded, so missing data pulls the squad average down. (See edge cases.)

### Export (`src/lib/exportReport.js:219+`)

`generateMesocycleHTML(squad, periodLabel, teamName, theme?)` builds a standalone HTML report containing:
- Averaged squad cards for PI, RTT, RS, TMI, Injury Risk (Injury Risk is marked `inverted`).
- An average-PI-by-microcycle line chart built by iterating `summary.weekOverviews[i].pi` across the squad and averaging per index; `'N/A'` entries are skipped.
- A squad table with per-player circle gauges.
Theme defaults to the current `document.documentElement[data-theme]` or `'dark'`.

---

## Edge Cases & Gotchas

- **Non-overlapping 4-week windows.** Period construction uses `i += 4`, so if you have 7 weeks only one period (weeks 1–4) is offered; weeks 5–7 are invisible until a 4th arrives. There is no rolling/overlapping 4-week option.
- **`weekDates.length < 4` short-circuits.** `useMesocycleData` and `useSquadMesocycle` both return empty/null without hitting Supabase in this case.
- **`computeMesocycle` accepts fewer than 4 rows** — `useMesocycleData` requires `rows.length >= 2`, and `useSquadMesocycle` calls it unconditionally. A player with only 1 week in the selected 4-week window still produces a (degenerate) summary: `trend` returns `'stable'` for <2 values, averages equal the single value, sums equal the single value.
- **Partial data per player.** Players without rows in the period are simply absent from `squad` (no placeholder row).
- **Team filter happens client-side.** `useSquadMesocycle` pulls every player's rows for the period and filters in JS by `row.players?.team_id === teamId`. For large multi-team datasets this is wasteful but currently expected.
- **TPI counts `null` as 0** in `Mesocycle.jsx`. A player with `api === null` drags the squad average down. The squad table formatter (`fmt`) shows `—` for that player but the TPI still includes them at 0. Contrast with the export code (`exportReport.js:223`) which also uses `|| 0` — consistent between screen and export, but both under-report.
- **Trend uses endpoints only.** A V-shaped trajectory (drops week 2 then recovers by week 4) is classified `stable` if the first and last points are within 10 %.
- **Divide-by-zero in trend.** If `first <= 0` (possible for `api`, `load_pct_*`, etc. that can be 0 or null), change is forced to 0 → `'stable'`.
- **`monotony` can be non-finite.** Both `buildSummary` and the recommendation rules `isFinite(agg.monotony)` guards handle division-by-zero monotony (e.g. a week with only one non-zero day).
- **`mesocycle_aggregates` is unused.** The table exists in `schema.sql` but is never written or read by the current code path; any future work that persists results should upsert on `(player_id, mesocycle_start_date)` and populate `summary` + `week_dates`.
- **Index display convention.** Every index in the DB is stored 0–100. The UI divides by 10 for display; anyone calling `computeMesocycle` downstream gets the same 0–100 values and must divide themselves.
- **`performance_reports` / performance-testing feature is independent.** Do not confuse with this mesocycle feature despite both relating to "performance".
- **Period labels are date strings, not a month name.** Sorting/grouping is lexicographic on ISO dates (`a.localeCompare(b)`), which coincides with chronological order for `YYYY-MM-DD`.
- **`useSquadMesocycle` re-effect key is `weekDates?.join(',')`.** Passing a new-but-equal array reference is fine; a different order would trigger a refetch even though the set is identical.
- **RLS.** All queries silently return `[]` for unauthenticated sessions. `AuthGuard` prevents reaching the route in the first place, but any direct API consumer must authenticate.
