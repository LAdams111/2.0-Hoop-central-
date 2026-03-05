/**
 * Print player_scrape_jobs queue size and counts by status.
 *
 * Usage:
 *   node jobs/checkQueueSize.js
 *
 * Example output:
 *   Total jobs: 185000
 *   pending: 185000
 *   processing: 0
 *   complete: 0
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const { query } = require("../db/db");

async function main() {
  const totalRes = await query("SELECT COUNT(*)::int AS n FROM player_scrape_jobs");
  const total = totalRes.rows[0]?.n ?? 0;
  console.log("Total jobs:", total);

  const statusRes = await query(
    "SELECT status, COUNT(*)::int AS count FROM player_scrape_jobs GROUP BY status ORDER BY status"
  );
  for (const row of statusRes.rows) {
    console.log(`${row.status}: ${row.count}`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
