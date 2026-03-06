const express = require("express");
const router = express.Router();
const { query } = require("../db/db");
const { cmToFtIn, kgToLbs } = require("../utils/heightWeight");

function mapPlayerRow(row) {
  const height = row.height_cm != null ? cmToFtIn(row.height_cm) : null;
  const weight = row.weight_kg != null ? kgToLbs(row.weight_kg) : null;
  const heightStr = height ? `${height.replace("-", "'")}"` : null;
  return {
    id: row.id,
    name: row.full_name,
    full_name: row.full_name,
    first_name: row.first_name,
    last_name: row.last_name,
    position: row.position ?? null,
    team: row.team_name ?? null,
    height: heightStr,
    weight: weight != null ? `${weight} lbs` : null,
    jerseyNumber: row.jersey_number ?? null,
    headshotUrl: row.headshot_url ?? null,
    bio: row.bio ?? null,
    profileViews: row.profile_views ?? 0,
    birth_date: row.birth_date,
    birth_place: row.birth_place,
    college: row.college,
    draft_year: row.draft_year,
    draft_round: row.draft_round,
    draft_pick: row.draft_pick,
    sr_player_id: row.sr_player_id,
  };
}

router.get("/players", async (req, res) => {
  try {
    const { search, position, limit = 50, ids } = req.query;
    let sql = "SELECT * FROM players p WHERE 1=1";
    const params = [];
    let n = 1;
    if (search) {
      sql += ` AND (p.full_name ILIKE $${n} OR p.first_name ILIKE $${n} OR p.last_name ILIKE $${n})`;
      params.push(`%${search}%`);
      n++;
    }
    if (position) {
      sql += ` AND p.position = $${n}`;
      params.push(position);
      n++;
    }
    if (ids) {
      const idList = String(ids).split(",").map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id));
      if (idList.length > 0) {
        sql += ` AND p.id = ANY($${n})`;
        params.push(idList);
        n++;
      }
    }
    sql += ` ORDER BY p.id LIMIT $${n}`;
    params.push(Math.min(parseInt(String(limit), 10) || 50, 100));

    const result = await query(sql, params);
    const players = result.rows.map((r) => mapPlayerRow({ ...r, team_name: null, jersey_number: null }));
    res.json({ players });
  } catch (e) {
    console.error("GET /api/players", e);
    res.status(500).json({ message: e.message || "Server error" });
  }
});

router.get("/players/birth-years", async (req, res) => {
  try {
    const result = await query(
      `SELECT EXTRACT(YEAR FROM birth_date)::int AS year, COUNT(*)::int AS count
       FROM players WHERE birth_date IS NOT NULL GROUP BY 1 ORDER BY 1 DESC LIMIT 50`
    );
    res.json(result.rows.map((r) => ({ year: r.year, count: r.count })));
  } catch (e) {
    console.error("GET /api/players/birth-years", e);
    res.status(500).json({ message: e.message || "Server error" });
  }
});

router.get("/players/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    let result = await query("SELECT * FROM players WHERE id = $1 LIMIT 1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Player not found" });
    const row = result.rows[0];
    const player = mapPlayerRow({ ...row, team_name: null, jersey_number: null });

    let stats = [];
    try {
      const statsResult = await query(
        `SELECT pss.*, t.name AS team, s.year_start, s.year_end
         FROM player_season_stats pss
         JOIN player_seasons ps ON ps.id = pss.player_season_id
         JOIN team_seasons ts ON ts.id = ps.team_season_id
         JOIN teams t ON t.id = ts.team_id
         JOIN seasons s ON s.id = ts.season_id
         WHERE ps.player_id = $1
         ORDER BY s.year_start DESC`,
        [id]
      );
      stats = statsResult.rows.map((r) => ({
        id: r.id,
        playerId: id,
        season: `${r.year_start}-${String(r.year_end).slice(-2)}`,
        team: r.team,
        league: "NBA",
        gamesPlayed: r.games ?? 0,
        ppg: r.points != null && r.games > 0 ? Math.round((r.points / r.games) * 10) / 10 : 0,
        rpg: r.rebounds != null && r.games > 0 ? Math.round((r.rebounds / r.games) * 10) / 10 : 0,
        apg: r.assists != null && r.games > 0 ? Math.round((r.assists / r.games) * 10) / 10 : 0,
        spg: r.steals != null && r.games > 0 ? Math.round((r.steals / r.games) * 10) / 10 : 0,
        bpg: r.blocks != null && r.games > 0 ? Math.round((r.blocks / r.games) * 10) / 10 : 0,
        fg_pct: r.fg_pct ?? 0,
      }));
    } catch (_) {}
    player.stats = stats;
    res.json(player);
  } catch (e) {
    console.error("GET /api/players/:id", e);
    res.status(500).json({ message: e.message || "Server error" });
  }
});

