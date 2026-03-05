/**
 * Live terminal progress dashboard for the NCAA scraping pipeline.
 * Run: node jobs/monitorScrapeProgress.js
 *
 * Workers run separately: node jobs/runPlayerWorkers.js
 * Dashboard updates every 5 seconds. Exits when scrape is complete.
 */

require("dotenv").config();
const { query } = require("../db/db");

const INTERVAL_MS = 5000;
const WORKER_COUNT = parseInt(process.env.WORKER_COUNT, 10) || 8;

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

function formatEta(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds === Infinity) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "< 1m";
}

async function getStatusCounts() {
  const res = await query(
    "SELECT status, COUNT(*)::int AS count FROM player_scrape_jobs GROUP BY status"
  );
  const counts = { pending: 0, processing: 0, complete: 0, failed: 0 };
  for (const row of res.rows) {
    counts[row.status] = row.count;
  }
  return counts;
}

async function run() {
  let prevComplete = null;
  let prevTime = null;

  const tick = async () => {
    const counts = await getStatusCounts();
    const total_jobs =
      counts.pending + counts.processing + counts.complete + counts.failed;
    const completed_jobs = counts.complete;
    const pending_jobs = counts.pending;
    const processing_jobs = counts.processing;
    const failed_jobs = counts.failed;

    const now = Date.now();
    let players_per_second = 0;
    if (prevComplete != null && prevTime != null) {
      const elapsed = (now - prevTime) / 1000;
      if (elapsed > 0) {
        players_per_second = (completed_jobs - prevComplete) / elapsed;
      }
    }
    prevComplete = completed_jobs;
    prevTime = now;

    const remaining_jobs = pending_jobs + processing_jobs;
    const eta_seconds =
      players_per_second > 0 ? remaining_jobs / players_per_second : null;
    const etaFormatted = eta_seconds != null ? formatEta(eta_seconds) : "—";

    clearScreen();
    console.log("---");
    console.log("## NCAA PLAYER SCRAPER");
    console.log("---");
    console.log("");
    console.log(`Total Jobs:        ${total_jobs.toLocaleString()}`);
    console.log(`Completed:         ${completed_jobs.toLocaleString()}`);
    console.log(`Pending:           ${pending_jobs.toLocaleString()}`);
    console.log(`Processing:        ${processing_jobs.toLocaleString()}`);
    console.log(`Failed:            ${failed_jobs.toLocaleString()}`);
    console.log("");
    console.log(`Workers Running:   ${WORKER_COUNT}`);
    console.log(
      `Speed:             ${players_per_second.toFixed(1)} players/sec`
    );
    console.log(`ETA:               ${etaFormatted}`);
    console.log("---");
    console.log("");

    const done = total_jobs > 0 && completed_jobs + failed_jobs >= total_jobs;
    if (done) {
      console.log("SCRAPE COMPLETE");
      process.exit(0);
    }
  };

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  setInterval(tick, INTERVAL_MS);
  await tick();
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
