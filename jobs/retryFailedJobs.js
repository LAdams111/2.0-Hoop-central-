/**
 * Reset all failed jobs to pending so workers can retry them.
 * Run after the main scrape finishes to retry players that were skipped (e.g. due to 429).
 *
 * Usage: node jobs/retryFailedJobs.js
 * Then: node jobs/runPlayerWorkers.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const { query } = require("../db/db");

async function retryFailedJobs() {
  const select = await query(
    "SELECT id, player_url FROM player_scrape_jobs WHERE status = 'failed'"
  );
  const count = select.rowCount;

  if (count === 0) {
    console.log("No failed jobs to retry.");
    return;
  }

  await query(
    `UPDATE player_scrape_jobs
     SET status = 'pending', updated_at = NOW()
     WHERE status = 'failed'`
  );

  console.log(`Reset ${count} failed job(s) to pending. Run workers to retry them.`);
}

retryFailedJobs().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
