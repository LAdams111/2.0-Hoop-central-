const { query } = require("../db/db");

/**
 * Find a league by name or insert if not found.
 * @param {string} name
 * @returns {Promise<{ id: number, name: string, country: string | null }>}
 */
async function findOrCreateLeague(name) {
  const existing = await query(
    "SELECT * FROM leagues WHERE name = $1 LIMIT 1",
    [name]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const insert = await query(
    "INSERT INTO leagues (name) VALUES ($1) RETURNING *",
    [name]
  );

  return insert.rows[0];
}

module.exports = { findOrCreateLeague };
