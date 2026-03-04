const puppeteer = require("puppeteer");

const BASE = "https://www.sports-reference.com";
/** Profile URLs: /cbb/players/{slug}-{number}.html — allow apostrophes etc. in slug */
const PLAYER_LINK_REGEX = /^\/cbb\/players\/.*-\d+\.html$/;

/**
 * Crawl Sports Reference NCAA player index by letter and collect all player profile URLs.
 * Uses Puppeteer to fetch (avoid 403), unwraps HTML comments in-page, then collects player profile links.
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
        await new Promise((r) => setTimeout(r, 2000));

        // Unwrap HTML comments so any commented tables become visible, then get player links.
        // Note: links are not under #players on this site; use all /cbb/players/ links and filter by profile regex.
        const rawHrefs = await page.evaluate(() => {
          const walker = document.createTreeWalker(
            document,
            NodeFilter.SHOW_COMMENT,
            null,
            false
          );
          let node;
          while ((node = walker.nextNode())) {
            const div = document.createElement("div");
            div.innerHTML = node.nodeValue;
            node.parentNode.replaceChild(div, node);
          }
          const links = [];
          document.querySelectorAll("a[href^='/cbb/players/']").forEach((a) => {
            const href = a.getAttribute("href");
            if (href) links.push(href);
          });
          return links;
        });

        const links = (rawHrefs || [])
          .filter((href) => PLAYER_LINK_REGEX.test(href))
          .map((href) => BASE + href);
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
