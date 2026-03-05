/**
 * Run a limited test batch of player scrape jobs before the full dataset.
 * Loads URLs from data/player_urls.json (runs crawler first if file is missing).
 *
 * Run: node jobs/runTestBatch.js
 * Optional: TEST_LIMIT=200 node jobs/runTestBatch.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const { query } = require("../db/db");

const TEST_LIMIT = parseInt(process.env.TEST_LIMIT, 10) || 500;
const DATA_DIR = path.resolve(__dirname, "../data");
const URLS_PATH = path.join(DATA_DIR, "player_urls.json");

async function clearAndLoadTestJobs() {
  const DATABASE_URL =
    process.env.DATABASE_URL ||
    (process.env.RAILWAY_ENVIRONMENT
      ? process.env.DATABASE_URL_INTERNAL
      : process.env.DATABASE_URL_PUBLIC);
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env in the project root.");
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(URLS_PATH)) {
    console.log("Player URL list missing. Running crawler...");
    const { crawlAndSavePlayerUrls } = require("../scrapers/ncaa/playerIndexCrawler");
    await crawlAndSavePlayerUrls();
  }

  const raw = fs.readFileSync(URLS_PATH, "utf8");
  let urls;
  try {
    urls = JSON.parse(raw);
  } catch (err) {
    throw new Error("data/player_urls.json is not valid JSON: " + err.message);
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
