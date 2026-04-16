# Feature 03 — Microcycle Dashboard

**Route:** `/`
**Component:** `src/pages/Dashboard.jsx`
**Related lib:** `src/lib/exportReport.js` (functions `generateWeeklyHTML`, `downloadHTML`, `downloadPDF`)
**Related hooks:** `src/hooks/useWeeklyData.js` (`useWeeks`, `useSquadWeek`), `src/hooks/useTeams.js` (`useTeams`)

---

## Purpose

The Microcycle Dashboard is the landing page for authenticated users. It gives a one-glance squad-level view of a single training week (a "microcycle"), showing each player's five headline indexes plus a team-wide Team Performance Index (TPI). It is the entry point into per-player analysis and supports HTML/PDF export of the weekly squad report.

It answers:
- "For the week I pick, how is every player scoring on Performance, Readiness to Train, Recovery, Training Monotony, and Injury Risk?"
- "What is the team's average performance this week?"
- "Can I hand stakeholders a standalone one-pager for this week?"

---

## User-Facing Behavior

1. **Header controls (top right):**
   - **Team selector** — dropdown populated from the `teams` table. Default is "All Teams" (empty string). When a team is selected, the squad table and TPI are filtered to players whose `team_id` matches. Only shown when at least one team exists.
   - **Week selector** — dropdown of every distinct `week_start_date` ever stored in `weekly_aggregates`, newest first. Defaults to the most recent week on first render.
   - **Upload button** — links to `/upload`.
   - **Export button** — opens a dropdown with "Export HTML" and "Export PDF". Disabled while exporting. Only rendered when the squad table has at least one row.

2. **TPI card** — shows the squad-average Performance Index for the current filtered week, formatted as `X.X/10`. Color coded:
   - `>= 7.0` → green (`#10B981`)
   - `5.0 – 6.9` → amber (`#F59E0B`)
   - `< 5.0` → red (`#EF4444`)
   - `null` → em dash, muted color

3. **Squad table** — one row per player for the selected week/team. Columns: Player, Pos, PI, RTT, RS, TMI, Injury Risk, (chevron).
   - All index cells display the stored 0–100 value divided by 10, rounded to one decimal (`value / 10` formatted to `.toFixed(1)`).
   - Injury Risk cell is colored by threshold: `>= 7` green, `>= 5` amber, otherwise red. (The index is stored as a safety score, so higher = safer.)
   - Each row has a conditional background tint based on injury risk (`<= 4` red tint, `<= 6` amber tint, else none) to flag at-risk players.
   - Clicking a row navigates to `/player/:id`.

4. **Loading state** — "Loading..." while either `useWeeks` or `useSquadWeek` is fetching.

5. **Empty state** — when no squad data exists for the selected week/team: shows "No data for this week." and a link to `/upload`.

6. **Export flow:**
   - HTML export calls `generateWeeklyHTML(squad, selectedWeek, teamName)` and triggers a blob download named `microcycle-report-<week>.html`.
   - PDF export renders the same HTML into a hidden iframe, captures it with `html2canvas`, and saves as multi-page A4 PDF via `jsPDF`, named `microcycle-report-<week>.pdf`. The current app theme (`data-theme` attribute on `<html>`) is inherited by the export.

---

## Data Model

The dashboard is **read-only against Supabase** — it does not insert, update, or delete any row. It reads from the following tables:

### `weekly_aggregates` (primary source)

One row per `(player_id, week_start_date)`. The dashboard reads these columns:

| Column | Type | Used for |
|---|---|---|
| `id` | uuid | React key |
| `player_id` | uuid FK → `players.id` | Row click navigation |
| `week_start_date` | date | Week selector options; filter |
| `api` | numeric (0–100) | PI column + TPI average |
| `rtt` | numeric (0–100) | RTT column |
| `rs` | numeric (0–100) | RS column |
| `tmi` | numeric (0–100) | TMI column |
| `injury_risk` | numeric (0–100, stored as safety score) | Injury Risk column + row tint |

Indexes are stored 0–100. The UI divides by 10 for display (`0.0 – 10.0`).

### `players` (joined, not filtered directly)

`useSquadWeek` fetches with `.select('*, players(name, position, team_id)')`. Dashboard uses:

| Column | Type | Used for |
|---|---|---|
| `id` | uuid | (implicit FK target for `player_id`) |
| `name` | text | Player column |
| `position` | text (CB/FB/CM/WM/ST/GK) | Pos badge |
| `team_id` | uuid FK → `teams.id` | Client-side team filter |

### `teams` (for filter dropdown)

| Column | Type | Used for |
|---|---|---|
| `id` | uuid | filter value |
| `name` | text | dropdown label |

