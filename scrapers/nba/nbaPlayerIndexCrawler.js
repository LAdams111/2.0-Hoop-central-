/**
 * Crawl Basketball Reference NBA player index by letter (a–z).
 * Index URLs: https://www.basketball-reference.com/players/{letter}/
 * Player links: /players/j/jamesle01.html
 */

const puppeteer = require("puppeteer");
const { query } = require("../../db/db");

const BASE = "https://www.basketball-reference.com";
/** Player profile URLs: /players/{letter}/{id}.html */
const PLAYER_LINK_REGEX = /^\/players\/[a-z]\/[a-z0-9]+\.html$/;

/**
 * Crawl NBA player index for one letter and return full player URLs.
 * @param {string} letter - Single letter a–z
 * @param {import('puppeteer').Page} page
 * @returns {Promise<string[]>}
 */
async function crawlLetter(letter, page) {
  const url = `${BASE}/players/${letter}/`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

  const hrefs = await page.evaluate(() => {
    const links = [];
    document.querySelectorAll('a[href^="/players/"]').forEach((a) => {
      const href = a.getAttribute("href");
      if (href && href.match(/^\/players\/[a-z]\/[a-z0-9]+\.html$/)) links.push(href);
    });
    return [...new Set(links)];
  });

  return hrefs.map((href) => (href.startsWith("http") ? href : BASE + href));
}

/**
 * Crawl all letters a–z and optionally insert URLs into player_scrape_jobs.
 * @param {{ saveToDb?: boolean }} opts
 * @param {boolean} [opts.saveToDb=true]
 * @returns {Promise<string[]>}
 */
async function crawlNbaPlayerIndex(opts = {}) {
  const saveToDb = opts.saveToDb !== false;
  const allUrls = [];
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");

  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "accept-language": "en-US,en;q=0.9" });

    for (const letter of letters) {
      try {
        const urls = await crawlLetter(letter, page);
        allUrls.push(...urls);
        console.log(`Letter ${letter} → ${urls.length} players`);
      } catch (err) {
        console.warn(`Letter ${letter} failed:`, err.message);
      }
    }

    const unique = Array.from(new Set(allUrls));
    console.log("Total NBA player URLs:", unique.length);

    if (saveToDb && unique.length > 0) {
      const BATCH = 2000;
      for (let i = 0; i < unique.length; i += BATCH) {
        const batch = unique.slice(i, i + BATCH);
        await query(
          `INSERT INTO player_scrape_jobs (player_url) SELECT unnest($1::text[]) ON CONFLICT (player_url) DO NOTHING`,
          [batch]
        );
        console.log(`Queued ${Math.min(i + BATCH, unique.length)} / ${unique.length}`);
      }
    }
    return unique;
  } finally {
    await browser.close();
  }
}

module.exports = { crawlNbaPlayerIndex, crawlLetter };
