/**
 * Scrape a single NBA player page from Basketball Reference.
 * Extracts player bio (name, position, height, weight, birth date, college, draft)
 * and per-game season stats from table #per_game.
 * Includes request delay (1–2s), retry logic, and timeout handling.
 */

const cheerio = require("cheerio");
const browserService = require("../../services/browserService");
const { findOrCreatePlayer, attachExternalId } = require("../../services/playerService");
const { findOrCreateTeam } = require("../../services/teamService");
const { findOrCreateLeague } = require("../../services/leagueService");
const { findOrCreateSeason } = require("../../services/seasonService");
const { findOrCreateTeamSeason } = require("../../services/teamSeasonService");
const { createPlayerSeason } = require("../../services/playerSeasonService");
const { query } = require("../../db/db");
const { ftInToCm, lbsToKg } = require("../../utils/heightWeight");

const REQUEST_DELAY_MS = 1000 + Math.random() * 1000;
const PAGE_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Extract Basketball Reference player ID from URL: .../players/j/jamesle01.html -> jamesle01 */
function getPlayerIdFromUrl(url) {
  const m = (url || "").match(/\/players\/[a-z]\/([a-z0-9]+)\.html$/);
  return m ? m[1] : null;
}

function parseIntOrNull(text) {
  if (text == null || text === "") return null;
  const n = parseInt(String(text).replace(/,/g, ""), 10);
  return Number.isNaN(n) ? null : n;
}

function parseFloatOrNull(text) {
  if (text == null || text === "") return null;
  const n = parseFloat(String(text).replace(/,/g, "").replace(/^\./, "0."));
  return Number.isNaN(n) ? null : n;
}

/** Parse "2003-04" -> { year_start: 2003, year_end: 2004 } */
function parseSeasonYear(seasonText) {
  const m = (seasonText || "").trim().match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  return { year_start: parseInt(m[1], 10), year_end: parseInt(m[2], 10) };
}

/** Parse "Born: December 30, 1984 in Akron, Ohio" from meta text */
function parseBorn(metaText) {
  if (!metaText) return { birth_date: null, birth_place: null };
  const match = metaText.match(/Born:\s*[^\d]*(\w+)\s+(\d{1,2}),?\s*(\d{4})(?:\s+in\s+(.+?))?(?:\s+us)?$/im);
  if (!match) return { birth_date: null, birth_place: null };
  const months = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
  const month = months[match[1].toLowerCase()];
  if (!month) return { birth_date: null, birth_place: match[4]?.trim() || null };
  const day = String(parseInt(match[2], 10)).padStart(2, "0");
  const year = match[3];
  const birth_date = `${year}-${String(month).padStart(2, "0")}-${day}`;
  return { birth_date, birth_place: match[4]?.trim() || null };
}

/** Parse draft line: "1st round (1st pick, 1st overall), 2003 NBA Draft" -> { year: 2003, round: 1, pick: 1 } */
function parseDraft(metaText) {
  if (!metaText || !/draft/i.test(metaText)) return { draft_year: null, draft_round: null, draft_pick: null };
  const yearMatch = metaText.match(/(\d{4})\s+NBA\s+Draft/i);
  const draft_year = yearMatch ? parseInt(yearMatch[1], 10) : null;
  const roundMatch = metaText.match(/(\d+)(?:st|nd|rd|th)\s+round/i);
  const draft_round = roundMatch ? parseInt(roundMatch[1], 10) : null;
  const pickMatch = metaText.match(/(\d+)(?:st|nd|rd|th)\s+pick/i) || metaText.match(/(\d+)(?:st|nd|rd|th)\s+overall/i);
  const draft_pick = pickMatch ? parseInt(pickMatch[1], 10) : null;
  return { draft_year, draft_round, draft_pick };
}

/** Get cell text by data-stat (row is Cheerio row) */
function cellText($, row, dataStat) {
  const el = row.find(`[data-stat="${dataStat}"]`);
  return el.length ? $(el).text().trim() : "";
}

