/**
 * Generate all NCAA player scrape jobs (~180k+) from Sports Reference.
 *
 * Crawls the player index for each letter (a–z), extracts player profile URLs
 * matching /cbb/players/{player-slug}.html, and inserts them into player_scrape_jobs.
 * Uses ON CONFLICT (player_url) DO NOTHING so the generator can be run multiple
 * times safely.
 *
 * Usage:
 *   node jobs/generatePlayerJobs.js
 *
 * Then verify: node jobs/checkQueueSize.js
 * Then scrape:  node jobs/runPlayerWorkers.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const ensureSchema = require("../utils/ensureSchema");
const { crawlPlayerIndex } = require("../scrapers/ncaa/playerIndexCrawler");

async function main() {
  const DATABASE_URL =
    process.env.DATABASE_URL ||
    (process.env.RAILWAY_ENVIRONMENT
      ? process.env.DATABASE_URL_INTERNAL
      : process.env.DATABASE_URL_PUBLIC);
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env in the project root.");
  }

  await ensureSchema();

  console.log("Crawling Sports Reference NCAA player index (a–z)...");
  const urls = await crawlPlayerIndex({ saveToDb: true });
  console.log("Done. Total player URLs discovered:", urls.length);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
