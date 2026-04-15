# Barin Sports PRO Analytics — System Architecture & Technology Overview

## 1. Purpose and Domain

This is a football (soccer) sports science analytics platform called "Barin Sports PRO Analytics". It allows sports science practitioners to upload weekly GPS/tracking data from football training sessions, compute performance metrics, injury risk scores, fatigue indexes, and training load analysis for individual players and squads. The platform generates data-driven recommendations based on an embedded sports science knowledge base, referencing published research (Gabbett, Banister, Osgnach, etc.).

## 2. Programming Language

The entire application is written in **JavaScript (ES Modules)** — specifically JSX (React's syntax extension). There is no TypeScript. All source files use `.jsx` or `.js` extensions. The codebase uses modern ES2020+ features: optional chaining, nullish coalescing, async/await, destructuring, template literals, and ES module `import`/`export` syntax.

## 3. Frontend Framework

- **React 19** (`react` ^19.2.4, `react-dom` ^19.2.4) — the latest major version of React
- **React Router DOM v7** (`react-router-dom` ^7.13.1) — client-side routing with `<Routes>`, `<Route>`, `<Navigate>`, `useNavigate`, `useParams`, `<Link>`, and `<Outlet>` for nested layouts
- This is a **Single Page Application (SPA)** — there is no server-side rendering

## 4. Build Tool and Dev Server

- **Vite 6** (`vite` ^6.3.5) — the build tool and development server
- Vite plugins in use:
  - `@vitejs/plugin-react` — React Fast Refresh and JSX transform
  - `@tailwindcss/vite` — Tailwind CSS integration
  - `vite-plugin-pwa` — Progressive Web App (PWA) support with service worker auto-update, offline caching via Workbox, and a manifest for installable app behavior (standalone display mode, app icons)
- Build output is static HTML/JS/CSS (no Node.js backend required at runtime)
- Config file: `vite.config.js`

## 5. CSS / Styling

- **Tailwind CSS v4** (`tailwindcss` ^4.2.1) — utility-first CSS framework, imported directly as `@import "tailwindcss"` in `src/index.css`
- **CSS Custom Properties (Variables)** — extensive use of CSS variables for theming (`--bg-primary`, `--text-primary`, `--color-primary`, `--font-main`, etc.)
- **Dark/Light Theme Support** — theme toggling via `[data-theme="light"]` / `[data-theme="dark"]` CSS selectors with full variable overrides
- **Custom Fonts** loaded from Google Fonts:
  - **Montserrat** — headings/main UI text
  - **Nunito Sans** — data/body text
  - **DM Mono** — monospace labels, data values, and table content
- **Glassmorphism Design** — uses `backdrop-filter: blur()`, semi-transparent backgrounds (`rgba`), and glow shadows for a modern dark-mode aesthetic
- Some components use **inline styles** (JavaScript `style={}` objects) alongside Tailwind classes

## 6. Database

**Supabase** (Backend-as-a-Service built on **PostgreSQL**)

Connection is via `@supabase/supabase-js` SDK v2, initialized with environment variables:
- `VITE_SUPABASE_URL` — the Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — the anonymous/public API key

All database access happens **client-side** — the React app directly queries Supabase from the browser. There is no custom backend/API server.

### Database Schema (8 tables)

| Table | Purpose |
|---|---|
| `teams` | Team records (id, name) |
| `players` | Player records (name, position [CB/FB/CM/WM/ST/GK], team_id FK, photo_url) |
| `match_references` | Per-player per-metric match reference targets (user-entered benchmarks) |
| `weekly_sessions` | Raw CSV session data stored as JSONB (one row per training session) |
| `weekly_aggregates` | Computed weekly metrics, indexes, ACWR values, load percentages — the core analytics table with ~40+ numeric columns |
| `team_snapshots` | Team-level weekly averages (TPI = Team Performance Index) |
| `mesocycle_aggregates` | 4-week (mesocycle) averaged indexes, trends, and summary JSON |
| `performance_reports` | Uploaded HTML performance testing reports |

Key details:
- All primary keys are **UUID** (`gen_random_uuid()`)
- Foreign keys with `ON DELETE CASCADE` or `ON DELETE SET NULL`
- **Row Level Security (RLS)** enabled on all tables with a simple policy: all authenticated users can read/write all rows (no per-user data isolation)
- Uses **upsert** operations with `ON CONFLICT` for idempotent data processing
- JSONB columns for flexible data: `data` (raw session CSV rows), `daily_loads`, `explanations`, `squad_data`, `summary`, `week_dates`

The full schema is defined in `supabase/schema.sql`.

## 7. Authentication

- **Supabase Auth** — email/password authentication
- Login page at `/login` with `supabase.auth.signInWithPassword()`
- Session management via `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange()`
- Route protection via an `AuthGuard` component that wraps all authenticated routes using React Router's `<Outlet>` pattern
- No role-based access control — all authenticated users have equal access

## 8. Application Architecture

This is a **client-side only SPA** with no backend server:

```
Browser (React SPA) --> Supabase (PostgreSQL + Auth + Storage)
```

- **No REST API layer** — the React app calls Supabase directly using the JS SDK
- **No server-side logic** — all metric computation, recommendations, and report generation happen in the browser
- **All business logic lives in `/src/lib/`:**
  - `computeMetrics.js` — the core engine that calculates ~40+ metrics from raw CSV data (ACWR, injury risk, fatigue index, performance indexes, load percentages, monotony, etc.)
  - `generateRecommendations.js` — rule-based recommendation engine with 13+ rules producing alerts, cautions, and positive findings with academic citations
  - `computeMesocycle.js` — aggregates 4 weekly cycles into mesocycle analysis with trends, concerns, positives, and recommendations
  - `exportReport.js` — generates standalone HTML reports and PDF exports (via `html2canvas` + `jsPDF`)
  - `chartRegistry.js` — chart type registry for dynamic visualization

## 9. Key Computed Indexes

The system computes several composite indexes (all stored 0-100, displayed as 0-10):

| Index | Description |
|---|---|
| **PI (Performance Index)** | Overall performance composite of RTT, RS, TMI |
| **RTT (Readiness to Train)** | Based on ACWR and load vs match references |
| **RS (Recovery Status)** | Based on ACWR, fatigue index, and heart rate data |
| **TMI (Training Monotony Index)** | Based on day-to-day load variation |
| **Injury Risk** | Composite of ACWR spikes, mechanical overload, monotony, speed deficit, fatigue |
| **ACWR (Acute:Chronic Workload Ratio)** | Calculated for total distance, sprint, mechanical load, and NRG |
| **Fatigue Index** | Cardiac cost vs mechanical output ratio |

## 10. Data Input Flow

1. User uploads one or more CSV files (exported from GPS tracking system)
2. CSV is parsed client-side using **PapaParse** (`papaparse` ^5.5.3)
3. Headers are fuzzy-matched to a predefined column schema (`CSV_COLUMNS` in `src/constants/csvColumns.js`) — handles mangled/unicode headers, Excel formula wrapping, speed unit conversion (m/s to km/h)
4. Sessions are grouped by player name and by week (Monday of each session's date)
5. For each player-week: prior history is fetched from Supabase, match references are resolved (user-entered or position-based defaults from `src/constants/matchDefaults.js`), and `computeMetrics()` runs
6. Results are upserted into `weekly_aggregates` and `weekly_sessions`
7. Team snapshots are updated

## 11. Knowledge Base System

The app includes an embedded sports science knowledge base in `/src/knowledge/`:

- 12+ Markdown files covering topics: load management, periodization, fatigue monitoring, injury risk, mechanical load, speed exposure, recovery protocols, position demands, return-to-play, training monotony, match demands, and strength/power
- These are imported at build time via Vite's `?raw` import (zero runtime cost)
- A parser (`knowledge/index.js`) extracts: postulates, thresholds, analysis templates, chart specifications, and references from each markdown file
- Templates use `${variable}` interpolation for dynamic recommendation text
- The recommendation engine (`generateRecommendations.js`) uses this knowledge base to produce contextual, evidence-based alerts and recommendations

## 12. Pages / Routes

| Route | Page | Purpose |
|---|---|---|
| `/login` | Login | Email/password authentication |
| `/home` | Home | Landing/home page |
| `/` | Dashboard | Squad overview table for selected week, team filter, TPI gauge, export |
| `/upload` | Upload | CSV file upload with drag-and-drop, preview, and processing |
| `/player/:id` | PlayerDetail | Individual player weekly analysis with indexes, charts, recommendations |
| `/history/:id` | History | Historical trend analysis for a player |
| `/mesocycle` | Mesocycle | 4-week mesocycle analysis and reports |
| `/settings` | Settings | Match reference targets, player management, team management |
| `/tools` | AnalysisTools | Advanced analysis tools |
| `/performance-testing` | PerformanceTesting | Performance testing report uploads/viewing |

## 13. Charts and Visualization

- **Recharts** (`recharts` ^3.8.0) — React charting library
- Chart types include: trend lines, radar charts, dual-axis charts, stacked area charts, zone area charts, grouped bar charts, gauge charts (in `src/components/charts/`)
- Custom circular gauge components for index display (SVG-based `CircularGauge.jsx`)
- Load bar components for metric visualization (`LoadBar.jsx`)

## 14. Report Export

- **HTML Reports** — standalone self-contained HTML files with embedded CSS, SVG gauges, and theme toggle (dark/light)
- **PDF Reports** — generated via `html2canvas` (renders HTML to canvas) + `jsPDF` (converts canvas to multi-page A4 PDF)
- Reports include: squad tables, circular gauge SVGs, line chart SVGs, team averages, and footer branding
- Both weekly (microcycle) and mesocycle (4-week) report formats are supported

## 15. PWA (Progressive Web App)

Configured via `vite-plugin-pwa` with:
- Auto-updating service worker
- App manifest (name: "Barin Sports PRO Analytics", standalone display mode)
- Icons (192px and 512px PNG)
- Workbox runtime caching for Supabase API calls (NetworkFirst strategy with 10s timeout)
- Glob patterns for pre-caching all static assets (`**/*.{js,css,html,ico,png,svg}`)

## 16. Position-Based Match Defaults

The system has built-in match reference defaults for 6 positions (in `src/constants/matchDefaults.js`):

| Position | Total Distance | HSR | Sprint | HMLD | NRG | Acc | Dec |
|---|---|---|---|---|---|---|---|
| CB | 10,850m | 475m | 200m | 1,500m | 58,000 J/kg | 140 | 130 |
| FB | 11,750m | 850m | 320m | 1,800m | 62,000 J/kg | 140 | 150 |
| CM | 12,250m | 750m | 280m | 2,000m | 65,000 J/kg | 140 | 155 |
| WM | 11,750m | 1,050m | 400m | 1,800m | 63,000 J/kg | 165 | 150 |
| ST | 10,750m | 750m | 300m | 1,500m | 59,000 J/kg | 155 | 140 |
| GK | 5,500m | 100m | 40m | 600m | 30,000 J/kg | 60 | 55 |

Users can override these with custom per-player values via the Settings page.

## 17. Custom React Hooks

Data fetching is organized into custom hooks in `src/hooks/`:
- `useWeeklyData.js` — fetches weekly aggregate data, available weeks, and squad data for a selected week/team
- `useTeams.js` — fetches team list
- `usePlayer.js` — fetches player data
- `useMesocycle.js` — fetches mesocycle data
- `useHistory.js` — fetches historical trend data

## 18. Third-Party Dependencies Summary

### Runtime Dependencies
| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.4 | UI framework |
| `react-dom` | ^19.2.4 | React DOM renderer |
| `react-router-dom` | ^7.13.1 | Client-side routing |
| `@supabase/supabase-js` | ^2.99.1 | Supabase SDK (database + auth) |
| `recharts` | ^3.8.0 | Charts and data visualization |
| `papaparse` | ^5.5.3 | CSV parsing |
| `jspdf` | ^4.2.0 | PDF generation |
| `html2canvas` | ^1.4.1 | HTML-to-canvas rendering for PDF export |

### Dev Dependencies
| Package | Version | Purpose |
|---|---|---|
| `vite` | ^6.3.5 | Build tool and dev server |
| `@vitejs/plugin-react` | ^4.5.2 | React support for Vite |
| `tailwindcss` | ^4.2.1 | Utility-first CSS framework |
| `@tailwindcss/vite` | ^4.2.1 | Tailwind Vite plugin |
| `vite-plugin-pwa` | ^0.21.1 | PWA/service worker support |

## 19. What the System Does NOT Have

- **No backend server** (no Node.js/Express/Next.js server)
- **No TypeScript** (pure JavaScript)
- **No testing framework** (no Jest, Vitest, or Cypress)
- **No CI/CD pipeline** in the repository
- **No Docker** configuration
- **No committed environment file** (uses Vite env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- **No API rate limiting or caching layer** beyond Workbox PWA caching
- **No role-based access control** (single role: authenticated user)
- **No internationalization (i18n)** — English only
- **No state management library** (no Redux, Zustand, etc.) — uses React `useState`/`useEffect` hooks with Supabase as the source of truth

## 20. Deployment

The application builds to static files via `vite build` and can be deployed to any static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.). The only external runtime dependency is the Supabase project for database and authentication.

### Required Environment Variables for Deployment
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public API key

## 21. File Structure Overview

```
/
├── index.html                  # Entry HTML file
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite build configuration
├── supabase/
│   └── schema.sql              # Full database schema
├── public/
│   ├── icon-192.png            # PWA icon (small)
│   └── icon-512.png            # PWA icon (large)
├── demo-data/                  # Sample CSV data files
│   ├── gps/                    # GPS tracking data
│   ├── wellness/               # Wellness/RPE data
│   └── practitioner/           # Practitioner testing data (ForceDecks, NordBord, etc.)
└── src/
    ├── main.jsx                # App entry point
    ├── App.jsx                 # Router and route definitions
    ├── index.css               # Global styles + Tailwind import
    ├── pages/                  # Page-level components (10 pages)
    ├── components/             # Reusable UI components
    │   ├── charts/             # Chart components (7 chart types)
    │   ├── Layout.jsx          # App shell with sidebar navigation
    │   ├── AuthGuard.jsx       # Route protection
    │   ├── CircularGauge.jsx   # SVG gauge component
    │   ├── LoadBar.jsx         # Load metric bar component
    │   ├── IndexCard.jsx       # Index display card
    │   ├── RecommendationCard.jsx  # Recommendation display
    │   ├── DetailedAnalysis.jsx    # Detailed analysis panel
    │   └── NeuralBackground.jsx    # Decorative background
    ├── hooks/                  # Custom React hooks (5 hooks)
    ├── lib/                    # Core business logic
    │   ├── computeMetrics.js   # Metric computation engine
    │   ├── generateRecommendations.js  # Recommendation engine
    │   ├── computeMesocycle.js # Mesocycle aggregation
    │   ├── exportReport.js     # HTML/PDF report generation
    │   ├── chartRegistry.js    # Chart type registry
    │   └── supabaseClient.js   # Supabase client initialization
    ├── constants/              # Configuration constants
    │   ├── csvColumns.js       # CSV column name mappings
    │   └── matchDefaults.js    # Position-based default values
    └── knowledge/              # Sports science knowledge base (12+ .md files + index.js parser)
```
