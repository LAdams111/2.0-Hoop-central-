const { query } = require("../db/db");

/**
 * Find a team_season by team_id + season_id or insert if not found.
 * @param {Object} data
 * @param {number} data.team_id
 * @param {number} data.season_id
 * @returns {Promise<{ id: number, team_id: number, season_id: number, wins: number | null, losses: number | null }>}
 */
async function findOrCreateTeamSeason({ team_id, season_id }) {
  const existing = await query(
    "SELECT * FROM team_seasons WHERE team_id = $1 AND season_id = $2 LIMIT 1",
    [team_id, season_id]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const insert = await query(
    `INSERT INTO team_seasons (team_id, season_id)
     VALUES ($1, $2)
     RETURNING *`,
    [team_id, season_id]
  );

  return insert.rows[0];
}

module.exports = { findOrCreateTeamSeason };
