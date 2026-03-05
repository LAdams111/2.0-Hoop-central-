const db = require("../db/db");

async function ensureSchema() {
  const result = await db.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `);

  const tables = result.rows.map((r) => r.table_name);

  if (!tables.includes("player_scrape_jobs")) {
    console.log("Database tables missing. Running schema...");

    const fs = require("fs");
    const path = require("path");

    const schemaPath = path.join(__dirname, "../db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await db.query(schema);

    console.log("Database schema initialized.");
    return true;
  }
  return false;
}

module.exports = ensureSchema;
