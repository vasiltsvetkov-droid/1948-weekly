-- Players
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null check (position in ('CB','FB','CM','WM','ST','GK')),
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
  -- Indexes stored 0-100 (display layer divides by 10)
  api numeric,
  rtt numeric,
  rs numeric,
  tmi numeric,
  injury_risk numeric,
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
alter table players enable row level security;
alter table match_references enable row level security;
alter table weekly_sessions enable row level security;
alter table weekly_aggregates enable row level security;
alter table team_snapshots enable row level security;

-- RLS policies: authenticated users can read and write all rows
create policy "auth_all" on players for all to authenticated using (true) with check (true);
create policy "auth_all" on match_references for all to authenticated using (true) with check (true);
create policy "auth_all" on weekly_sessions for all to authenticated using (true) with check (true);
create policy "auth_all" on weekly_aggregates for all to authenticated using (true) with check (true);
create policy "auth_all" on team_snapshots for all to authenticated using (true) with check (true);
