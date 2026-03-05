/**
 * Validates the NCAA scraping pipeline with a small batch of test jobs.
 * Run: node jobs/testScrapePipeline.js
 *
 * 1. Clears player_scrape_jobs and inserts 10 test player URLs.
 * 2. Starts the worker pool from runPlayerWorkers.js.
 * 3. Prints job progress every 5 seconds.
 * 4. Exits when all jobs reach status "complete".
 */

const { query } = require("../db/db");

const TEST_URLS = [
  "https://www.sports-reference.com/cbb/players/zion-williamson-1.html",
  "https://www.sports-reference.com/cbb/players/stephen-curry-1.html",
  "https://www.sports-reference.com/cbb/players/ja-morant-1.html",
  "https://www.sports-reference.com/cbb/players/kevin-durant-1.html",
  "https://www.sports-reference.com/cbb/players/jayson-tatum-1.html",
  "https://www.sports-reference.com/cbb/players/luka-doncic-1.html",
  "https://www.sports-reference.com/cbb/players/anthony-davis-1.html",
  "https://www.sports-reference.com/cbb/players/jimmy-butler-1.html",
  "https://www.sports-reference.com/cbb/players/draymond-green-1.html",
  "https://www.sports-reference.com/cbb/players/kyrie-irving-1.html",
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
