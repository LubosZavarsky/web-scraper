import { launch } from "puppeteer";
import * as fs from "node:fs/promises";
import dotenv from "dotenv";
import sendMail from "./mail-sender.js";

dotenv.config();

const resultFilePath = "./scraped-data.json";
const targetUrl = process.env.TARGET_URL;

async function runWebScraper() {
  console.log("Starting the web scraper...");

  try {
    const browser = await launch({ headless: "new" });
    const page = await browser.newPage();

    console.log(`Navigating to ${targetUrl}`);
    await page.goto(targetUrl);
    await page.waitForSelector("body");

    const grabItems = await page.evaluate(() => {
      const items = document.body.querySelectorAll(
        ".nm-shop .nm-products li .nm-shop-loop-details h3 a"
      );
      let result = [];

      items.forEach((item) => {
        const title = item.textContent;
        result.push(title ? title : null);
      });

      return result;
    });

    // Read the previous result from the file
    let previousResult = null;
    try {
      const data = await fs.readFile(resultFilePath, "utf-8");
      previousResult = data ? JSON.parse(data) : [];
    } catch (error) {
      console.log(`File reading failed: ${error}`);
    }

    // Save current result to the file
    await fs.writeFile(resultFilePath, JSON.stringify(grabItems));

    // Compare current and previous results
    if (previousResult) {
      if (grabItems.length < previousResult.length) {
        const removedItems = previousResult.filter(
          (title) => !grabItems.includes(title)
        );
        console.log(
          "Changes detected.",
          `These items: [${removedItems}] have been removed.`
        );
        sendMail(
          `These items: <b>[${removedItems}]</b> have been removed.<br>${process.env.TARGET_URL}`
        );
      } else if (grabItems.length > previousResult.length) {
        const addedItems = grabItems.filter(
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

    console.log("Web scraping completed successfully.");

    // Close browser
    await browser.close();
  } catch (error) {
    console.log(`Scraping failed: ${error}`);
  }
}

runWebScraper();
