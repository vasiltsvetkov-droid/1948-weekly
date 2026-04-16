# Feature 05 — Data Upload

**Route:** `/upload`
**Component:** `src/pages/Upload.jsx`
**Related lib:** `src/lib/computeMetrics.js`, `src/lib/generateRecommendations.js`
**Related constants:** `src/constants/csvColumns.js`, `src/constants/matchDefaults.js`
**Related hooks:** `src/hooks/useTeams.js` (`useTeams`)

---

## Purpose

The Upload page is the sole data-ingestion entry point for the platform. It accepts one or more Barin Sports PRO weekly summary CSV exports, parses and normalises them client-side, shows a preview, and on confirmation computes all weekly metrics and indexes before writing to Supabase. This is how every data point in the platform originates — no other feature writes to `weekly_sessions` or `weekly_aggregates`.

It answers:
- "How do I get GPS/tracking data into the platform?"
- "What happens when a player name in the CSV doesn't exist yet?"
- "If I upload multiple weeks at once, in what order are metrics computed?"

---

## User-Facing Behavior

1. **GPS coverage disclaimer** — amber banner: "For optimal accuracy of the analysis, at least 80% of the training days has to be recorded with the GPS system." Always visible, not dismissible.

2. **GPS drop zone** — labelled "Drop CSV files or click to upload / One or more Barin Sports PRO weekly summary exports". Accepts `.csv` only, `multiple` attribute enabled. Supports both drag-and-drop and click-to-browse.

3. **Biomechanical data drop zone** — a second inert drop zone ("Upload Biomechanical Data — Strength, Force, Neuromuscular, ROM etc."). Currently non-functional (no handler); placeholder for a future feature.

4. **File badges** — after selection, each filename is shown as a badge below the zones.

5. **Error banner** — red banner showing the error string if parsing fails or any Supabase write fails.

6. **Session preview** — after parsing, one card per (player × week) combination is rendered. Each card shows a mini-table: Date, Total Dist, HSR, Sprint, HMLD, NRG. This is the parsed-but-not-yet-processed view; the user can inspect before committing.

7. **Confirm & Process button** — triggers `handleConfirm`. Disabled and labelled "Processing…" while running. On success navigates:
   - Single player uploaded → `/player/:id`
   - Multiple players → `/` (dashboard)

8. **New Player modal** — if any player name in the CSV is not found in the `players` table, processing pauses and a modal appears. Fields:
   - **Name** — read-only, pre-filled from the CSV.
   - **Position** — dropdown: `CB`, `FB`, `CM`, `WM`, `ST`, `GK`. Default `CM`.
   - **Team** — dropdown populated from the `teams` table. Default "No team".
   - **Create & Continue** inserts the player and resumes processing from where it stopped. **Cancel** closes the modal and halts processing (`setProcessing(false)`).
   - If multiple unknown players are in the upload the modal fires once per player, serially.

---

## Data Model (Supabase)

### Tables written

**`weekly_sessions`** — one row per CSV session row (one training day per player).
- `player_id` uuid FK → `players`
- `week_start_date` date — Monday of the session date
- `session_date` date — parsed from the CSV `Date` column
- `data` jsonb — the full remapped CSV row object (all columns after header normalisation and Excel-formula stripping)

**`weekly_aggregates`** — one row per player per week (upserted on conflict `player_id, week_start_date`).
All numeric fields listed in the schema. Key groups:
- External load totals: `total_distance`, `hsr_distance`, `sprint_distance`, `hmld`, `total_nrg`, `nrg_above_th`, `total_accelerations`, `total_decelerations`, `mechanical_load`, `equivalent_distance`, `high_efforts`
- Averages/peaks: `avg_metabolic_power`, `max_metabolic_power`, `top_speed`, `avg_speed`, `intensity_indicator`, `avg_hr`, `max_hr`, `heart_exertion`, `heart_exertion_above_th`
- ACWR: `acwr_total_distance`, `acwr_sprint`, `acwr_mechanical`, `acwr_nrg`
- Indexes (0–100): `api` (Performance Index), `rtt`, `rs`, `tmi`, `injury_risk`
- `fatigue_index`, `monotony`
- Load %: `load_pct_total_distance`, `load_pct_hsr`, `load_pct_sprint`, `load_pct_hmld`, `load_pct_nrg`, `load_pct_acc`, `load_pct_dec`
- `daily_loads` jsonb — array of per-session NRG values (used for monotony)
- `explanations` jsonb — `{ rtt, rs, tmi, performance, injury_risk }` explanation strings

