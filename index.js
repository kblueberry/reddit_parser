const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.reddit.com/r/Breadit/");
  await page.waitForSelector('a[slot="full-post-link"]');

  const postLinks = await page.$$eval('a[slot="full-post-link"]', (links) =>
    links.map((link) => link.href)
  );
  console.log("hrefs", postLinks);

  await browser.close();
})();
