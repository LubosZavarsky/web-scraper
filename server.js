import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import runWebScraper from "./scraper.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// function logMessage() {
//   console.log("Cron job executed at:", new Date().toLocaleString());
// }

// Run scraper every 2 minutes
cron.schedule("*/2 * * * *", () => {
  //logMessage();
  runWebScraper();
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
