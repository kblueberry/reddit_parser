const puppeteer = require("puppeteer");

(async () => {
  let allLinks = [];
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto("https://www.reddit.com/r/Breadit/");
  await getLinks(page, allLinks);
  await scrollAndFind(page, allLinks);
  await page.waitForTimeout(2000);
  console.log("all links", allLinks);

  await browser.close();
})();

async function scrollAndFind(page, allLinks) {
  const distance = 100;
  const delay = 100;
  while (
    await page.evaluate(
      () =>
        document.scrollingElement.scrollTop + window.innerHeight <
        document.scrollingElement.scrollHeight
    )
  ) {
    await page.evaluate((y) => {
      document.scrollingElement.scrollBy(0, y);
      console.log("scrolled");
    }, distance);
    await getLinks(page, allLinks);
    await page.waitForTimeout(delay);
  }
}

async function getLinks(page, allLinks) {
  await page.waitForSelector('a[slot="full-post-link"]');

  const postLinks = await page.$$eval('a[slot="full-post-link"]', (links) =>
    links.map((link) => link.href)
  );
  allLinks = allLinks.concat(...postLinks);
}
