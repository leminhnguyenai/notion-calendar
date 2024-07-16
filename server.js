const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const newEvent = require("./modules/createEvent.js");
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
  const connection = req.body;
  console.log(connection);
  fs.readFile("connections.json", "utf8", (err, data) => {
    if (err) {
      console.log("error reading file");
      return;
    } else {
      let existingData = JSON.parse(data);
      console.log(data);
      existingData.push(connection);
      fs.writeFile(
        "connections.json",
        JSON.stringify(existingData, null, 2),
        "utf8",
        (err) => {}
      );
    }
  });
});

// Hosting calendar
app.get("/calendar.ics", bodyParser.json(), (req, res) => {
  const icsPath = path.join(__dirname, "calendar.ics");
  res.setHeader("Content-Type", "text/calendar");
  res.sendFile(icsPath);
});

//Update tab
app
  .route("/update")
  .get((req, res) => {
    const filePath = path.join(__dirname, "/views/update.html");
    res.sendFile(filePath);
  })
  .post((req, res) => {
    fs.readFile("connections.json", "utf8", async (err, data) => {
      if (err) {
        console.log("error reading file");
        return;
      } else {
        let existingData = JSON.parse(data);
        let length = existingData.length;
        for (let j = 0; j <= length - 1; j++) {
          const response = await notion.databases.query({
            database_id: existingData[j].databaseId,
            filter: {
              property: existingData[j].columnName,
              date: {
                is_not_empty: true,
              },
            },
          });
          console.log(JSON.stringify(response, null, 2));
          let eventsLength = response.results.length;
          let calendarData = `BEGIN:VCALENDAR\nVERSION:2.0\nPROID:My calendar\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n\n`;
          for (let i = 0; i <= eventsLength - 1; i++) {
            calendarData +=
              newEvent(
                response.results[i].properties["Name"].title[0].plain_text,
                response.results[i].properties["Notes"].rich_text,
                response.results[i].properties[existingData[j].columnName].date
                  .start,
                response.results[i].properties[existingData[j].columnName].date
                  .end
              ) + "\n\n";
          }
          calendarData += `\nEND:VCALENDAR`;
          fs.writeFile("calendar.ics", calendarData, "utf8", (err) => {
            if (err) console.log(err);
            else console.log("Done !");
          });
        }
      }
    });
  });

app.listen(port, () => {
  console.log(`the server is live on http://localhost:${port}`);
});
