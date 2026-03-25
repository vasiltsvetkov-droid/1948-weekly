-- Teams
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Players
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null check (position in ('CB','FB','CM','WM','ST','GK')),
  team_id uuid references teams(id) on delete set null,
  photo_url text,
  created_at timestamptz default now()
);

-- Match reference targets per player per metric (user-entered manually)
create table match_references (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  metric_key text not null,
  value_per90 numeric not null,
  created_at timestamptz default now(),
  unique(player_id, metric_key)
);

-- Raw session data (one row per CSV session row)
create table weekly_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  week_start_date date not null,
  session_date date,
  data jsonb not null,
  created_at timestamptz default now()
);

-- Computed weekly aggregates and indexes
create table weekly_aggregates (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  week_start_date date not null,
  -- External load totals
  total_distance numeric,
  hsr_distance numeric,
  sprint_distance numeric,
  hmld numeric,
  total_nrg numeric,
  nrg_above_th numeric,
  total_accelerations numeric,
  total_decelerations numeric,
  mechanical_load numeric,
  equivalent_distance numeric,
  high_efforts numeric,
  -- Averages and peaks
  avg_metabolic_power numeric,
  max_metabolic_power numeric,
  top_speed numeric,
  avg_speed numeric,
  intensity_indicator numeric,
  -- Internal load
  avg_hr numeric,
  max_hr numeric,
  heart_exertion numeric,
  heart_exertion_above_th numeric,
  -- ACWR values
  acwr_total_distance numeric,
  acwr_sprint numeric,
  acwr_mechanical numeric,
  acwr_nrg numeric,
  -- Indexes stored 0-100 (display layer divides by 10)
  -- api column stores Performance Index (combination of RTT, RS, TMI)
  api numeric,
  rtt numeric,
  rs numeric,
  tmi numeric,
  injury_risk numeric,
  -- Fatigue Index: (Heart Exertion % of match ref) - (NRG % of match ref)
  fatigue_index numeric,
  -- Training monotony
  monotony numeric,
  -- Load vs match reference percentages
  load_pct_total_distance numeric,
  load_pct_hsr numeric,
  load_pct_sprint numeric,
  load_pct_hmld numeric,
  load_pct_nrg numeric,
  load_pct_acc numeric,
  load_pct_dec numeric,
  -- Daily loads array for monotony
  daily_loads jsonb,
  -- Index explanations (RTT, RS, TMI, Performance)
  explanations jsonb,
  created_at timestamptz default now(),
  unique(player_id, week_start_date)
);

-- Team weekly snapshots
create table team_snapshots (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null unique,
  tpi numeric,
  squad_data jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table teams enable row level security;
alter table players enable row level security;
alter table match_references enable row level security;
alter table weekly_sessions enable row level security;
alter table weekly_aggregates enable row level security;
alter table team_snapshots enable row level security;

-- RLS policies: authenticated users can read and write all rows
create policy "auth_all" on teams for all to authenticated using (true) with check (true);
create policy "auth_all" on players for all to authenticated using (true) with check (true);
create policy "auth_all" on match_references for all to authenticated using (true) with check (true);
create policy "auth_all" on weekly_sessions for all to authenticated using (true) with check (true);
create policy "auth_all" on weekly_aggregates for all to authenticated using (true) with check (true);
create policy "auth_all" on team_snapshots for all to authenticated using (true) with check (true);

-- Migration: Add new columns for RTT/RS/TMI redesign
-- Run these if upgrading from a previous schema version:
-- ALTER TABLE weekly_aggregates ADD COLUMN IF NOT EXISTS acwr_nrg numeric;
-- ALTER TABLE weekly_aggregates ADD COLUMN IF NOT EXISTS fatigue_index numeric;
-- ALTER TABLE weekly_aggregates ADD COLUMN IF NOT EXISTS explanations jsonb;

-- Migration: Add multi-team support
-- Run these if upgrading from a previous schema version:
-- CREATE TABLE IF NOT EXISTS teams (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz default now());
-- ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "auth_all" ON teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- ALTER TABLE players ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- Migration: Add player photo_url column
-- ALTER TABLE players ADD COLUMN IF NOT EXISTS photo_url text;

-- Mesocycle aggregates (4-week / monthly analysis)
create table mesocycle_aggregates (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  mesocycle_start_date date not null,
  mesocycle_end_date date not null,
  -- Averaged indexes from the 4 microcycles (0-100)
  api numeric,
  rtt numeric,
  rs numeric,
  tmi numeric,
  injury_risk numeric,
  -- Averaged ACWR values
  acwr_total_distance numeric,
  acwr_sprint numeric,
  acwr_mechanical numeric,
  acwr_nrg numeric,
  -- Averaged load percentages
  load_pct_total_distance numeric,
  load_pct_hsr numeric,
  load_pct_sprint numeric,
  load_pct_hmld numeric,
  load_pct_nrg numeric,
  load_pct_acc numeric,
  load_pct_dec numeric,
  -- Totals summed across 4 weeks
  total_distance numeric,
  hsr_distance numeric,
  sprint_distance numeric,
  total_nrg numeric,
  -- Fatigue and monotony averages
  fatigue_index numeric,
  monotony numeric,
  -- Structured summary (JSON)
  summary jsonb,
  -- Source week dates
  week_dates jsonb,
  created_at timestamptz default now(),
  unique(player_id, mesocycle_start_date)
);

alter table mesocycle_aggregates enable row level security;
create policy "auth_all" on mesocycle_aggregates for all to authenticated using (true) with check (true);

-- Performance testing reports (uploaded HTML files)
create table performance_reports (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  title text not null,
  html_content text not null,
  uploaded_at timestamptz default now()
);

alter table performance_reports enable row level security;
create policy "auth_all" on performance_reports for all to authenticated using (true) with check (true);
