const browserService = require("../services/browserService");
const { processJobs, resetStaleProcessing } = require("./playerScrapeWorker");

const WORKER_COUNT = 8;

async function main() {
  let running = true;
  const shutdown = async () => {
    if (!running) return;
    running = false;
    console.log("Shutting down worker pool...");
    await browserService.closeBrowser();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(`Starting ${WORKER_COUNT} concurrent player scrape workers...`);
  await resetStaleProcessing();

  const workers = [];
  for (let i = 0; i < WORKER_COUNT; i++) {
    workers.push(processJobs(i));
  }
  await Promise.all(workers);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