**`team_snapshots`** — upserted on conflict `week_start_date`. One row per week. Updated after all players are processed for that week.
- `week_start_date` date
- `tpi` numeric — average `api` across all players that have an aggregate for that week (null-excluded)
- `squad_data` jsonb — array of `{ api, player_id }` objects from `weekly_aggregates`

**`players`** — optionally written when a new player is created via the modal.
- `name`, `position`, `team_id` (nullable)

### Tables read

- `players` — to resolve CSV player names to UUIDs (`.in('name', playerNames)`).
- `match_references` — per-player per-metric reference values (`.eq('player_id', id)`).
- `weekly_aggregates` — to fetch ACWR history (up to 4 prior weeks) and personal max speed for each player during processing.
- `teams` — to populate the team dropdown in the New Player modal.

---

## API Endpoints (Supabase queries)

All direct Supabase JS client calls. No Edge Functions involved.

**During `handleConfirm` / `processAllPlayers`:**

1. Resolve players:
   ```
   from('players').select('*').in('name', playerNames)
   ```

2. Per-player per-week — match references:
   ```
   from('match_references').select('*').eq('player_id', player.id)
   ```

3. Per-player per-week — ACWR history (up to 4 prior weeks, oldest first):
   ```
   from('weekly_aggregates').select('*')
     .eq('player_id', player.id)
     .lt('week_start_date', weekStart)
     .order('week_start_date', { ascending: false })
     .limit(4)
   ```
   Then `.reverse()`d in JS to get oldest-first.

4. Per-player — personal max speed:
   ```
   from('weekly_aggregates').select('top_speed')
     .eq('player_id', player.id)
     .order('top_speed', { ascending: false })
     .limit(1)
   ```

5. Insert session rows:
   ```
   from('weekly_sessions').insert(sessionRows)
   ```

6. Upsert aggregate:
   ```
   from('weekly_aggregates').upsert(aggregateRow, { onConflict: 'player_id,week_start_date' })
   ```

7. After all players for a week — re-fetch and upsert team snapshot:
   ```
   from('weekly_aggregates').select('api, player_id').eq('week_start_date', ws)
   from('team_snapshots').upsert({ week_start_date, tpi, squad_data }, { onConflict: 'week_start_date' })
   ```

**On new player creation:**
```
from('players').insert({ name, position, team_id? }).select().single()
```

---

## Key Business Logic

### 1. CSV header normalisation (`Upload.jsx:11–53`)

Headers are normalised before mapping: non-ASCII stripped (handles mojibake from Windows exports), whitespace collapsed, lowercased. Mapping strategy:
- **Exact match** against `CSV_COLUMNS` values (normalised).
- **Prefix match** (sorted longest-first) for zone columns whose threshold suffixes vary by device config (e.g. `"Distance speed zone 5 (m) (speed > 23.4 km/h)"` → `"Distance speed zone 5 (m)"`).

Speed unit detection: if any header contains `m/s` for `top_speed` or `avg_speed`, those cells are converted to km/h (`× 3.6`) on row remap.

### 2. Excel formula stripping (`Upload.jsx:55–62`)

Cells matching `="value"` or `=value` are unwrapped. This is a common artefact of Barin Sports PRO exports opened and re-saved in Excel.

### 3. NA / rest-day filtering (`Upload.jsx:84–92`)

Rows where every non-name/non-date column is empty or `"NA"` are discarded. This handles rest-day placeholder rows that some GPS systems output to keep a daily record.

### 4. Date parsing and week-start computation (`Upload.jsx:94–136`)

