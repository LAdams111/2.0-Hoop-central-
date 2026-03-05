const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

/**
 * Replaces HTML comment delimiters so Sports Reference's comment-wrapped tables
 * become visible to Cheerio. Does not remove the comment content.
 * @param {string} html - Raw HTML string
 * @returns {string} HTML with <!-- and --> removed
 */
function unwrapComments(html) {
  if (typeof html !== "string") return "";
  return html.replace(/<!--/g, "").replace(/-->/g, "");
}

/**
 * Safe parse: number or null.
 */
function parseFloatOrNull(text) {
  if (text == null || text === "") return null;
  const n = parseFloat(String(text).replace(/,/g, "").trim());
  return Number.isNaN(n) ? null : n;
}

/**
 * Safe parse: integer or null.
 */
function parseIntOrNull(text) {
  if (text == null || text === "") return null;
  const n = parseInt(String(text).replace(/,/g, "").trim(), 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Get text from a Cheerio element, trimmed, or null if empty.
 */
function getText($, el, selector) {
  const node = selector ? $(el).find(selector) : $(el);
  const t = node.length ? node.first().text().trim() : "";
  return t || null;
}

/**
 * Get text from cell by data-stat (th or td). Tries primary then fallback stat names.
 */
function getCellByStat(row, $, primaryStat, fallbackStat) {
  const cell = row.find(`[data-stat="${primaryStat}"]`).length
    ? row.find(`[data-stat="${primaryStat}"]`)
    : (fallbackStat && row.find(`[data-stat="${fallbackStat}"]`).length)
      ? row.find(`[data-stat="${fallbackStat}"]`)
      : null;
  return cell && cell.length ? cell.first().text().trim() : null;
}

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

/**
 * Parse "Born: July 6, 2000 in Salisbury, North Carolina" into
 * { birth_date: "2000-07-06", birth_place: "Salisbury, North Carolina" }.
 * If no " in " present, birth_place is null. Handles "July 6, 2000" or "July 6th, 2000".
 * Note: Some CBB pages (e.g. Zion Williamson) do not include "Born:" in the meta HTML at all, so birth_date stays null.
 */
function parseBorn(metaText) {
  const match = metaText.match(/Born:\s*([^\n]+)/i);
  if (!match) return { birth_date: null, birth_place: null };
  const rest = match[1].trim();
  const inMatch = rest.match(/^(.+?)\s+in\s+(.+)$/);
  const dateStr = inMatch ? inMatch[1].trim() : rest;
  const placeStr = inMatch ? inMatch[2].trim() : null;
  const datePart = dateStr.match(/^(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})$/i);
  if (!datePart) return { birth_date: null, birth_place: placeStr };
  const monthName = datePart[1].toLowerCase();
  const day = parseInt(datePart[2], 10);
  const year = datePart[3];
  const monthIdx = MONTH_NAMES.indexOf(monthName);
  if (monthIdx === -1) return { birth_date: null, birth_place: placeStr };
  const month = String(monthIdx + 1).padStart(2, "0");
  const dayPadded = String(day).padStart(2, "0");
  const birth_date = `${year}-${month}-${dayPadded}`;
  return { birth_date, birth_place: placeStr };
}

/**
 * Scrape a single Sports Reference NCAA player page.
 * Loads the page with Puppeteer, unwraps comments, parses with Cheerio,
 * and returns player metadata + per-game season stats in a structure ready for DB (players + player_seasons).
 *
 * @param {string} playerUrl - Full URL to the player page (e.g. .../cbb/players/zion-williamson-1.html)
 * @returns {Promise<{ player: object, seasons: Array }>}
 */
async function scrapePlayerPage(playerUrl) {
  const player = {
    first_name: null,
    last_name: null,
    position: null,
    height: null,
    weight: null,
    birth_date: null,
    birth_place: null,
    school: null,
  };
  const seasons = [];

  let browser;
  let html = "";
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.goto(playerUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    html = await page.content();
    await browser.close();
    browser = null;
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    throw err;
  }

  const cleanedHtml = unwrapComments(html);
  const $ = cheerio.load(cleanedHtml);

  // --- Birth date from hidden attribute (Sports Reference uses #necro-birth data-birth) ---
  const birthDate = $("#necro-birth").attr("data-birth") || null;
  if (birthDate) player.birth_date = birthDate;

  // --- Player name from h1 span: split into first_name and last_name ---
  const nameText = getText($, $("h1").first(), "span") || getText($, $("h1").first());
  const fullName = (nameText || "").trim();
  if (fullName) {
    const lastSpace = fullName.lastIndexOf(" ");
    player.first_name = lastSpace > 0 ? fullName.slice(0, lastSpace).trim() : fullName;
    player.last_name = lastSpace > 0 ? fullName.slice(lastSpace + 1).trim() : null;
  }

  // --- #meta section: position, height, weight, school, birth (Born: ... in ...) ---
  const meta = $("#meta");
  if (meta.length) {
    const metaText = meta.text();
    const getMeta = (label) => {
      const esc = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`${esc}:\\s*([^\\n]+)`, "i");
      const m = metaText.match(re);
      return m ? m[1].trim() : null;
    };
    player.position = getMeta("Position") || null;
    const hwMatch = metaText.match(/(\d+-\d+)\s*,\s*(\d+)\s*lb/i) || metaText.match(/(\d+-\d+)\s*,\s*(\d+)\s*kg/i);
    if (hwMatch) {
      player.height = hwMatch[1].trim();
      player.weight = hwMatch[2].trim();
    } else {
      player.height = getMeta("Height") || null;
      player.weight = getMeta("Weight") || null;
    }
    const born = parseBorn(metaText);
    if (!player.birth_date) player.birth_date = born.birth_date;
    player.birth_place = born.birth_place;
    if (!player.birth_place) player.birth_place = getMeta("Hometown") || null;
    const lines = metaText.split(/\n/);
    for (const line of lines) {
      const t = line.trim();
      if (/^School:\s+/i.test(t) && !/^High\s+School/i.test(t)) {
        player.school = t.replace(/^School:\s+/i, "").trim();
        break;
      }
    }
    if (player.school) {
      player.school = player.school.replace(/\s*\((?:Men|Women)\)\s*$/i, "").trim() || player.school;
    }
  }

  // --- Fallback: if no data-birth on CBB page, try NBA player page (has data-birth in HTML) ---
  if (player.birth_date == null) {
    const nbaLink = $(`a[href*="basketball-reference.com/players/"]`).first().attr("href");
    if (nbaLink) {
      const nbaUrl = nbaLink.startsWith("http") ? nbaLink : `https://www.basketball-reference.com${nbaLink.startsWith("/") ? nbaLink : "/" + nbaLink}`;
      try {
        const b2 = await puppeteer.launch({ headless: "new" });
        const p2 = await b2.newPage();
        await p2.setUserAgent(
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        );
        await p2.goto(nbaUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
        await new Promise((r) => setTimeout(r, 1500));
        const nbaHtml = await p2.content();
        await b2.close();
        const dataBirth = nbaHtml.match(/data-birth="(\d{4}-\d{2}-\d{2})"/);
        if (dataBirth) player.birth_date = dataBirth[1];
      } catch (_) {}
    }
  }

  // --- Per-game table #players_per_game (skip .thead rows) ---
  const table = $("#players_per_game");
  if (table.length) {
    const rows = table.find("tbody tr").length ? table.find("tbody tr") : table.find("tr");
    const rowEls = rows.get();
    for (const rowEl of rowEls) {
      const row = $(rowEl);
      if (row.hasClass("thead")) continue;

      const seasonText = getCellByStat(row, $, "year_id", "season");
      const teamText = getCellByStat(row, $, "team_name_abbr", "school_name") || getCellByStat(row, $, "school_name", "team_name");
      if (!seasonText || !teamText) continue;
      if (/^Career$/i.test(seasonText.trim())) continue;

      const games = parseIntOrNull(getCellByStat(row, $, "g", "games"));
      const mpg = parseFloatOrNull(getCellByStat(row, $, "mp_per_g", "mp"));
      const ppg = parseFloatOrNull(getCellByStat(row, $, "pts_per_g", "pts"));
      const rpg = parseFloatOrNull(getCellByStat(row, $, "trb_per_g", "trb"));
      const apg = parseFloatOrNull(getCellByStat(row, $, "ast_per_g", "ast"));
      const spg = parseFloatOrNull(getCellByStat(row, $, "stl_per_g", "stl"));
      const bpg = parseFloatOrNull(getCellByStat(row, $, "blk_per_g", "blk"));
      const fg_pct = parseFloatOrNull(getCellByStat(row, $, "fg_pct"));
      const three_pct = parseFloatOrNull(getCellByStat(row, $, "fg3_pct"));
      const ft_pct = parseFloatOrNull(getCellByStat(row, $, "ft_pct"));

      seasons.push({
        season: seasonText,
        team: teamText,
        games: games != null ? games : undefined,
        mpg: mpg != null ? mpg : undefined,
        ppg: ppg != null ? ppg : undefined,
        rpg: rpg != null ? rpg : undefined,
        apg: apg != null ? apg : undefined,
        spg: spg != null ? spg : undefined,
        bpg: bpg != null ? bpg : undefined,
        fg_pct: fg_pct != null ? fg_pct : undefined,
        three_pct: three_pct != null ? three_pct : undefined,
        ft_pct: ft_pct != null ? ft_pct : undefined,
      });
    }
  }

  return { player, seasons };
}

module.exports = {
  unwrapComments,
  scrapePlayerPage,
};