router.post("/players/:id/view", (req, res) => {
  res.status(204).end();
});

router.get("/leagues", async (req, res) => {
  try {
    const result = await query("SELECT id, name, country FROM leagues ORDER BY name");
    res.json(result.rows.map((r) => ({ id: r.id, name: r.name, type: "League", region: r.country })));
  } catch (e) {
    if (e.code === "42P01") {
      return res.json([{ id: 1, name: "NBA", type: "Professional" }, { id: 2, name: "NBA G League", type: "Professional" }, { id: 3, name: "NCAA Division I", type: "Collegiate" }]);
    }
    console.error("GET /api/leagues", e);
    res.status(500).json({ message: e.message || "Server error" });
  }
});

router.get("/leagues/:league/teams", async (req, res) => {
  try {
    const leagueName = decodeURIComponent(req.params.league);
    const result = await query(
      `SELECT t.id, t.name, t.abbreviation FROM teams t
       JOIN leagues l ON l.id = t.league_id WHERE l.name = $1 ORDER BY t.name`,
      [leagueName]
    );
    const season = "2025-26";
    res.json({ teams: result.rows.map((r) => ({ id: r.id, name: r.name, abbreviation: r.abbreviation, season })) });
  } catch (e) {
    if (e.code === "42P01") {
      return res.json({ teams: [] });
    }
    console.error("GET /api/leagues/:league/teams", e);
    res.status(500).json({ message: e.message || "Server error" });
  }
});

router.get("/teams/:team/roster/:season", async (req, res) => {
  try {
    const teamName = decodeURIComponent(req.params.team);
    const seasonSlug = req.params.season;
    const [y1, y2] = seasonSlug.split("-").map((n) => parseInt(n, 10));
    const yearStart = y1;
    const yearEnd = y2 != null && y2 < 100 ? 2000 + y2 : y2;

    const result = await query(
      `SELECT p.*, ps.jersey_number, t.name AS team_name
       FROM players p
       JOIN player_seasons ps ON ps.player_id = p.id
       JOIN team_seasons ts ON ts.id = ps.team_season_id
       JOIN teams t ON t.id = ts.team_id
       JOIN seasons s ON s.id = ts.season_id
       WHERE t.name = $1 AND s.year_start = $2 AND s.year_end = $3`,
      [teamName, yearStart, yearEnd]
    );
    const players = result.rows.map(mapPlayerRow);
    res.json({ players });
  } catch (e) {
    if (e.code === "42P01") {
      return res.json({ players: [] });
    }
    console.error("GET /api/teams/:team/roster/:season", e);
    res.status(500).json({ message: e.message || "Server error" });
  }
});

router.get("/scraper/status", (req, res) => {
  res.json({ running: false, message: "" });
});

router.post("/scraper/nba", (req, res) => {
  res.status(202).json({ message: "Accepted" });
});

router.get("/site-settings/featured_players", (req, res) => {
  res.json([]);
});

router.post("/admin/login", (req, res) => {
  res.status(401).json({ message: "Unauthorized" });
});

module.exports = router;