`parseDate` handles four formats (tried in order):
- `DD.MM` / `DD/MM` — no year, assumes current year
- `YYYY-MM-DD` (ISO)
- `DD/MM/YYYY`, `DD.MM.YYYY`, `DD-MM-YYYY` (European)
- Browser `Date()` constructor fallback

`getMonday` computes the ISO Monday of any date using **local** date parts (not `.toISOString()`) to avoid UTC timezone shift causing an off-by-one day.

Sessions with an unparseable date are silently discarded (no `weekStart` → skipped in grouping).

### 5. Multi-file / multi-week grouping (`Upload.jsx:160–210`)

Sessions across all files are merged into a single `allSessions` object keyed by player name. Then grouped by player → week (Monday), producing:
```
{ "Player Name": [{ weekStart: "YYYY-MM-DD", sessions: [...] }, ...] }
```
Weeks are sorted chronologically, ensuring the processing loop can insert week 1 before computing ACWR for week 2.

### 6. Chronological week-by-week processing (`Upload.jsx:288–414`)

```js
const sortedWeeks = [...allWeekStarts].sort()
for (const currentWeek of sortedWeeks) {
  for (const [name, weeks] of Object.entries(parsedData)) { ... }
}
```

Processing is sequential (not parallel) because each week's ACWR history query fetches rows already inserted during this same upload run. Parallelising would cause ACWR to be computed against stale history for weeks 2, 3, 4+.

### 7. `computeMetrics` — index computation (`src/lib/computeMetrics.js`)

Called once per player per week. Pipeline:
1. **`aggregateSessions`** — sums/averages raw CSV columns into weekly totals. Key decisions:
   - `hsr_distance` = Zone 4+5 (`zone4plus5`)
   - `sprint_distance` = Zone 5 only (`zone5_distance`)
   - `mechanical_load` = `total_acc + total_dec`
   - `top_speed` / `max_hr` / `max_metabolic_power` = `Math.max` across sessions
   - `avg_*` / `avg_metabolic_power` / `avg_speed` = mean of non-zero values only

2. **`computeMonotony`** — `mean(daily_NRG) / SD(daily_NRG)` over non-zero sessions. `SD === 0` → `Infinity`.

3. **`resolveMatchRefs`** — merges user-entered `match_references` with `MATCH_DEFAULTS[position]`. User values override; `CM` defaults used for unknown positions.

4. **`computeLoadPct`** — `(actual / reference) × 100` per metric; `null` when reference is 0.

5. **`computeACWR`** — `currentWeek / mean(history[key])` for `total_distance`, `sprint_distance`, `mechanical_load`, `total_nrg`. Flags: `insufficient_history` (0 prior weeks), `low_confidence_acwr` (1–3 prior weeks). `null` ACWR when no history.

6. **`computeFatigueIndex`** — per session: `FI = (heart_exertion / ref_heart_exertion × 100) - (total_nrg / ref_nrg × 100)`. Weekly FI = mean of sessions with HR data. `hasHRData = false` when no session has usable `heart_exertion`.

7. **Indexes** (all stored 0–100; UI divides by 10):
   - **RTT** = `loadScore × 0.40 + acwrScore × 0.60` where `loadScore = scoreCloseness(load_pct_nrg, 100, 10)` and `acwrScore` maps ACWR onto 0–100.
   - **RS** = when HR data available: `acwrScore × 0.40 + fiScore × 0.60`; else `acwrScore` only.
   - **TMI** — piecewise linear from `monotony`: `≤1.0` → 100, `≤1.5` → 80–100, `≤2.0` → 60–80, `≤2.5` → 35–60, `>2.5` → 20. `null` → 50, `Infinity` → 15.
   - **Performance Index (api)** = `RTT × 0.35 + RS × 0.35 + TMI × 0.30`.
   - **Injury Risk** — additive weighted risk score then **inverted**: `100 - rawRisk`. Components: ACWR total distance (30%), mechanical spike ratio vs 4-week avg (25%), monotony (20%), speed deficit vs personal max (15%), chronic load history length (10%).

