const { query } = require("../db/db");

/**
 * Find a player by sr_player_id (or full_name if no sr_player_id), or insert if not found.
 * Uses ON CONFLICT (sr_player_id) DO NOTHING to prevent duplicates.
 * @param {Object} playerData
 * @param {string} playerData.full_name
 * @param {string} [playerData.sr_player_id] - Sports Reference player ID (e.g. "zion-williamson-1")
 * @param {string} [playerData.first_name]
 * @param {string} [playerData.last_name]
 * @param {number} [playerData.height_cm]
 * @param {number} [playerData.weight_kg]
 * @param {string} [playerData.position]
 * @returns {Promise<{ id: number, full_name: string, ... }>}
 */
async function findOrCreatePlayer(playerData) {
  const { full_name, sr_player_id, first_name, last_name, height_cm, weight_kg, position } =
    playerData;

  if (sr_player_id) {
    const existing = await query(
      "SELECT * FROM players WHERE sr_player_id = $1 LIMIT 1",
      [sr_player_id]
    );
    if (existing.rows.length > 0) return existing.rows[0];
  }

  const existingByName = await query(
    "SELECT * FROM players WHERE full_name = $1 LIMIT 1",
    [full_name]
  );
  if (existingByName.rows.length > 0) return existingByName.rows[0];

  const insert = await query(
    `INSERT INTO players (full_name, first_name, last_name, height_cm, weight_kg, position, sr_player_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (sr_player_id) DO NOTHING
     RETURNING *`,
    [full_name, first_name ?? null, last_name ?? null, height_cm ?? null, weight_kg ?? null, position ?? null, sr_player_id ?? null]
  );

  if (insert.rows.length > 0) return insert.rows[0];
  if (sr_player_id) {
    const again = await query("SELECT * FROM players WHERE sr_player_id = $1 LIMIT 1", [sr_player_id]);
    if (again.rows.length > 0) return again.rows[0];
  }
  throw new Error("findOrCreatePlayer: insert failed and could not find player");
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
