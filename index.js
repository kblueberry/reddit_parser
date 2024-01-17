const puppeteer = require("puppeteer");

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

async function typeInInput(inputElement) {
  inputElement.setAttribute("type", "text");

  inputElement.focus();
  inputElement.value = "";
  const numberString = "Some Text";
  for (let i = 0; i < numberString.length; i++) {
    const digit = numberString[i];

    const keyboardEvent = new KeyboardEvent("keydown", { key: digit });
    inputElement.dispatchEvent(keyboardEvent);

    inputElement.value += digit;

    const inputEvent = new InputEvent("input", {
      inputType: "insertText",
      data: digit,
    });
    inputElement.dispatchEvent(inputEvent);

    const changeEvent = new Event("change");
    inputElement.dispatchEvent(changeEvent);

    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function searchAndSave(page) {
  const searchResultSelector = "a.absolute.inset-0";

  // await page.type(
  //   "body >>> input[placeholder='Search in r/Breadit']",
  //   "My love"
  // );

  const inputSearch = await page.waitForSelector(
    "body >>> input[placeholder='Search in r/Breadit']"
  );

  console.log("input: ", inputSearch);
  await inputSearch.type("test");

  console.log("pp");
  // await page.type(searchInputSelector, "rye sourdough");

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
      return { href: link.href };
    })
  );
  console.log("results", results);
  results = results.concat(...postLinks);
}
