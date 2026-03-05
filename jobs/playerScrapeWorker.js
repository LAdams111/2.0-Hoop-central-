const { pool } = require("../db/db");
const { scrapePlayer } = require("../scrapers/ncaa/sportsReferencePlayerScraper");
const browserService = require("../services/browserService");

const DELAY_MS = 500;
const STALE_PROCESSING_MINUTES = 10;

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
 * Claim the next pending job (FOR UPDATE SKIP LOCKED) and mark it processing.
 * @returns {Promise<{ id: number, player_url: string } | null>}
 */
async function claimNextJob() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(
      `SELECT id, player_url FROM player_scrape_jobs
       WHERE status = 'pending'
       ORDER BY id ASC
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
async function markComplete(jobId) {
  const { query } = require("../db/db");
  await query(
    "UPDATE player_scrape_jobs SET status = 'complete', updated_at = NOW() WHERE id = $1",
    [jobId]
  );
}

/**
 * Mark a job failed and record error.
 */
async function markFailed(jobId, error) {
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

async function runWorker() {
  console.log("Player scrape worker started. Processing jobs...");
  await resetStaleProcessing();
  while (true) {
    let job = null;
    try {
      job = await claimNextJob();
      if (!job) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      console.log(`[${job.id}] Processing: ${job.player_url}`);
      await scrapePlayer(job.player_url);
      await markComplete(job.id);
      console.log(`[${job.id}] Complete.`);
    } catch (err) {
      console.error("Worker error:", err);
      if (job) await markFailed(job.id, err);
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
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
    await runWorker();
  } catch (err) {
    console.error("Fatal:", err);
    process.exit(1);
  } finally {
    await browserService.closeBrowser();
  }
}

main();
