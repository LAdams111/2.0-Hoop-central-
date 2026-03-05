-- Scrape job queue for resumable NCAA player ingestion.
-- Run once on existing databases: psql $DATABASE_URL -f add_player_scrape_jobs.sql
CREATE TABLE IF NOT EXISTS player_scrape_jobs (
  id SERIAL PRIMARY KEY,
  player_url TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_player_scrape_jobs_status ON player_scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_player_scrape_jobs_pending ON player_scrape_jobs(id) WHERE status = 'pending';
