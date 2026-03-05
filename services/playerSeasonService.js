const { query } = require("../db/db");

/**
 * Create a player_season record (player on a team for a season).
 * Uses ON CONFLICT when the unique constraint exists; otherwise select-then-insert.
 * @param {Object} data
 * @param {number} data.player_id
 * @param {number} data.team_season_id
 * @param {number} [data.jersey_number]
 * @param {number} [data.games_played]
 * @returns {Promise<{ id: number, player_id: number, team_season_id: number, jersey_number: number | null, games_played: number | null }>}
 */
async function createPlayerSeason({
  player_id,
  team_season_id,
  jersey_number,
  games_played,
}) {
  const existing = await query(
    "SELECT * FROM player_seasons WHERE player_id = $1 AND team_season_id = $2 LIMIT 1",
    [player_id, team_season_id]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const result = await query(
    `INSERT INTO player_seasons (player_id, team_season_id, jersey_number, games_played)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      player_id,
      team_season_id,
      jersey_number ?? null,
      games_played ?? null,
    ]
  );

  return result.rows[0];
}

module.exports = { createPlayerSeason };
