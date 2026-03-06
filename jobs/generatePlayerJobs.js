/**
 * Generate all NBA player scrape jobs from Basketball Reference.
 * Crawls /players/a/ through /players/z/, extracts player URLs, inserts into player_scrape_jobs.
 *
 * Usage: node jobs/generatePlayerJobs.js
 * Then:  node jobs/checkQueueSize.js
 * Then:  node jobs/runPlayerWorkers.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const ensureSchema = require("../utils/ensureSchema");
const { crawlNbaPlayerIndex } = require("../scrapers/nba/nbaPlayerIndexCrawler");

async function main() {
  const DATABASE_URL =
    process.env.DATABASE_URL ||
    (process.env.RAILWAY_ENVIRONMENT ? process.env.DATABASE_URL_INTERNAL : process.env.DATABASE_URL_PUBLIC);
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set. Add it to .env in the project root.");

  await ensureSchema();
  console.log("Crawling Basketball Reference NBA player index (a–z)...");
  const urls = await crawlNbaPlayerIndex({ saveToDb: true });
  console.log("Done. Total player URLs:", urls.length);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
