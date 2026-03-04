const { query } = require("../db/db");

/**
 * Find a season by league_id + year_start or insert if not found.
 * @param {Object} data
 * @param {number} data.league_id
 * @param {number} data.year_start
 * @param {number} data.year_end
 * @returns {Promise<{ id: number, league_id: number, year_start: number, year_end: number }>}
 */
async function findOrCreateSeason({ league_id, year_start, year_end }) {
  const existing = await query(
    "SELECT * FROM seasons WHERE league_id = $1 AND year_start = $2 LIMIT 1",
    [league_id, year_start]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const insert = await query(
    `INSERT INTO seasons (league_id, year_start, year_end)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [league_id, year_start, year_end]
  );

  return insert.rows[0];
}

module.exports = { findOrCreateSeason };
