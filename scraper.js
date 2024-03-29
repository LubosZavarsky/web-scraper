import * as fs from "node:fs/promises";
import * as cheerio from "cheerio";
import sendMail from "./mail-sender.js";

async function runWebScraper() {
  console.log("Starting the web scraper...");

  const resultFilePath = "./scraped-data.json";
  const targetUrl = process.env.TARGET_URL;

  try {
    // Fetch data from URL and store the response into a const
    const response = await fetch(targetUrl);
    // Convert response into text
    const body = await response.text();
    // Load body data
    const $ = cheerio.load(body);

    let result = [];

    $(".nm-shop .nm-products li .nm-shop-loop-details h3 a").map((i, el) => {
      const title = $(el).text();
      result.push(title ? title : null);
    });

    //console.log(result);

    // Read the previous result from the file
    let previousResult = null;
    try {
      const data = await fs.readFile(resultFilePath, "utf-8");
      previousResult = data ? JSON.parse(data) : [];
    } catch (error) {
      console.log(`File reading failed: ${error}`);
    }

    // Save current result to the file
    await fs.writeFile(resultFilePath, JSON.stringify(result));

    // Compare current and previous results
    if (previousResult) {
      if (result.length < previousResult.length) {
        const removedItems = previousResult.filter(
          (title) => !result.includes(title)
        );
        console.log(
          "Changes detected.",
          `These items: [${removedItems}] have been removed.`
        );
        sendMail(
          `These items: <b>[${removedItems}]</b> have been removed.<br>${process.env.TARGET_URL}`
        );
      } else if (result.length > previousResult.length) {
        const addedItems = result.filter(
          (title) => !previousResult.includes(title)
        );
        console.log(
          "Changes detected.",
          `These items: [${addedItems}] have been added.`
        );
        sendMail(
          `These items: <b>[${addedItems}]</b> have been added.<br>${process.env.TARGET_URL}`
        );
      } else {
        console.log("No changes detected.");
        //sendMail(`No changes detected.`);
      }
    }

    // console.log("Web scraping completed successfully.");
  } catch (error) {
    console.log(`Scraping failed: ${error}`);
  }
}

//runWebScraper();

export default runWebScraper;