### Uniqueness / constraints relied on

- `weekly_aggregates(player_id, week_start_date)` has a UNIQUE constraint — the dashboard assumes at most one row per player per week.
- `players.position` is constrained to `('CB','FB','CM','WM','ST','GK')` — the Pos badge expects one of these (but renders `—` if null).

### RLS

All tables read here have RLS enabled with a single `auth_all` policy granting authenticated users full read/write. The dashboard only ever reads, so no write policy is exercised.

---

## API Endpoints

There is **no custom backend**. All data access is direct calls to Supabase PostgREST via `@supabase/supabase-js`:

1. **List available weeks** — `useWeeks()`
   ```js
   supabase
     .from('weekly_aggregates')
     .select('week_start_date')
     .order('week_start_date', { ascending: false })
   ```
   Then dedupes client-side via `new Set()`. Returns a sorted array of ISO date strings (newest first).

2. **Fetch squad for a week** — `useSquadWeek(weekStartDate, teamId)`
   ```js
   supabase
     .from('weekly_aggregates')
     .select('*, players(name, position, team_id)')
     .eq('week_start_date', weekStartDate)
   ```
   Team filtering is applied **client-side** after the query: `rows.filter(r => r.players?.team_id === teamId)`. No server-side team filter is sent.

3. **List teams** — `useTeams()`
   ```js
   supabase
     .from('teams')
     .select('*')
     .order('name')
   ```
   Gracefully tolerates the `teams` table not existing by detecting error codes `42P01`, `PGRST204`, `404`, or error messages containing "relation" — in which case it sets `tableReady = false` and returns an empty list.

4. **Authentication** — the page is wrapped by `AuthGuard`. If the Supabase session is absent, the user is redirected to `/login` before Dashboard renders.

---

## Key Business Logic

### Index display scaling

All five indexes are persisted as 0–100 integers. The display layer uniformly divides by 10:

```js
function fmt(val) {
  if (val == null) return '—'
  return (val / 10).toFixed(1)
}
```

This is applied to `api`, `rtt`, `rs`, `tmi`, and `injury_risk` in the table cells and the TPI card.

### TPI (Team Performance Index) computation

Computed in-component, not from the database:

```js
const tpi = squad.length
  ? squad.reduce((sum, s) => sum + (s.api || 0), 0) / squad.length
  : null
```

- It is the arithmetic mean of `api` across every row currently visible in the table.
- Null `api` values are coerced to `0` by the `|| 0` — this is a minor fidelity issue but preserved for parity with the existing app; a faithful reimplementation should keep the same behavior. (The pre-existing `team_snapshots.tpi` column stores a different TPI computed at upload time by the Upload page; the Dashboard does not read it.)
- Displayed as `(tpi / 10).toFixed(1)` or `—` when null.

### Injury Risk semantics (CRITICAL — do not invert)

`injury_risk` in `weekly_aggregates` is stored as a **safety score** (0–100, higher = safer). This is the result of `computeInjuryRisk` inverting the raw risk (`safetyScore = 100 - rawRisk`). The Dashboard treats higher values as better:

- Green color if `injury_risk / 10 >= 7`
- Amber if `>= 5`
- Red otherwise

Row background tint uses the same direction: low scores tint red (= risky).

### Color thresholds

Centralized inline (no shared helper):

| Score (0–10) | Use |
|---|---|
| `>= 7` | green `#10B981` (TPI, Injury Risk cell) |
| `>= 5` | amber `#F59E0B` |
| `< 5` | red `#EF4444` |

Row background uses gentler tints: `<= 4` → `rgba(239,68,68,0.06)`, `<= 6` → `rgba(217,119,6,0.06)`.

### Default week selection

```js
useEffect(() => {
  if (weeks.length && !selectedWeek) setSelectedWeek(weeks[0])
}, [weeks])
```

Because `useWeeks` sorts descending, `weeks[0]` is always the most recent available week. The effect only runs when `selectedWeek` is null, so user-selected weeks are preserved across refetches.

### Team filter

- Empty string `''` means "All Teams" — passed to `useSquadWeek` as `selectedTeamId || null`, which disables filtering.
- When a `teamId` is set, filtering happens **after** the network fetch via an in-memory `.filter(r => r.players?.team_id === teamId)`. The fetch always returns every player for the week.

### Export report generation (`generateWeeklyHTML`)

Called with `(squad, weekDate, teamName)`. Produces a standalone HTML string containing:

