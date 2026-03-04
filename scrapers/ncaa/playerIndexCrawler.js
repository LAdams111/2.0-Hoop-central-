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
      let url;
      if (letter === "a") {
        url = "https://www.sports-reference.com/cbb/players/a-index.html";
      } else {
        url = `https://www.sports-reference.com/cbb/players/${letter}/`;
      }
      console.log(`Visiting: ${url}`);
      await delay(2000);

      let playerLinks;
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        await page.waitForSelector("body");
        await new Promise((resolve) => setTimeout(resolve, 500));

        playerLinks = await page.evaluate((letter) => {
          const header = document.querySelector(`h2#${letter.toUpperCase()}`);
          if (!header) return [];
          const table = header.nextElementSibling;
          if (!table) return [];
          const links = Array.from(table.querySelectorAll("a[href^='/cbb/players/']"));
          return links.map((a) => a.getAttribute("href"));
        }, letter);
      } catch (err) {
        console.log(`Letter: ${letter} → failed to load (${err.message})`);
        continue;
      }

      const validPlayers = (playerLinks || [])
        .filter((href) => href && PLAYER_LINK_REGEX.test(href))
        .map((href) => BASE_ORIGIN + href);

      playerUrls.push(...validPlayers);
      console.log(`Letter: ${letter} → players found: ${validPlayers.length}`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    console.log("Total players discovered:", playerUrls.length);
    console.log("First 10 players:", playerUrls.slice(0, 10));
  } finally {
    await browser.close();
  }

  return playerUrls;
}

module.exports = { crawlPlayerIndex };
