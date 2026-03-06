/**
 * Run a limited test batch of NBA player scrape jobs.
 * Crawls Basketball Reference index and queues first TEST_LIMIT players.
 *
 * Run: node jobs/runTestBatch.js
 * Optional: TEST_LIMIT=200 node jobs/runTestBatch.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const ensureSchema = require("../utils/ensureSchema");
const { query } = require("../db/db");
const { crawlNbaPlayerIndex } = require("../scrapers/nba/nbaPlayerIndexCrawler");

const TEST_LIMIT = parseInt(process.env.TEST_LIMIT, 10) || 500;

async function main() {
  const DATABASE_URL =
    process.env.DATABASE_URL ||
    (process.env.RAILWAY_ENVIRONMENT ? process.env.DATABASE_URL_INTERNAL : process.env.DATABASE_URL_PUBLIC);
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set. Add it to .env in the project root.");

  await ensureSchema();
  console.log("Crawling NBA player index (test batch)...");
  const urls = await crawlNbaPlayerIndex({ saveToDb: false });
  const testUrls = urls.slice(0, TEST_LIMIT);
  console.log("Clearing player_scrape_jobs...");
  await query("DELETE FROM player_scrape_jobs");
  console.log(`Inserting ${testUrls.length} test jobs...`);

  const BATCH = 500;
  for (let i = 0; i < testUrls.length; i += BATCH) {
    const batch = testUrls.slice(i, i + BATCH);
    await query(
      "INSERT INTO player_scrape_jobs (player_url) SELECT unnest($1::text[]) ON CONFLICT (player_url) DO NOTHING",
      [batch]
    );
  }
  const count = await query("SELECT COUNT(*) AS n FROM player_scrape_jobs");
  console.log(`Queued ${count.rows[0].n} jobs.\n`);
  console.log(`Running test scrape with ${TEST_LIMIT} players...\n`);
  require("./runPlayerWorkers");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
