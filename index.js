const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.reddit.com/r/Breadit/search/?q=rye%20bread");

  // search and write results to .txt file
  await searchAndSave(page);

  // await getLinks(page, allLinks);
  // await scrollAndFind(page, allLinks);
  // await page.waitForTimeout(2000);
  await browser.close();
})();

async function searchAndSave(page) {
  let allLinks = [];

  const searchResultsLinks = await page.$$eval(
    'body >>> a[data-testid="post-title"]',
    (elements) =>
      elements.map((el) => {
        return {
          href: el.href,
          positionY: el.getBoundingClientRect().y,
        };
      })
  );

  allLinks = [...allLinks].concat(...searchResultsLinks);

  await getResultsOnScroll(
    page,
    allLinks,
    searchResultsLinks[0].positionY,
    searchResultsLinks[searchResultsLinks.length - 1].positionY
  );
}

async function getResultsOnScroll(page, allLinks, firstEl, lastEl) {
  const distance = lastEl - firstEl;

  const delay = 1000;
  while (
    await page.evaluate(
      () =>
        document.scrollingElement.scrollTop + window.innerHeight <
        document.scrollingElement.scrollHeight
    )
  ) {
    await page.evaluate((y) => {
      document.scrollingElement.scrollBy(0, y);
    }, distance);
    await getLinks(page, allLinks, 'body >>> a[data-testid="post-title"]');
    await page.waitForTimeout(delay);
  }
}

async function getLinks(page, results, selector) {
  await page.waitForSelector(selector);

  const postLinks = await page.$$eval(selector, (links) =>
    links.map((link) => {
      return {
        href: link.href,
        positionY: link.getBoundingClientRect().y,
      };
    })
  );
  results = results.concat(...postLinks);
  console.log("results", results, results.length);
}
