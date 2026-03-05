const { scrapePlayerPage } = require("./playerScraper");

const TEST_URL = "https://www.sports-reference.com/cbb/players/zion-williamson-1.html";

async function main() {
  console.log("Scraping:", TEST_URL);
  try {
    const data = await scrapePlayerPage(TEST_URL);
    console.log("Full structured output (player + seasons):");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Scraper failed:", err.message);
    process.exit(1);
  }
}

main();