- A fixed header with the Barin logo (dark/light variants from imgur CDN), title "Microcycle Report", team name (or "All Teams"), and the ISO week date.
- Five average cards (PI, RTT, RS, TMI, Injury Risk) rendered as 80px SVG circular gauges. Averages are computed **inline** as `squad.reduce((s, r) => s + (r[key] || 0), 0) / n`, so null rows contribute 0 (same caveat as TPI). For Injury Risk the `inverted` flag is passed to `invertedColor`, but that function uses the same direction as `scoreColor` — it's just a naming distinction.
- A player table with columns Player, Pos, PI, RTT, RS, TMI, Injury Risk — each index cell is an inline 54px SVG gauge.
- Footer: `© 2026 Barin Sports PRO Sports Science. All Rights Reserved.`
- Theme toggle button (☀/☾) with a small injected `<script>` that toggles `data-theme` on `<html>` and swaps the logo.

The HTML is fully self-contained (CSS embedded in a `<style>` block, no external JS except the inline toggle). It uses CSS custom properties to support both dark and light themes.

### PDF export (`downloadPDF`)

1. Detects current app theme from `document.documentElement.getAttribute('data-theme')`.
2. Rewrites the `<html lang="en">` tag to force that theme into the export.
3. Creates an off-screen iframe (794×2000, ~A4 portrait at 96dpi), injects the HTML, waits 300ms.
4. Dynamically imports `html2canvas`, renders the iframe body at `scale: 2` with the theme's background color.
5. Slices the canvas into A4 (210×297mm) pages using `jsPDF` (`p`, `mm`, `[210, 297]`) — adds pages while `heightLeft > 0`.
6. Saves as `<filename>`. Cleans up the iframe.

---

## Edge Cases

| Case | Behavior |
|---|---|
| No weeks in the database | Week selector shows "No data"; squad area shows "No data for this week." with an upload CTA. |
| `weeks` loaded but `selectedWeek` never set (race) | `useEffect` auto-selects `weeks[0]` on next render. |
| User selects a week, then filters by a team with no players in that week | Squad is an empty array; table shows the empty-state message. |
| Player exists in `players` but has no `weekly_aggregates` row for the selected week | They are simply absent from the table — no placeholder row. |
| `api` / `rtt` / `rs` / `tmi` / `injury_risk` is null for a row | Cell renders `—`. The row still shows, but contributes `0` to TPI average (known fidelity issue — preserve as-is in migration). |
| `injury_risk` is null | Cell renders `—`; row background is clean (no tint). |
| `players` join returns null (orphan aggregate) | Name shows `—`, Pos shows `—`; row click still navigates using `row.player_id`. |
| `teams` table does not exist / migrations not yet run | `useTeams` silently returns `teams = []`, `tableReady = false`; the team selector is not rendered. |
| User clicks Export with zero rows | Export button is not rendered at all when `squad.length === 0`. |
| Two exports triggered in quick succession | Second click is blocked by the `disabled={exporting}` state. |
| Theme is switched mid-export | `downloadPDF` snapshots the theme at call time and injects it into the rewritten HTML — the exported file will match the theme at the moment of click. |
| Network failure on any fetch | Errors are swallowed by hooks (`if (!error) ...`); loading spinner ends but data stays empty. No user-visible error message on the Dashboard (known gap — the reimplementation may want to surface these). |
| Row click on a player whose `player_id` is null | Would navigate to `/player/null`. In practice shouldn't happen because `player_id` is a NOT NULL-ish FK, but PlayerDetail handles `player: null` gracefully. |
| Unicode or long player names | Rendered as-is; no truncation logic. |
| Week stored in a timezone-shifted format | `week_start_date` is a `date` column (no time component). The Upload page writes Monday-of-week in local time as `YYYY-MM-DD`, so string comparison / equality is safe. |

---

## Migration Checklist (for the new platform)

To reproduce feature #3 verbatim:

1. Provision the `weekly_aggregates`, `players`, `teams` tables per `supabase/schema.sql` (or equivalent in the new backend). Preserve: UUID PKs, `weekly_aggregates(player_id, week_start_date)` UNIQUE, and the `players.position` CHECK constraint.
2. Ensure authenticated users can `SELECT` all three tables (RLS `auth_all` policy or equivalent).
3. Port the three hooks: `useWeeks`, `useSquadWeek`, `useTeams`. The queries above are the full contract.
4. Port the `Dashboard` page with the exact display rules (divide by 10, color thresholds, row tinting, TPI formula).
5. Port `generateWeeklyHTML`, `downloadHTML`, `downloadPDF` from `exportReport.js` so export parity is preserved.
6. Gate the route behind the auth guard.
7. No CSV columns, no match-reference math, and no knowledge-base lookups are needed for this feature — those belong to Upload, PlayerDetail, and Mesocycle respectively.
