const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });

const port = 3000;

app.use(express.static("public"));
app.use(express.json());

// Modification tab
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "/views/index.html");
  res.sendFile(filePath);
});

// Get databases list
app.get("/search", async (req, res) => {
  const searchResults = await notion.search({
    filter: {
      value: "database",
      property: "object",
    },
    sort: {
      direction: "ascending",
      timestamp: "last_edited_time",
    },
  });
  const results = [];
  const length = searchResults.results.length;
  for (let i = 0; i <= length - 1; i++) {
    results.push({
      database: searchResults.results[i].title[0].plain_text,
      id: searchResults.results[i].id,
      properties: Object.keys(searchResults.results[i].properties).map(
        (key) => {
          const { id, name, type } = searchResults.results[i].properties[key];
          return { id, name, type };
        }
      ),
    });
  }
  console.log(results);
  res.json(results);
});

//Add connection info
app.post("/connection", async (req, res) => {
  res = req.body;
  console.log(res);
});

app.listen(port, () => {
  console.log(`the server is live on http://localhost:${port}`);
});
