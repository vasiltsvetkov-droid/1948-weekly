-- ═══════════════════════════════════════════════════════════
-- Barin Sports 360 — Schema Extension
-- Run AFTER the base schema.sql. Non-destructive (IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════

-- Wellness entries (daily subjective questionnaire)
CREATE TABLE IF NOT EXISTS wellness_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  sleep_quality numeric,      -- 1-10
  sleep_hours numeric,        -- hours
  soreness numeric,           -- 1-10 (high = more sore)
  mood numeric,               -- 1-10
  stress numeric,             -- 1-10 (high = more stressed)
  motivation numeric,         -- 1-10
  fatigue numeric,            -- 1-10 (high = more fatigued)
  energy numeric,             -- 1-10
  rpe numeric,                -- 1-10 (last session RPE)
  perceived_recovery numeric, -- 0-10
  confidence numeric,         -- 1-10
  life_stress numeric,        -- 1-10 (high = more stress)
  appetite numeric,           -- 1-10
  joint_stiffness numeric,    -- 1-10 (high = more stiff)
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, entry_date)
);

-- Practitioner test data (force plates, NordBord, IMTP, sprint F-V, etc.)
CREATE TABLE IF NOT EXISTS practitioner_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  test_date date NOT NULL,
  test_type text NOT NULL,    -- 'CMJ', 'NordBord', 'IMTP', 'sprint_fv', 'groin', 'rom', 'body_comp', 'endurance'
  data jsonb NOT NULL,        -- test-type-specific key-value pairs
  source_device text,         -- 'ForceDecks', 'NordBord', 'DynaMo', etc.
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Player rolling baselines (30-day per parameter)
CREATE TABLE IF NOT EXISTS player_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  param_key text NOT NULL,    -- universal parameter key (e.g. 'gps.total_distance')
  mean_30d numeric NOT NULL DEFAULT 0,
  sd_30d numeric NOT NULL DEFAULT 0,
  sample_count integer NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(player_id, param_key)
);

-- Team-level baselines (percentiles for Tier B normalization)
CREATE TABLE IF NOT EXISTS team_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  param_key text NOT NULL,
  p25 numeric,
  p50 numeric,
  p75 numeric,
  sample_count integer NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(team_id, param_key)
);

-- Daily index snapshots (the 5 new scores + confidence + full breakdown)
CREATE TABLE IF NOT EXISTS index_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  -- The 5 index scores (0-100, 50 = baseline)
  rtt numeric,
  rs numeric,
  ir numeric,
  nms numeric,
  ms numeric,
  -- Confidence percentages (0-100)
  confidence_rtt numeric,
  confidence_rs numeric,
  confidence_ir numeric,
  confidence_nms numeric,
  confidence_ms numeric,
  -- Full construct breakdown (C1-C20 scores, weights, confidence)
  constructs jsonb,
  -- Cross-index modifications applied
  cross_index_mods jsonb,
  -- Flags and warnings
  flags jsonb,
  -- Normalization tier used ('A', 'B', 'C')
  norm_tier text,
  -- Data source summary
  source_summary jsonb,
  -- IR extras
  ir_coverage text,
  ir_missing_clusters jsonb,
  ir_upper_bound numeric,
  -- NMS fatigue flag
  nms_fatigue_suppressed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, snapshot_date)
);

-- Add new columns to weekly_aggregates for backward compatibility
ALTER TABLE weekly_aggregates ADD COLUMN IF NOT EXISTS nms numeric;
ALTER TABLE weekly_aggregates ADD COLUMN IF NOT EXISTS ms numeric;
ALTER TABLE weekly_aggregates ADD COLUMN IF NOT EXISTS confidence_data jsonb;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wellness_player_date ON wellness_entries(player_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_practitioner_player_date ON practitioner_tests(player_id, test_date);
CREATE INDEX IF NOT EXISTS idx_baselines_player ON player_baselines(player_id, param_key);
CREATE INDEX IF NOT EXISTS idx_snapshots_player_date ON index_snapshots(player_id, snapshot_date);

-- RLS policies
ALTER TABLE wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE index_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON wellness_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON practitioner_tests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON player_baselines FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON team_baselines FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON index_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);
