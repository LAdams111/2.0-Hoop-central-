/**
 * Validates the NBA scraping pipeline with a small batch of test jobs.
 * Run: node jobs/testScrapePipeline.js
 *
 * 1. Clears player_scrape_jobs and inserts 10 test NBA player URLs (Basketball Reference).
 * 2. Starts the worker pool from runPlayerWorkers.js.
 * 3. Prints job progress every 5 seconds.
 * 4. Exits when all jobs reach status "complete".
 */

const { query } = require("../db/db");

const TEST_URLS = [
  "https://www.basketball-reference.com/players/j/jamesle01.html",
  "https://www.basketball-reference.com/players/c/curryst01.html",
  "https://www.basketball-reference.com/players/d/duranke01.html",
  "https://www.basketball-reference.com/players/a/antetgi01.html",
  "https://www.basketball-reference.com/players/j/jokicni01.html",
  "https://www.basketball-reference.com/players/d/doncilu01.html",
  "https://www.basketball-reference.com/players/h/hardeja01.html",
  "https://www.basketball-reference.com/players/l/leonaka01.html",
  "https://www.basketball-reference.com/players/d/davisan02.html",
  "https://www.basketball-reference.com/players/t/tatumja01.html",
];

async function setupTestJobs() {
  console.log("Clearing player_scrape_jobs...");
  await query("DELETE FROM player_scrape_jobs");
  console.log("Inserting test player URLs...");
  for (const url of TEST_URLS) {
    await query(
      "INSERT INTO player_scrape_jobs (player_url) VALUES ($1) ON CONFLICT (player_url) DO NOTHING",
      [url]
    );
  }
  const count = await query("SELECT COUNT(*) AS n FROM player_scrape_jobs");
  console.log(`Queued ${count.rows[0].n} test jobs.\n`);
}

async function getProgress() {
  const res = await query(
    "SELECT status, COUNT(*) AS count FROM player_scrape_jobs GROUP BY status"
  );
  const counts = { pending: 0, processing: 0, complete: 0, failed: 0 };
  for (const row of res.rows) {
    counts[row.status] = parseInt(row.count, 10);
  }
  return counts;
}

function checkProgress() {
  getProgress()
    .then((counts) => {
      console.log(
        `pending: ${counts.pending}\nprocessing: ${counts.processing}\ncomplete: ${counts.complete}\nfailed: ${counts.failed}\n`
      );
      const total = counts.pending + counts.processing + counts.complete + counts.failed;
      const done = counts.pending === 0 && counts.processing === 0;
      if (!done) return;
      if (counts.failed > 0) {
        console.error("TEST FAILED: Some jobs failed.");
        process.exit(1);
      }
      if (counts.complete === total && total > 0) {
        console.log("TEST COMPLETE: Scraper pipeline working correctly.");
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error("Progress check error:", err);
      process.exit(1);
    });
}

async function main() {
  await setupTestJobs();
  setInterval(checkProgress, 5000);
  require("./runPlayerWorkers");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
