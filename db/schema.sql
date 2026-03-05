-- Hoop Central 2.0 — Canonical sports database schema
-- Supports tens of thousands of players across many seasons (NCAA, NBA, etc.)

-- =============================================================================
-- CORE ENTITIES (independent of time/season)
-- =============================================================================

CREATE TABLE players (
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
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE player_external_ids (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  UNIQUE(source, external_id)
);

CREATE TABLE leagues (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  abbreviation TEXT,
  league_id INT REFERENCES leagues(id)
);

-- =============================================================================
-- TIME-BOUND ENTITIES (seasons link leagues and teams)
-- =============================================================================

CREATE TABLE seasons (
  id SERIAL PRIMARY KEY,
  league_id INT NOT NULL REFERENCES leagues(id),
  year_start INT NOT NULL,
  year_end INT NOT NULL
);

CREATE TABLE team_seasons (
  id SERIAL PRIMARY KEY,
  team_id INT NOT NULL REFERENCES teams(id),
  season_id INT NOT NULL REFERENCES seasons(id),
  wins INT,
  losses INT
);

-- =============================================================================
-- PLAYER–TEAM–SEASON (player seasons link players to teams in a season)
-- =============================================================================

CREATE TABLE player_seasons (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id),
  team_season_id INT NOT NULL REFERENCES team_seasons(id),
  jersey_number INT,
  games_played INT
);

-- =============================================================================
-- STATS (belong to player_seasons)
-- =============================================================================

CREATE TABLE player_season_stats (
  id SERIAL PRIMARY KEY,
  player_season_id INT NOT NULL REFERENCES player_seasons(id) ON DELETE CASCADE,
  games INT,
  minutes INT,
  points INT,
  rebounds INT,
  assists INT,
  steals INT,
  blocks INT,
  fg_pct NUMERIC,
  three_pct NUMERIC,
  ft_pct NUMERIC
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_players_full_name ON players(full_name);
-- Unique index on (source, external_id) is created by UNIQUE constraint on player_external_ids
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_seasons_league_id ON seasons(league_id);
CREATE INDEX idx_player_seasons_player_id ON player_seasons(player_id);
CREATE INDEX idx_player_seasons_team_season_id ON player_seasons(team_season_id);
