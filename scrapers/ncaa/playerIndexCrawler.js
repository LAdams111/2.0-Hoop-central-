const axios = require("axios");
const cheerio = require("cheerio");

const BASE = "https://www.sports-reference.com";

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

  for (const letter of letters) {
    let url;
    if (letter === "a") {
      url = `${BASE}/cbb/players/a-index.html`;
    } else {
      url = `${BASE}/cbb/players/${letter}/`;
    }

    console.log(`Visiting: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.google.com/",
          Connection: "keep-alive",
        },
        timeout: 30000,
      });

      let html = response.data;

      // Remove HTML comments so hidden tables appear
      html = html.replace(/<!--/g, "").replace(/-->/g, "");

      const $ = cheerio.load(html);

      const links = [];

      $('a[href^="/cbb/players/"]').each((i, el) => {
        const href = $(el).attr("href");
        if (href && PLAYER_LINK_REGEX.test(href)) {
          links.push(BASE + href);
        }
      });

      console.log(`Letter ${letter} → players found: ${links.length}`);
      playerUrls.push(...links);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.log(`Letter ${letter} → failed to load (${err.message})`);
    }
  }

  console.log("Total players discovered:", playerUrls.length);
  return playerUrls;
}

module.exports = { crawlPlayerIndex };
