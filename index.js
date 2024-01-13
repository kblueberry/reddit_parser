const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto("https://www.reddit.com/r/Breadit/");

  // search and write results to .txt file
  await searchAndSave(page);

  // await getLinks(page, allLinks);
  // await scrollAndFind(page, allLinks);
  // await page.waitForTimeout(2000);
  await browser.close();
})();

async function searchAndSave(page) {
  const searchInputSelector = "faceplate-search-input",
    searchResultSelector = "a.absolute.inset-0";

  await page.type(searchInputSelector, "rye sourdough");
  await page.waitForSelector(searchResultSelector);
  let allLinks = [];

  await getResultsOnScroll(page, allLinks, searchResultSelector);
}

async function getResultsOnScroll(page, results, resultsSelector) {
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
    }, distance);
    await getLinks(page, results, resultsSelector);
    await page.waitForTimeout(delay);
  }
}

async function getLinks(page, results, selector) {
  await page.waitForSelector(selector);

  const postLinks = await page.$$eval(selector, (links) =>
    links.map((link) => {
      return { title: link.textContent, href: link.href };
    })
  );
  results = results.concat(...postLinks);
  console.log("all links", results);
}
