const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.reddit.com/r/Breadit/search/?q=rye%20bread");

  // search and write results to .txt file
  await searchAndSave2(page);

  // await getLinks(page, allLinks);
  // await scrollAndFind(page, allLinks);
  // await page.waitForTimeout(2000);
  await browser.close();
})();

async function searchAndSave2(page) {
  let allLinks = [];

  const searchResultsLinks = await page.$$eval(
    'body >>> a[data-testid="post-title"]',
    (elements) => elements.map((el) => el.href)
  );

  allLinks = allLinks.concat(searchResultsLinks);
  console.log("links results", allLinks, allLinks.length);
  // await getResultsOnScroll(
  //   page,
  //   allLinks,
  //   'body >>> a[data-testid="post-title"]'
  // );
}

async function searchAndSave(page) {
  const inputSelector = "body >>> input[placeholder='Search in r/Breadit']";

  const elementHandle = await page.waitForSelector(inputSelector);
  // await page.focus(inputSelector);
  const searchButton = await page.waitForSelector("body >>> span.leadingIcon");
  console.log(searchButton);
  await page.evaluate((el) => el.click(), searchButton);

  // await page.$eval(inputSelector, (el) => (el.value = "rye"));
  await page.keyboard.type("Enter");

  console.log("input: ", elementHandle);
  // console.log(
  //   "value after type",
  //   await page.evaluate((element) => element.value, elementHandle)
  // );

  // const searchResults = await page.$('body >>> a[data-testid="post-title"]');
  // console.log("page results: ", searchResults);

  // console.log("search res: ", searchResults);
  // await page.type(searchInputSelector, "rye sourdough");

  // const resultsOfSearch = await page.waitForSelector(
  //   'a[data-testid="post-title"]'
  // );
  // console.log("res: ", resultsOfSearch);
  // let allLinks = [];

  // await getResultsOnScroll(
  //   page,
  //   allLinks,
  //   'body >>> a[data-testid="post-title"]'
  // );
}

async function getResultsOnScroll(page, results, resultsSelector) {
  const distance = await page.evaluate(() => window.innerHeight);
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
    await getLinks(page, results, resultsSelector);
    await page.waitForTimeout(delay);
  }
}

async function getLinks(page, results, selector) {
  await page.waitForSelector(selector);

  const postLinks = await page.$$eval(selector, (links) =>
    links.map((link) => {
      return { href: link.href };
    })
  );
  console.log("results", results, results.length);
  results = results.concat(...postLinks);
}
