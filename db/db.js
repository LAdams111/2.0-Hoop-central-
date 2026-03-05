require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });
const { Pool } = require("pg");

// Use DATABASE_URL if set; otherwise public (local) or internal (Railway)
const connectionString =
  process.env.DATABASE_URL ||
  (process.env.RAILWAY_ENVIRONMENT
    ? process.env.DATABASE_URL_INTERNAL
    : process.env.DATABASE_URL_PUBLIC);

const pool = new Pool({
  connectionString,
});

/**
 * Execute a parameterized query against the database.
 * @param {string} text - SQL query with $1, $2, ... placeholders
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { query, pool };