/**
 * Scrape one Basketball Reference NBA player page and persist player + season stats.
 * @param {string} url - Full URL e.g. https://www.basketball-reference.com/players/j/jamesle01.html
 */
async function scrapePlayer(url) {
  console.log("Scraping NBA player:", url);
  await sleep(REQUEST_DELAY_MS);

  let page;
  let html;
  try {
    page = await browserService.getPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "accept-language": "en-US,en;q=0.9" });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const t = req.resourceType();
      if (t === "image" || t === "stylesheet" || t === "font") req.abort();
      else req.continue();
    });

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      try {
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: PAGE_TIMEOUT_MS });
        if (response && response.status() === 429) {
          if (attempt > MAX_RETRIES) throw new Error("Skipped due to repeated 429");
          console.log("Rate limited. Backing off 10 seconds...");
          await sleep(8000 + Math.random() * 4000);
          continue;
        }
        await page.waitForSelector("#per_game", { timeout: 10000 }).catch(() => {});
        html = await page.content();
        const $ = cheerio.load(html);
        if ($("#per_game").length === 0 && !$("h1").text().trim()) {
          throw new Error("Page structure unexpected");
        }
        break;
      } catch (err) {
        if (attempt > MAX_RETRIES) throw err;
        await sleep(2000);
      }
    }

    const cleaned = (html || "").replace(/<!--/g, "").replace(/-->/g, "");
    const $ = cheerio.load(cleaned);

    const fullName = $("h1").first().text().trim();
    if (!fullName) {
      console.error("No player name found");
      return null;
    }
    const lastSpace = fullName.lastIndexOf(" ");
    const first_name = lastSpace > 0 ? fullName.slice(0, lastSpace).trim() : fullName;
    const last_name = lastSpace > 0 ? fullName.slice(lastSpace + 1).trim() : null;

    const metaText = $("#meta").text();
    let position = null;
    const posMatch = metaText.match(/Position:\s*([^\n▪]+)/i);
    if (posMatch) position = posMatch[1].split(",")[0].trim();

    let height_cm = null;
    let weight_kg = null;
    const hwMatch = metaText.match(/(\d+-\d+)\s*,\s*(\d+)\s*lb/i) || metaText.match(/(\d+-\d+)\s*,\s*(\d+)\s*kg/i);
    if (hwMatch) {
      height_cm = ftInToCm(hwMatch[1].trim());
      weight_kg = metaText.match(/\d+\s*kg/i) ? parseInt(hwMatch[2], 10) : lbsToKg(hwMatch[2]);
      if (weight_kg != null) weight_kg = Math.round(weight_kg);
    }

    const born = parseBorn(metaText);
    let birth_date = born.birth_date;
    const dataBirth = $("#necro-birth").attr("data-birth");
    if (dataBirth) birth_date = dataBirth;

    let college = null;
    const collegeMatch = metaText.match(/College:\s*([^\n]+)/i) || metaText.match(/Colleges?:\s*([^\n]+)/i);
    if (collegeMatch) college = collegeMatch[1].trim();

    const draft = parseDraft(metaText);

    const brId = getPlayerIdFromUrl(url);
    const player = await findOrCreatePlayer({
      full_name: fullName,
      sr_player_id: brId,
      first_name: first_name || null,
      last_name: last_name,
      birth_date: birth_date || null,
      birth_place: born.birth_place || null,
      height_cm: height_cm ?? null,
      weight_kg: weight_kg ?? null,
      position: position || null,
      college: college || null,
      draft_year: draft.draft_year,
      draft_round: draft.draft_round,
      draft_pick: draft.draft_pick,
    });

    if (brId) await attachExternalId(player.id, "basketball_reference", brId);

    const league = await findOrCreateLeague("NBA");

    const table = $("#per_game");
    if (!table.length) return { player: { name: fullName }, seasons: [] };

    const rows = table.find("tbody tr").get();
    for (const rowEl of rows) {
      const row = $(rowEl);
      if (row.hasClass("thead")) continue;

      const seasonText = cellText($, row, "season") || row.find("th[data-stat=\"season\"]").text().trim();
      if (!seasonText || seasonText === "Career" || /^[A-Z]{3}\s*\(\d/.test(seasonText)) continue;

      const teamAbbr = cellText($, row, "team_id") || row.find("td[data-stat=\"team_id\"]").text().trim();
      const lg = cellText($, row, "lg_id") || row.find("td[data-stat=\"lg_id\"]").text().trim();
      if (!teamAbbr) continue;

      const parsed = parseSeasonYear(seasonText);
      if (!parsed) continue;

      const team = await findOrCreateTeam({
        name: teamAbbr,
        city: null,
        abbreviation: teamAbbr,
        league_id: league.id,
      });
      const season = await findOrCreateSeason({
        league_id: league.id,
        year_start: parsed.year_start,
        year_end: parsed.year_end,
      });
      const teamSeason = await findOrCreateTeamSeason({ team_id: team.id, season_id: season.id });

      const g = parseIntOrNull(cellText($, row, "g"));
      const gs = parseIntOrNull(cellText($, row, "gs"));
      const mp = parseFloatOrNull(cellText($, row, "mp"));
      const pts = parseFloatOrNull(cellText($, row, "pts"));
      const trb = parseFloatOrNull(cellText($, row, "trb"));
      const ast = parseFloatOrNull(cellText($, row, "ast"));
      const stl = parseFloatOrNull(cellText($, row, "stl"));
      const blk = parseFloatOrNull(cellText($, row, "blk"));
      const tov = parseFloatOrNull(cellText($, row, "tov"));
      const pf = parseFloatOrNull(cellText($, row, "pf"));
      const fg = parseFloatOrNull(cellText($, row, "fg"));
      const fga = parseFloatOrNull(cellText($, row, "fga"));
      const fg_pct = parseFloatOrNull(cellText($, row, "fg_pct"));
      const fg3 = parseFloatOrNull(cellText($, row, "fg3"));
      const fg3a = parseFloatOrNull(cellText($, row, "fg3a"));
      const fg3_pct = parseFloatOrNull(cellText($, row, "fg3_pct"));
      const ft = parseFloatOrNull(cellText($, row, "ft"));
      const fta = parseFloatOrNull(cellText($, row, "fta"));
      const ft_pct = parseFloatOrNull(cellText($, row, "ft_pct"));
      const orb = parseFloatOrNull(cellText($, row, "orb"));
      const drb = parseFloatOrNull(cellText($, row, "drb"));

      const playerSeason = await createPlayerSeason({
        player_id: player.id,
        team_season_id: teamSeason.id,
        jersey_number: null,
        games_played: g ?? null,
      });

      await query(
        `INSERT INTO player_season_stats
         (player_season_id, games, games_started, minutes, fg, fga, fg_pct, fg3, fg3a, three_pct, ft, fta, ft_pct, orb, drb, rebounds, assists, steals, blocks, turnovers, fouls, points)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          playerSeason.id,
          g ?? null,
          gs ?? null,
          mp ?? null,
          fg != null ? Math.round(fg) : null,
          fga != null ? Math.round(fga) : null,
          fg_pct,
          fg3 != null ? Math.round(fg3) : null,
          fg3a != null ? Math.round(fg3a) : null,
          fg3_pct,
          ft != null ? Math.round(ft) : null,
          fta != null ? Math.round(fta) : null,
          ft_pct,
          orb != null ? Math.round(orb) : null,
          drb != null ? Math.round(drb) : null,
          trb != null ? Math.round(trb) : null,
          ast != null ? Math.round(ast) : null,
          stl != null ? Math.round(stl) : null,
          blk != null ? Math.round(blk) : null,
          tov != null ? Math.round(tov) : null,
          pf != null ? Math.round(pf) : null,
          pts != null ? Math.round(pts) : null,
        ]
      );
    }

    return { player: { name: fullName }, seasons: rows.length };
  } catch (err) {
    console.error("Scraper error:", url, err.message);
    throw err;
  } finally {
    try {
      if (page) await page.close();
    } catch (_) {}
  }
}

module.exports = { scrapePlayer };
