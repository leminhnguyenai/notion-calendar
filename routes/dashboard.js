const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });

router.use(express.static("public"));
router.use(express.json());

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, ".././views/index.html"));
});

router.get("/fetchData", async (req, res) => {
  try {
    const response = await notion.search({
      filter: {
        value: "database",
        property: "object",
      },
      sort: {
        direction: "ascending",
        timestamp: "last_edited_time",
      },
    });
    data = response.results.map((result) => {
      return {
        databaseName: result.title[0].text.content,
        databaseId: result.id,
        properties: result.properties,
      };
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.json("Failed fetching");
  }
});

module.exports = router;
