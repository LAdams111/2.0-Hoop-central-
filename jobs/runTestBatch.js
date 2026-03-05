/**
 * Run a limited test batch of player scrape jobs before the full dataset.
 * Loads URLs from data/player_urls.json, inserts first 500 (or TEST_LIMIT), then starts workers.
 *
 * Prerequisite: Save crawler output to data/player_urls.json, e.g.:
 *   node -e "require('./scrapers/ncaa/playerIndexCrawler').crawlPlayerIndex().then(u => require('fs').writeFileSync('data/player_urls.json', JSON.stringify(u, null, 2)))"
 *
 * Run: node jobs/runTestBatch.js
 * Optional: TEST_LIMIT=200 node jobs/runTestBatch.js
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { query } = require("../db/db");

const TEST_LIMIT = parseInt(process.env.TEST_LIMIT, 10) || 500;
const URLS_PATH = path.resolve(__dirname, "../data/player_urls.json");

async function clearAndLoadTestJobs() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  let urls = [];
  try {
    const raw = fs.readFileSync(URLS_PATH, "utf8");
    urls = JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(
        `Missing data/player_urls.json. Run the crawler and save URLs first, e.g.:\n  node -e "require('./scrapers/ncaa/playerIndexCrawler').crawlPlayerIndex().then(u => require('fs').writeFileSync('data/player_urls.json', JSON.stringify(u, null, 2)))"`
      );
    }
    throw err;
  }

  if (!Array.isArray(urls)) {
    throw new Error("data/player_urls.json must be a JSON array of URL strings.");
  }

  const testUrls = urls.slice(0, TEST_LIMIT);
  console.log("Clearing player_scrape_jobs...");
  await query("DELETE FROM player_scrape_jobs");
  console.log(`Inserting ${testUrls.length} test jobs...`);

  const BATCH = 200;
  for (let i = 0; i < testUrls.length; i += BATCH) {
    const batch = testUrls.slice(i, i + BATCH);
    for (const url of batch) {
      await query(
        "INSERT INTO player_scrape_jobs (player_url) VALUES ($1) ON CONFLICT (player_url) DO NOTHING",
        [url]
      );
    }
  }

  const count = await query("SELECT COUNT(*) AS n FROM player_scrape_jobs");
  console.log(`Queued ${count.rows[0].n} jobs.\n`);
}

async function main() {
  await clearAndLoadTestJobs();
  console.log(`Running test scrape with ${TEST_LIMIT} players...\n`);
  require("./runPlayerWorkers");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
