const puppeteer = require("puppeteer");

let browser;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

async function getPage() {
  const browser = await getBrowser();
  return await browser.newPage();
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

module.exports = {
  getBrowser,
  getPage,
  closeBrowser,
};
