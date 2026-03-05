const { pool } = require("../db/db");
const { scrapePlayer } = require("../scrapers/ncaa/sportsReferencePlayerScraper");
const browserService = require("../services/browserService");

/** Delay between requests (1.5–2.5s with jitter) to avoid rate limits. */
const EMPTY_QUEUE_SLEEP_MS = 2000;
const STALE_PROCESSING_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const PROGRESS_LOG_EVERY_JOBS = 20;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Random delay 2–4 seconds so requests are not predictable. */
function randomDelay() {
  return 2000 + Math.random() * 2000;
}

/** Delay between requests to avoid rate limits. */
function rateLimitDelay() {
  return sleep(randomDelay());
}

/**
 * Extract Sports Reference player ID from URL.
 * e.g. "https://.../cbb/players/zion-williamson-1.html" -> "zion-williamson-1"
 */
function extractPlayerId(url) {
  if (!url || typeof url !== "string") return null;
  const segment = url.split("/").pop();
  return segment ? segment.replace(".html", "") : null;
}

/**
 * Check if a player already exists in the database (cache check).
 * @param {string} sr_player_id - Sports Reference player ID
 * @returns {Promise<boolean>}
 */
async function playerExists(sr_player_id) {
  if (!sr_player_id) return false;
  const { query } = require("../db/db");
  const res = await query(
    "SELECT id FROM players WHERE sr_player_id = $1 LIMIT 1",
    [sr_player_id]
  );
  return res.rowCount > 0;
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
    return { id: job.id, player_url: job.player_url, attempts: parseInt(job.attempts, 10) || 0 };
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
 * Mark a job failed and record error. If attempts < MAX_ATTEMPTS, set status back to 'pending' for retry.
 */
async function markJobFailed(jobId, error, currentAttempts = 0) {
  const { query } = require("../db/db");
  const msg = error && (error.message || String(error));
  const nextAttempts = currentAttempts + 1;
  const status = nextAttempts < MAX_ATTEMPTS ? "pending" : "failed";
  await query(
    `UPDATE player_scrape_jobs SET
       status = $3,
       attempts = attempts + 1,
       last_error = $2,
       updated_at = NOW()
     WHERE id = $1`,
    [jobId, msg, status]
  );
}

/**
 * Mark a job as failed (status = 'failed') so it can be retried later via retryFailedJobs.js.
 * Use for 429 skips and other cases where we do not want automatic requeue.
 */
async function markJobFailedPermanent(jobId, error) {
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
 * Log job counts by status to console (for progress monitoring).
 */
async function logProgressCounts() {
  const { query } = require("../db/db");
  const res = await query(
    "SELECT status, COUNT(*) AS count FROM player_scrape_jobs GROUP BY status"
  );
  const parts = res.rows.map((r) => `${r.status}: ${r.count}`);
  console.log("[progress]", parts.join(", "));
}

/**
 * Single-worker loop: continuously fetch jobs, scrape, update status.
 * Safe to run multiple times concurrently (pool).
 * @param {number} [workerId] - Optional id for log prefix (e.g. worker 0..7).
 */
async function processJobs(workerId = 0) {
  const prefix = workerId != null ? `[w${workerId}]` : "";
  let jobsProcessed = 0;

  await sleep(Math.random() * 5000);

  while (true) {
    try {
      let job = null;
      try {
        job = await getNextPendingJob();
        if (!job) {
          await sleep(EMPTY_QUEUE_SLEEP_MS);
          continue;
        }
        console.log(`${prefix} [${job.id}] Processing: ${job.player_url}`);
        const sr_player_id = extractPlayerId(job.player_url);
        if (sr_player_id) {
          const exists = await playerExists(sr_player_id);
          if (exists) {
            await markJobComplete(job.id);
            jobsProcessed += 1;
            console.log(`${prefix} [${job.id}] Skipping already scraped player: ${sr_player_id}`);
            if (jobsProcessed % PROGRESS_LOG_EVERY_JOBS === 0) {
              await logProgressCounts();
            }
            await rateLimitDelay();
            continue;
          }
        }
        await scrapePlayer(job.player_url);
        await markJobComplete(job.id);
        jobsProcessed += 1;
        console.log(`${prefix} [${job.id}] Complete. Processed player: ${job.player_url}`);
        if (jobsProcessed % PROGRESS_LOG_EVERY_JOBS === 0) {
          await logProgressCounts();
        }
      } catch (err) {
        console.error(`${prefix} Worker error:`, err);
        if (job) {
          if (/Skipped due to repeated 429/i.test(err && err.message)) {
            await markJobFailedPermanent(job.id, err);
          } else {
            await markJobFailed(job.id, err, job.attempts);
          }
        }
      }
      await rateLimitDelay();
    } catch (err) {
      console.error(`${prefix} Worker crashed:`, err);
    }
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
