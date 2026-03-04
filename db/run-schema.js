/**
 * Run schema.sql against DATABASE_URL (e.g. Railway).
 * Usage: node db/run-schema.js
 */
require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runSchema() {
  const sqlPath = path.join(__dirname, "schema.sql");
  let sql = fs.readFileSync(sqlPath, "utf8");
  // Remove single-line comments
  sql = sql.replace(/--[^\n]*/g, "");
  // Split into statements (semicolon at end of line or followed by newline)
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const client = await pool.connect();
  try {
    for (const statement of statements) {
      await client.query(statement + ";");
    }
    console.log("Schema applied successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

runSchema().catch((err) => {
  console.error("Schema failed:", err.message);
  process.exit(1);
});
