-- Hoop Central 2.0 — Canonical sports database schema
-- Supports NBA (and other leagues) player and season stats.

-- =============================================================================
-- CORE ENTITIES (independent of time/season)
-- =============================================================================

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  birth_date DATE,
  birth_place TEXT,
  height_cm INT,
  weight_kg INT,
  position TEXT,
  nationality TEXT,
  college TEXT,
  draft_year INT,
  draft_round INT,
  draft_pick INT,
  sr_player_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_external_ids (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  UNIQUE(source, external_id)
);

CREATE TABLE IF NOT EXISTS leagues (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  abbreviation TEXT,
  league_id INT REFERENCES leagues(id)
);

-- =============================================================================
-- TIME-BOUND ENTITIES (seasons link leagues and teams)
-- =============================================================================

CREATE TABLE IF NOT EXISTS seasons (
  id SERIAL PRIMARY KEY,
  league_id INT NOT NULL REFERENCES leagues(id),
  year_start INT NOT NULL,
  year_end INT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_seasons (
  id SERIAL PRIMARY KEY,
  team_id INT NOT NULL REFERENCES teams(id),
  season_id INT NOT NULL REFERENCES seasons(id),
  wins INT,
  losses INT
);

-- =============================================================================
-- PLAYER–TEAM–SEASON (player seasons link players to teams in a season)
-- =============================================================================

CREATE TABLE IF NOT EXISTS player_seasons (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id),
  team_season_id INT NOT NULL REFERENCES team_seasons(id),
  jersey_number INT,
  games_played INT,
  UNIQUE (player_id, team_season_id)
);

-- =============================================================================
-- STATS (belong to player_seasons)
-- =============================================================================

CREATE TABLE IF NOT EXISTS player_season_stats (
  id SERIAL PRIMARY KEY,
  player_season_id INT NOT NULL REFERENCES player_seasons(id) ON DELETE CASCADE,
  games INT,
  games_started INT,
  minutes INT,
  fg INT,
  fga INT,
  fg_pct NUMERIC,
  fg3 INT,
  fg3a INT,
  three_pct NUMERIC,
  ft INT,
  fta INT,
  ft_pct NUMERIC,
  orb INT,
  drb INT,
  rebounds INT,
  assists INT,
  steals INT,
  blocks INT,
  turnovers INT,
  fouls INT,
  points INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- SCRAPE JOB QUEUE (resumable NBA player ingestion)
-- =============================================================================

CREATE TABLE IF NOT EXISTS player_scrape_jobs (
  id SERIAL PRIMARY KEY,
  player_url TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_players_full_name ON players(full_name);
CREATE INDEX IF NOT EXISTS idx_player_scrape_jobs_status ON player_scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_player_scrape_jobs_pending ON player_scrape_jobs(id) WHERE status = 'pending';
-- Unique index on (source, external_id) is created by UNIQUE constraint on player_external_ids
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_seasons_league_id ON seasons(league_id);
CREATE INDEX IF NOT EXISTS idx_player_seasons_player_id ON player_seasons(player_id);
CREATE INDEX IF NOT EXISTS idx_player_seasons_team_season_id ON player_seasons(team_season_id);
