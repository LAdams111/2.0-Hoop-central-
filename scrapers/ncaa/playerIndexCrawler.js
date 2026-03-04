const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const BASE = "https://www.sports-reference.com";
/** Profile URLs: /cbb/players/{slug}-{number}.html — allow apostrophes etc. in slug */
const PLAYER_LINK_REGEX = /^\/cbb\/players\/.*-\d+\.html$/;

/**
 * Crawl Sports Reference NCAA player index by letter and collect all player profile URLs.
 * Uses Puppeteer to fetch (avoid 403), captures document and XHR responses, strips comments, and collects links.
 * For letters that return 0 from the index page, tries the list URL (/cbb/players/{letter}/) with a long wait.
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
      const url = `${BASE}/cbb/players/${letter}-index.html`;

      console.log(`Visiting: ${url}`);

      try {
        let rawHtml = null;
        let xhrHtml = null;
        const captureResponse = (res) => {
          const req = res.request();
          if (req.resourceType() === "document" && req.url() === url) {
            res.text().then((text) => { rawHtml = text; }).catch(() => {});
            return;
          }
          const u = res.url();
          if (u.includes("/cbb/players/")) {
            res.text().then((text) => {
              const count = (text.match(/\/cbb\/players\/[^"']*-\d+\.html/g) || []).length;
              if (count > 50) xhrHtml = text;
            }).catch(() => {});
          }
        };
        page.on("response", captureResponse);

        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await new Promise((r) => setTimeout(r, 5000));
        page.off("response", captureResponse);

        let rawHrefs = [];

        // Prefer raw response body — strip comments and parse with Cheerio (works for "a" and any letter with same server response)
        for (const htmlSource of [rawHtml, xhrHtml]) {
          if (!htmlSource || rawHrefs.length > 0) continue;
          const html = htmlSource.replace(/<!--/g, "").replace(/-->/g, "");
          const $ = cheerio.load(html);
          $('a[href^="/cbb/players/"]').each((_, el) => {
            const href = $(el).attr("href");
            if (href) rawHrefs.push(href);
          });
        }

        // Fallback: unwrap comments in DOM and collect links
        if (rawHrefs.length === 0) {
          rawHrefs = await page.evaluate(() => {
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
            document.querySelectorAll('a[href^="/cbb/players/"]').forEach((a) => {
              const href = a.getAttribute("href");
              if (href) links.push(href);
            });
            return links;
          });
        }

        if (rawHrefs.length === 0) {
          let html = await page.content();
          html = html.replace(/<!--/g, "").replace(/-->/g, "");
          const $ = cheerio.load(html);
          $('a[href^="/cbb/players/"]').each((_, el) => {
            const href = $(el).attr("href");
            if (href) rawHrefs.push(href);
          });
        }

        // For b-z: if still 0, try the full-list URL /cbb/players/{letter}/ with long wait (site may load table via JS)
        if (rawHrefs.length === 0 && letter !== "a") {
          const listUrl = `${BASE}/cbb/players/${letter}/`;
          console.log(`  → Trying list URL: ${listUrl}`);
          await page.goto(listUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
          await new Promise((r) => setTimeout(r, 15000));
          rawHrefs = await page.evaluate(() => {
            const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, null, false);
            let node;
            while ((node = walker.nextNode())) {
              const div = document.createElement("div");
              div.innerHTML = node.nodeValue;
              node.parentNode.replaceChild(div, node);
            }
            const links = [];
            document.querySelectorAll('a[href^="/cbb/players/"]').forEach((a) => {
              const href = a.getAttribute("href");
              if (href) links.push(href);
            });
            return links;
          });
          if (rawHrefs.length === 0) {
            const html = (await page.content()).replace(/<!--/g, "").replace(/-->/g, "");
            const $ = cheerio.load(html);
            $('a[href^="/cbb/players/"]').each((_, el) => {
              const href = $(el).attr("href");
              if (href) rawHrefs.push(href);
            });
          }
        }

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
