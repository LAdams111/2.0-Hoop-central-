-- Add Sports Reference player ID to prevent duplicate player inserts.
-- Run once on existing databases (e.g. psql $DATABASE_URL -f add_sr_player_id.sql)
ALTER TABLE players ADD COLUMN sr_player_id TEXT UNIQUE;
