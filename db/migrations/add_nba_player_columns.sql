-- Add NBA player and stats columns (run once on existing DBs).
-- Players: college, draft info
ALTER TABLE players ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_year INT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_round INT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_pick INT;

-- Player season stats: per-game fields from Basketball Reference
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS games_started INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS fg INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS fga INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS fg3 INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS fg3a INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS ft INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS fta INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS orb INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS drb INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS turnovers INT;
ALTER TABLE player_season_stats ADD COLUMN IF NOT EXISTS fouls INT;
