const { crawlPlayerIndex } = require("../scrapers/ncaa/playerIndexCrawler");
const { scrapePlayer } = require("../scrapers/ncaa/sportsReferencePlayerScraper");
const browserService = require("../services/browserService");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runNcaaIngestion() {
  try {
    console.log("Running NCAA crawler...");
    const playerUrls = await crawlPlayerIndex();
    console.log("Players discovered:", playerUrls.length);

    for (const url of playerUrls) {
      console.log("Scraping player:", url);
      await scrapePlayer(url);
      await delay(4000);
    }

    console.log("Ingestion complete.");
  } catch (err) {
    console.error("Ingestion failed:", err);
    throw err;
  } finally {
    await browserService.closeBrowser();
  }
}

runNcaaIngestion();
