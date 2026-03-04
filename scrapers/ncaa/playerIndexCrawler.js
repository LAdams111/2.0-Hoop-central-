const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const BASE = "https://www.sports-reference.com";
const PLAYER_LINK_REGEX = /^\/cbb\/players\/[a-z\-]+-\d+\.html$/;

/**
 * Crawl Sports Reference NCAA player index by letter and collect all player profile URLs.
 * Uses Puppeteer to fetch (avoid 403), then Cheerio to parse HTML including commented tables.
 * @returns {Promise<string[]>} Full URLs for each player page (deduplicated)
 */
async function crawlPlayerIndex() {
  const playerUrls = [];
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");

  const browser = await puppeteer.launch({ headless: "new" });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    for (const letter of letters) {
      const url =
        letter === "a"
          ? `${BASE}/cbb/players/a-index.html`
          : `${BASE}/cbb/players/${letter}/`;

      console.log(`Visiting: ${url}`);

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

        let html = await page.content();

        html = html.replace(/<!--/g, "").replace(/-->/g, "");

        const $ = cheerio.load(html);
        const links = [];

        $("#players a[href^='/cbb/players/']").each((_, el) => {
          const href = $(el).attr("href");
          if (href && PLAYER_LINK_REGEX.test(href)) {
            links.push(BASE + href);
          }
        });

        const unique = Array.from(new Set(links));
        console.log(`Letter ${letter} → players found: ${unique.length}`);
        playerUrls.push(...unique);

        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {
        console.log(`Letter ${letter} → failed to load (${err.message})`);
      }
    }

    const allUnique = Array.from(new Set(playerUrls));
    console.log("Total players discovered:", allUnique.length);
    console.log("First 10 players:", allUnique.slice(0, 10));
    return allUnique;
  } finally {
    await browser.close();
  }
}

module.exports = { crawlPlayerIndex };
