const cheerio = require("cheerio");
const browserService = require("../../services/browserService");
const {
  findOrCreatePlayer,
  attachExternalId,
} = require("../../services/playerService");
const { findOrCreateTeam } = require("../../services/teamService");
const { findOrCreateLeague } = require("../../services/leagueService");
const { findOrCreateSeason } = require("../../services/seasonService");
const { findOrCreateTeamSeason } = require("../../services/teamSeasonService");
const {
  createPlayerSeason,
} = require("../../services/playerSeasonService");
const { query } = require("../../db/db");
const { ftInToCm, lbsToKg } = require("../../utils/heightWeight");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse "2018-19" into { year_start: 2018, year_end: 2019 }.
 */
function parseSeasonYear(seasonText) {
  const trimmed = (seasonText || "").trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  const yearEnd = end >= 90 ? 1900 + end : 2000 + end;
  return { year_start: start, year_end: yearEnd };
}

/**
 * Extract Sports Reference player slug from URL.
 * e.g. "https://.../players/zion-williamson-1.html" -> "zion-williamson-1"
 */
function getExternalIdFromUrl(url) {
  const match = (url || "").match(/\/players\/([^/]+)\.html$/);
  return match ? match[1] : null;
}

/**
 * Parse integer from table cell text.
 */
function parseIntOrNull(text) {
  if (text == null || text === "") return null;
  const n = parseInt(String(text).replace(/,/g, ""), 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Parse number and round for integer columns (e.g. per-game stats).
 */
function parseNumOrNull(text) {
  if (text == null || text === "") return null;
  const n = parseFloat(String(text).replace(/,/g, ""));
  return Number.isNaN(n) ? null : Math.round(n);
}

/**
 * Parse float from table cell (for pts_per_g, trb_per_g, ast_per_g).
 */
function parseFloatOrNull(text) {
  if (text == null || text === "") return null;
  const n = parseFloat(String(text).replace(/,/g, ""));
  return Number.isNaN(n) ? null : n;
}

/**
 * Scrape a single NCAA player page from Sports Reference and insert
 * the player and season stats into the canonical database.
 * @param {string} url - Full URL to the player page (e.g. .../cbb/players/zion-williamson-1.html)
 */
async function scrapePlayer(url) {
  console.log("Scraping player page:", url);
  await delay(2000);

  let page;
  let html;

  try {
    page = await browserService.getPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector("#players_per_game tbody tr", {
      timeout: 8000,
    }).catch(() => {});

    html = await page.content();
  } catch (err) {
    console.error("Failed to fetch player page:", err.message);
    return null;
  } finally {
    if (page) await page.close();
  }

  const cleanedHtml = html.replace(/<!--/g, "").replace(/-->/g, "");
  const $ = cheerio.load(cleanedHtml);

  // --- Player name (h1 span or h1) ---
  const fullName =
    $("h1 span").first().text().trim() || $("h1").first().text().trim();
  if (!fullName) {
    console.error("Could not find player name (h1) on page");
    return null;
  }
  console.log("Player name:", fullName);
  const lastSpace = fullName.lastIndexOf(" ");
  const first_name = lastSpace > 0 ? fullName.slice(0, lastSpace).trim() : fullName;
  const last_name = lastSpace > 0 ? fullName.slice(lastSpace + 1).trim() : null;

  const meta = $("#meta");
  let height_cm = null;
  let weight_kg = null;
  if (meta.length) {
    const metaText = meta.text();
    const hwMatch = metaText.match(/(\d+-\d+)\s*,\s*(\d+)\s*lb/i) || metaText.match(/(\d+-\d+)\s*,\s*(\d+)\s*kg/i);
    if (hwMatch) {
      height_cm = ftInToCm(hwMatch[1].trim());
      weight_kg = metaText.match(/\d+\s*kg/i) ? parseInt(hwMatch[2], 10) : lbsToKg(hwMatch[2]);
    }
  }

  // --- Create player ---
  const player = await findOrCreatePlayer({
    full_name: fullName,
    first_name: first_name || null,
    last_name: last_name,
    height_cm: height_cm ?? null,
    weight_kg: weight_kg ?? null,
    position: null,
  });

  // --- Attach external ID ---
  const externalId = getExternalIdFromUrl(url);
  if (externalId) {
    await attachExternalId(player.id, "sports_reference", externalId);
  }

  // --- League ---
  const league = await findOrCreateLeague("NCAA");

  // --- Season stats table: #players_per_game ---
  const table = $("#players_per_game");
  const seasons = [];
  if (!table.length) {
    return { player: { name: fullName }, seasons };
  }

  const rows = table.find("tbody tr").get();
  let seasonsProcessed = 0;

  for (const rowEl of rows) {
    const row = $(rowEl);
    const seasonCell = row.find('th[data-stat="year_id"]').length
      ? row.find('th[data-stat="year_id"]')
      : row.find('td[data-stat="year_id"]').length
        ? row.find('td[data-stat="year_id"]')
        : row.find('th[data-stat="season"]').length
          ? row.find('th[data-stat="season"]')
          : row.find('td[data-stat="season"]');
    const schoolCell = row.find('td[data-stat="team_name_abbr"]').length
      ? row.find('td[data-stat="team_name_abbr"]')
      : row.find('td[data-stat="school_name"]').length
        ? row.find('td[data-stat="school_name"]')
        : row.find('td[data-stat="team_name"]');
    if (!seasonCell.length || !schoolCell.length) continue;

    const seasonText = seasonCell.text().trim();
    const teamName = schoolCell.text().trim();
    if (!seasonText || !teamName) continue;

    const gamesPlayed = parseIntOrNull(row.find('td[data-stat="games"]').text())
      || parseIntOrNull(row.find('td[data-stat="g"]').text());
    const ptsPerG = parseFloatOrNull(row.find('td[data-stat="pts_per_g"]').text());
    const trbPerG = parseFloatOrNull(row.find('td[data-stat="trb_per_g"]').text());
    const astPerG = parseFloatOrNull(row.find('td[data-stat="ast_per_g"]').text());

    seasons.push({
      season: seasonText,
      school: teamName,
      g: gamesPlayed,
      pts_per_g: ptsPerG,
      trb_per_g: trbPerG,
      ast_per_g: astPerG,
    });

    const parsed = parseSeasonYear(seasonText);
    if (!parsed) continue;

    const games = gamesPlayed;
    const points = parseNumOrNull(row.find('td[data-stat="pts_per_g"]').text());
    const rebounds = parseNumOrNull(row.find('td[data-stat="trb_per_g"]').text());
    const assists = parseNumOrNull(row.find('td[data-stat="ast_per_g"]').text());

    const team = await findOrCreateTeam({
      name: teamName,
      city: null,
      abbreviation: null,
      league_id: league.id,
    });

    const season = await findOrCreateSeason({
      league_id: league.id,
      year_start: parsed.year_start,
      year_end: parsed.year_end,
    });

    const teamSeason = await findOrCreateTeamSeason({
      team_id: team.id,
      season_id: season.id,
    });

    const playerSeason = await createPlayerSeason({
      player_id: player.id,
      team_season_id: teamSeason.id,
      jersey_number: null,
      games_played: games,
    });

    await query(
      `INSERT INTO player_season_stats
       (player_season_id, games, points, rebounds, assists)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        playerSeason.id,
        games ?? null,
        points ?? null,
        rebounds ?? null,
        assists ?? null,
      ]
    );

    seasonsProcessed += 1;
  }

  return { player: { name: fullName }, seasons };
}

module.exports = { scrapePlayer };
