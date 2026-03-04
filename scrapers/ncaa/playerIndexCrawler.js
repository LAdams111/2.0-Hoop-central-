const puppeteer = require("puppeteer");

const BASE_ORIGIN = "https://www.sports-reference.com";

/** Only real player profile URLs: /cbb/players/{name}-{number}.html */
const PLAYER_LINK_REGEX = /^\/cbb\/players\/[a-z\-]+-\d+\.html$/;

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

      let links;
      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await page.waitForSelector("#players a", { timeout: 8000 }).catch(() => {});

        links = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll("#players a"));
          return anchors.map((a) => a.getAttribute("href"));
        });
      } catch (err) {
        console.log(`Letter: ${letter} → failed to load (${err.message})`);
        continue;
      }

      const playerLinks = links
        .filter((href) => href && PLAYER_LINK_REGEX.test(href))
        .map((href) => BASE_ORIGIN + href);

      playerUrls.push(...playerLinks);
      console.log(`Letter: ${letter} → players found: ${playerLinks.length}`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  } finally {
    await browser.close();
  }

  return playerUrls;
}

module.exports = { crawlPlayerIndex };
