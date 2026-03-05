const { pool } = require("../db/db");
const { scrapePlayer } = require("../scrapers/ncaa/sportsReferencePlayerScraper");
const browserService = require("../services/browserService");

const DELAY_MS = 500;
const EMPTY_QUEUE_SLEEP_MS = 2000;
const STALE_PROCESSING_MINUTES = 10;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reset jobs stuck in 'processing' (e.g. after crash) so they can be retried.
 */
async function resetStaleProcessing() {
  const { query } = require("../db/db");
  const res = await query(
    `UPDATE player_scrape_jobs
     SET status = 'pending', updated_at = NOW()
     WHERE status = 'processing'
       AND updated_at < NOW() - ($1 || ' minutes')::interval
     RETURNING id`,
    [STALE_PROCESSING_MINUTES]
  );
  if (res.rowCount > 0) console.log(`Reset ${res.rowCount} stale job(s) to pending.`);
}

/**
 * Fetch next pending job using row locking so multiple workers don't take the same job.
 * Marks the job as 'processing' in the same transaction.
 * @returns {Promise<{ id: number, player_url: string } | null>}
 */
async function getNextPendingJob() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(
      `SELECT *
       FROM player_scrape_jobs
       WHERE status = 'pending'
       ORDER BY id
       LIMIT 1
       FOR UPDATE SKIP LOCKED`
    );
    const job = res.rows[0] || null;
    if (!job) {
      await client.query("COMMIT");
      return null;
    }
    await client.query(
      "UPDATE player_scrape_jobs SET status = 'processing', updated_at = NOW() WHERE id = $1",
      [job.id]
    );
    await client.query("COMMIT");
    return { id: job.id, player_url: job.player_url };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Mark a job complete.
 */
async function markJobComplete(jobId) {
  const { query } = require("../db/db");
  await query(
    "UPDATE player_scrape_jobs SET status = 'complete', updated_at = NOW() WHERE id = $1",
    [jobId]
  );
}

/**
 * Mark a job failed and record error.
 */
async function markJobFailed(jobId, error) {
  const { query } = require("../db/db");
  const msg = error && (error.message || String(error));
  await query(
    `UPDATE player_scrape_jobs SET
       status = 'failed',
       attempts = attempts + 1,
       last_error = $2,
       updated_at = NOW()
     WHERE id = $1`,
    [jobId, msg]
  );
}

/**
 * Single-worker loop: continuously fetch jobs, scrape, update status.
 * Safe to run multiple times concurrently (pool).
 * @param {number} [workerId] - Optional id for log prefix (e.g. worker 0..7).
 */
async function processJobs(workerId = 0) {
  const prefix = workerId != null ? `[w${workerId}]` : "";
  while (true) {
    let job = null;
    try {
      job = await getNextPendingJob();
      if (!job) {
        await sleep(EMPTY_QUEUE_SLEEP_MS);
        continue;
      }
      console.log(`${prefix} [${job.id}] Processing: ${job.player_url}`);
      await scrapePlayer(job.player_url);
      await markJobComplete(job.id);
      console.log(`${prefix} [${job.id}] Complete.`);
    } catch (err) {
      console.error(`${prefix} Worker error:`, err);
      if (job) await markJobFailed(job.id, err);
    }
    await sleep(DELAY_MS);
  }
}

async function main() {
  let running = true;
  const shutdown = async () => {
    if (!running) return;
    running = false;
    console.log("Shutting down...");
    await browserService.closeBrowser();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  try {
    await resetStaleProcessing();
    await processJobs();
  } catch (err) {
    console.error("Fatal:", err);
    process.exit(1);
  } finally {
    await browserService.closeBrowser();
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = { processJobs, resetStaleProcessing, sleep, getNextPendingJob, markJobComplete, markJobFailed };
}
