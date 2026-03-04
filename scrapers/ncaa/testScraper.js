const { scrapePlayer } = require("./sportsReferencePlayerScraper");

scrapePlayer(
  "https://www.sports-reference.com/cbb/players/zion-williamson-1.html"
)
  .then(({ player, seasonsProcessed }) => {
    console.log("Done. Player:", player.full_name, "| Seasons processed:", seasonsProcessed);
  })
  .catch((err) => {
    console.error("Scraper error:", err);
    process.exit(1);
  });
