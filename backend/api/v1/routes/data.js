const express = require("express");
const router = express.Router();
const { NOTION_KEY } = require("../../../Paths.js");
const dataErrorHandler = require("../middleware/dataErrorHandler.js");
const { tryCatch } = require("../utils/tryCatch.js");
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: NOTION_KEY });

router.get(
  "/",
  tryCatch(async (req, res) => {
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
    const data = response.results.map((result) => {
      return {
        databaseName: result.title[0].text.content,
        databaseId: result.id,
        properties: result.properties,
      };
    });
    res.status(200).json(data);
  })
);

router.use(dataErrorHandler);

module.exports = router;
