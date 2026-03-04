const { query } = require("../db/db");

/**
 * Find a player by full_name or insert if not found.
 * @param {Object} playerData
 * @param {string} playerData.full_name
 * @param {string} [playerData.first_name]
 * @param {string} [playerData.last_name]
 * @param {number} [playerData.height_cm]
 * @param {number} [playerData.weight_kg]
 * @param {string} [playerData.position]
 * @returns {Promise<{ id: number, full_name: string, ... }>}
 */
async function findOrCreatePlayer(playerData) {
  const { full_name, first_name, last_name, height_cm, weight_kg, position } =
    playerData;

  const existing = await query(
    "SELECT * FROM players WHERE full_name = $1 LIMIT 1",
    [full_name]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const insert = await query(
    `INSERT INTO players (full_name, first_name, last_name, height_cm, weight_kg, position)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [full_name, first_name ?? null, last_name ?? null, height_cm ?? null, weight_kg ?? null, position ?? null]
  );

  return insert.rows[0];
}

/**
 * Attach an external id to a player. No-op if (source, external_id) already exists.
 * @param {number} player_id
 * @param {string} source
 * @param {string} external_id
 * @returns {Promise<{ id: number, player_id: number, source: string, external_id: string } | null>} The row if inserted, null if already existed
 */
async function attachExternalId(player_id, source, external_id) {
  const existing = await query(
    "SELECT * FROM player_external_ids WHERE source = $1 AND external_id = $2 LIMIT 1",
    [source, external_id]
  );

  if (existing.rows.length > 0) {
    return null;
  }

  const insert = await query(
    `INSERT INTO player_external_ids (player_id, source, external_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [player_id, source, external_id]
  );

  return insert.rows[0];
}

module.exports = { findOrCreatePlayer, attachExternalId };
