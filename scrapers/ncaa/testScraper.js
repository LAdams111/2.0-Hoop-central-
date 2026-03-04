const { scrapePlayer } = require("./sportsReferencePlayerScraper");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  await sleep(3000);

  const result = await scrapePlayer(
    "https://www.sports-reference.com/cbb/players/zion-williamson-1.html"
  );

  if (result === null) {
    console.error("Scraper failed.");
    process.exit(1);
  }

  const { player, seasonsProcessed } = result;
  console.log("Done. Player:", player.full_name, "| Seasons processed:", seasonsProcessed);
})().catch((err) => {
  console.error("Scraper error:", err);
  process.exit(1);
});