8. **`personalMaxSpeed`** — fetched as the single highest `top_speed` ever recorded for the player. Used in injury risk speed-deficit component. Falls back to `totals.top_speed || 30` if none recorded.

### 8. Match reference defaults (`src/constants/matchDefaults.js`)

Position-specific per-90min match reference values for all 6 positions. Used as fallback when `match_references` has no row for a given metric. Example: `CM.total_distance = 12250 m`, `GK.total_distance = 5500 m`. `CM` is also the fallback for unknown positions.

### 9. Team snapshot update

After every week is fully processed, `weekly_aggregates.api` is re-queried for all players for that week and averaged (null-excluded) into `team_snapshots.tpi`. This is a global snapshot (not filtered by team), covering all players regardless of `team_id`.

---

## Edge Cases & Gotchas

- **Concurrent file parse completion.** Multiple files are parsed in parallel via PapaParse callbacks. The `remaining` counter decrements toward 0; grouping only runs when `remaining === 0`. There is no error recovery if one file parses but another errors — the success callback still fires for the good file and `remaining` decrements, but if the error callback fires for the other, `remaining` is also decremented, so grouping runs on a partial `allSessions`.

- **Duplicate player name across teams.** Player lookup is by `name` (`.in('name', playerNames)`). If two players in different teams have identical names, `playerMap[name]` will hold whichever row Supabase returns last. This is a silent data collision.

- **Re-upload / upsert behaviour.** `weekly_aggregates` is upserted on `(player_id, week_start_date)`. Re-uploading the same week replaces all computed fields. `weekly_sessions` uses `insert` (not upsert), so re-uploading will create duplicate session rows for the same dates. There is no deduplication guard on `weekly_sessions`.

- **Sessions with no parseable date are silently dropped.** `getMonday` returns `null` for unparseable dates; the `if (!weekStart) continue` guard discards the session. No user-visible warning.

- **ACWR includes weeks from the current upload.** The history query uses `.lt('week_start_date', weekStart)`, which will include weeks already inserted during this upload run (earlier in the chronological loop). This is intentional and ensures ACWR is correctly chained for multi-week uploads.

- **`processAllPlayers` is not atomic.** If it throws after inserting some session rows and aggregates but before completing, the DB is left in a partial state. There is no rollback. The user sees an error banner; re-uploading would add duplicate session rows.

- **`num()` helper filters non-finite values.** `const num = v => (typeof v === 'number' && isFinite(v)) ? v : null` — `Infinity` monotony (identical daily load every session) becomes `null` in `weekly_aggregates.monotony` even though the index functions handle `Infinity` internally during computation. The stored `monotony` is therefore `null` for this case, while the stored `tmi` will be `15`.

- **Speed unit conversion is heuristic.** The `m/s` detection checks if the normalised header string *contains* `"m/s"`. If a device exports km/h but puts `m/s` somewhere else in the header text, all speed values for that column are converted incorrectly.

- **New player modal halts all processing.** When an unknown player is detected, `setProcessing(false)` is called and the modal opens. Players already processed before the unknown one are already committed to the DB. "Cancel" leaves those partial writes in place.

- **`personalMaxSpeed` query fetches the single highest `top_speed` row across all time**, not just a rolling window. A single anomalous sprint reading permanently raises the bar for speed-deficit injury risk calculation.

- **`OPTIMAL_LOAD_PCT` is imported but not used in `computeMetrics`.** The constants file exports it for external reference (e.g. Settings feature) but `computeMetrics` derives its own thresholds directly.

- **Biomechanical upload zone is inert.** The second drop zone has no `onDrop`, `onChange`, or `onClick` handler. Dropping files on it does nothing.

- **`team_snapshots.tpi` is a global average.** It covers all players in `weekly_aggregates` for that week, not filtered by any team. A squad with players on multiple teams produces a blended TPI.

- **No file size or row count limits.** Large CSVs with many players and many sessions are parsed entirely in the browser. PapaParse streams synchronously; the app may become unresponsive for very large files.
