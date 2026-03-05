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

/**
 * Scrape a single Sports Reference NCAA player page.
 * Loads the page with Puppeteer, unwraps comments, parses with Cheerio,
 * and returns player metadata + per-game season stats.
 *
 * @param {string} playerUrl - Full URL to the player page (e.g. .../cbb/players/zion-williamson-1.html)
 * @returns {Promise<{ name: string, position: string|null, height: string|null, weight: string|null, school: string|null, seasons: Array }>}
 */
async function scrapePlayerPage(playerUrl) {
  const result = {
    name: null,
    position: null,
    height: null,
    weight: null,
    school: null,
    birth_place: null,
    seasons: [],
  };

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

  // --- Player name (h1) ---
  const nameText = getText($, $("h1").first(), "span") || getText($, $("h1").first());
  result.name = nameText || "Unknown";

  // --- #meta section: position, height, weight, school, birth_place (site label: "Hometown") ---
  const meta = $("#meta");
  if (meta.length) {
    const metaText = meta.text();
    const getMeta = (label) => {
      const esc = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`${esc}:\\s*([^\\n]+)`, "i");
      const m = metaText.match(re);
      return m ? m[1].trim() : null;
    };
    result.position = getMeta("Position") || null;
    const hwMatch = metaText.match(/(\d+-\d+)\s*,\s*(\d+)\s*lb/i) || metaText.match(/(\d+-\d+)\s*,\s*(\d+)\s*kg/i);
    if (hwMatch) {
      result.height = hwMatch[1].trim();
      result.weight = hwMatch[2].trim();
    } else {
      result.height = getMeta("Height") || null;
      result.weight = getMeta("Weight") || null;
    }
    // "School:" = college; avoid "High School:"
    const lines = metaText.split(/\n/);
    for (const line of lines) {
      const t = line.trim();
      if (/^School:\s+/i.test(t) && !/^High\s+School/i.test(t)) {
        result.school = t.replace(/^School:\s+/i, "").trim();
        break;
      }
    }
    if (result.school) {
      result.school = result.school.replace(/\s*\((?:Men|Women)\)\s*$/i, "").trim() || result.school;
    }
    // Birth place: Sports Reference labels this "Hometown" (e.g. "Salisbury, North Carolina")
    result.birth_place = getMeta("Hometown") || null;
  }

  // --- Per-game table #players_per_game ---
  const table = $("#players_per_game");
  if (!table.length) return result;

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

    result.seasons.push({
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

  return result;
}

module.exports = {
  unwrapComments,
  scrapePlayerPage,
};
