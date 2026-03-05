-- Prevent duplicate player_season records (same player, same team_season).
-- Run once on existing DBs: psql $DATABASE_URL -f db/migrations/add_player_seasons_unique.sql
ALTER TABLE player_seasons
ADD CONSTRAINT unique_player_season UNIQUE (player_id, team_season_id);
