/**
 * Run the player scrape worker pool. Processes the full player_scrape_jobs queue
 * (NBA players from Basketball Reference) until no pending jobs remain.
 *
 * Usage:
 *   1. Generate jobs: node jobs/generatePlayerJobs.js
 *   2. Check queue:   node jobs/checkQueueSize.js
 *   3. Start workers: node jobs/runPlayerWorkers.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const browserService = require("../services/browserService");
const { processJobs, resetStaleProcessing } = require("./playerScrapeWorker");

const WORKER_COUNT = 3;

async function main() {
  const DATABASE_URL =
    process.env.DATABASE_URL ||
    (process.env.RAILWAY_ENVIRONMENT
      ? process.env.DATABASE_URL_INTERNAL
      : process.env.DATABASE_URL_PUBLIC);
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env in the project root.");
  }

  let running = true;
  const shutdown = async () => {
    if (!running) return;
    running = false;
    console.log("Shutting down worker pool...");
    await browserService.closeBrowser();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(`Starting ${WORKER_COUNT} concurrent player scrape workers...`);
  await resetStaleProcessing();

  const workers = [];
  for (let i = 0; i < WORKER_COUNT; i++) {
    workers.push(
      (async () => {
        try {
          await processJobs(i);
        } catch (err) {
          console.error(`Worker ${i} crashed:`, err);
        }
      })()
    );
  }
  await Promise.all(workers);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
