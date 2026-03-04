const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const BASE_URL = "https://www.sports-reference.com/cbb/players";
const BASE_ORIGIN = "https://www.sports-reference.com";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Crawl Sports Reference NCAA player index by letter and collect all player profile URLs.
 * @returns {Promise<string[]>} Full URLs for each player page
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
      const url = `https://www.sports-reference.com/cbb/players/${letter}/`;
      console.log(`Visiting: ${url}`);
      await delay(2000);

      let html;
      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        html = await page.content();
      } catch (err) {
        console.log(`Letter: ${letter} → failed to load (${err.message})`);
        continue;
      }

      // 1. Page HTML retrieved above via page.content()
      // 2. Strip HTML comments so the players table (wrapped in comments) is visible to Cheerio
      const cleanedHtml = html
        .replace(/<!--/g, "")
        .replace(/-->/g, "");

      // 3. Load cleaned HTML into Cheerio
      const $ = cheerio.load(cleanedHtml);

      // 4. Extract player links from the players table only
      let count = 0;
      $('#players tbody tr td[data-stat="player"] a').each((i, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        const fullUrl = href.startsWith("http") ? href : BASE_ORIGIN + href;
        playerUrls.push(fullUrl);
        count += 1;
      });

      // 5. Log players found per letter
      console.log(`Letter: ${letter} → players found: ${count}`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  } finally {
    await browser.close();
  }

  return playerUrls;
}

module.exports = { crawlPlayerIndex };
