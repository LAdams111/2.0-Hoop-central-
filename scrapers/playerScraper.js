/**
 * NBA player scraper (Basketball Reference).
 * Re-exports the main scraper for a single entry point.
 */

const { scrapePlayer } = require("./nba/basketballReferencePlayerScraper");
module.exports = { scrapePlayer };
