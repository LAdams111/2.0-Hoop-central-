/**
 * Requeue failed jobs that have fewer than 3 attempts so they can be retried.
 * Run: node jobs/requeueFailedJobs.js
 *
 * UPDATE player_scrape_jobs
 * SET status = 'pending'
 * WHERE status = 'failed'
 * AND attempts < 3;
 */

const { query } = require("../db/db");

async function requeueFailedJobs() {
  const res = await query(
    `UPDATE player_scrape_jobs
     SET status = 'pending', updated_at = NOW()
     WHERE status = 'failed'
       AND attempts < 3
     RETURNING id`
  );
  console.log(`Requeued ${res.rowCount} failed job(s) for retry.`);
}

requeueFailedJobs().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
