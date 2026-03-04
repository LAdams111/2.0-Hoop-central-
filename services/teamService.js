const { query } = require("../db/db");

/**
 * Find a team by name or insert if not found.
 * @param {Object} data
 * @param {string} data.name
 * @param {string} [data.city]
 * @param {string} [data.abbreviation]
 * @param {number} [data.league_id]
 * @returns {Promise<{ id: number, name: string, ... }>}
 */
async function findOrCreateTeam({ name, city, abbreviation, league_id }) {
  const existing = await query(
    "SELECT * FROM teams WHERE name = $1 LIMIT 1",
    [name]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const insert = await query(
    `INSERT INTO teams (name, city, abbreviation, league_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, city ?? null, abbreviation ?? null, league_id ?? null]
  );

  return insert.rows[0];
}

module.exports = { findOrCreateTeam };
