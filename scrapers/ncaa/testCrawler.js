const { crawlPlayerIndex } = require("./playerIndexCrawler");

async function testCrawler() {
  try {
    console.log("Starting crawler...");
    const playerUrls = await crawlPlayerIndex();
    console.log("Total players discovered:", playerUrls.length);
    console.log("\nFirst 10 players:");
    console.log(playerUrls.slice(0, 10));
  } catch (err) {
    console.error("Crawler failed:", err);
  }
}

testCrawler();
