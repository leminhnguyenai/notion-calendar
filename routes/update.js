const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const updateFiles = require("../modules/updateFiles.js");
const syncCalendar = require(".././modules/updateCalendar.js");
const { findData, doneStatus } = require(".././modules/findData.js");
const { authorize, getEvents } = require(".././modules/googleCalendarAPICustomFuncs.js");
require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });
const CREDENTIALS_PATH = path.join(__dirname, "../oauth/credentials.json");
const TOKEN_PATH = path.join(__dirname, "../oauth/token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.settings.readonly",
  "https://www.googleapis.com/auth/calendar.addons.execute",
];

let intervalId = null;

function startInterval(refreshRate) {
  let count = 0;
  intervalId = setInterval(() => {
    if (count % refreshRate == 0) {
      axios.get(`http://localhost:${port}/api/update`).catch((err) => {
        console.error(err);
      });
    }
    count += 1000;
  }, 1000);
  console.log("Interval started");
}

function stopInterval() {
  clearInterval(intervalId);
  console.log("Interval stopped");
  intervalId = null;
}

router.use(express.json());

router.get("/", async (req, res) => {
  // Get the connections list
  let connectionsList;
  try {
    connectionsList = fs.readFileSync("connections.json", "utf8");
    connectionsList = JSON.parse(connectionsList);
  } catch (err) {
    console.error(err);
  }
  // Update for each connection
  for (const connection of connectionsList) {
    // Get data from notion
    let notionData;
    try {
      notionData = await notion.databases.query({
        database_id: connection.databaseId,
        filter: {
          property: connection.dateColumn,
          date: {
            is_not_empty: true,
          },
        },
        sorts: [
          {
            property: connection.dateColumn,
            direction: "ascending",
          },
        ],
      });
    } catch (err) {
      console.error(err);
      reject();
    }
    // Format notion data
    let notionCalEventsList = [];
    for (let i = 0; i <= notionData.results.length - 1; i++) {
      try {
        notionCalEventsList.push({
          page_id: notionData.results[i].id,
          summary: `${await doneStatus(
            notionData.results[i],
            connection.doneMethod,
            connection.doneMethodOptionId
          )}${await findData(notionData.results[i], connection.nameColumn)}`,
          description: await findData(notionData.results[i], connection.descriptionColumn),
          created_time: notionData.results[i].created_time,
          start_date: notionData.results[i].properties[connection.dateColumn].date.start,
          end_date: notionData.results[i].properties[connection.dateColumn].date.end,
        });
      } catch (err) {
        console.error(err);
        reject();
      }
    }
    console.log(`Notion events:\n${JSON.stringify(notionCalEventsList, null, 2)}`);
    // Get data from google Calendar
    let googleCalData;
    try {
      let auth = await authorize(CREDENTIALS_PATH, TOKEN_PATH, SCOPES);
      googleCalData = await getEvents(auth, connection.calendarId, 250);
    } catch (err) {
      console.error(err);
      reject();
    }
    // Format google Calendar data
    let googleCalEventsList = [];
    for (let i = 0; i <= googleCalData.length - 1; i++) {
      googleCalEventsList.push({
        event_id: googleCalData[i].id,
        summary: googleCalData[i].summary,
        description: googleCalData[i].description || "",
        start_date: googleCalData[i].start.dateTime,
        end_date: googleCalData[i].end.dateTime,
      });
    }
    console.log(`Google Calendar events:\n${JSON.stringify(googleCalEventsList, null, 2)}`);
    // Sync notion calendar with google Calendar
    try {
      await updateFiles(`./relationTbs/relationTb_${connection.calendarId}.json`, async (relationTb) => {
        if (relationTb == "ENOENT" || !Array.isArray(relationTb)) relationTb = [];
        const response = await syncCalendar(
          connection.calendarId,
          notionCalEventsList,
          googleCalEventsList,
          relationTb
        );
        relationTb = response.relationTb;
        let changelog = response.changelog;
        console.log(`Updated relationTb:\n${JSON.stringify(relationTb, null, 2)}`);
        console.log(`Change log:\n${changelog}`);
        return relationTb;
      });
    } catch (err) {
      console.error(err);
      reject();
    }
  }
});

router.post("/", async (req, res) => {
  let command = req.body.command;
  if (command == "start") {
    fs.readFile("./config.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        let refreshRate = JSON.parse(data).refreshRate;
        startInterval(refreshRate);
        res.send("Interval started");
      }
    });
  } else if (command == "stop") {
    stopInterval();
    res.send("Interval stopped");
  }
});

module.exports = router;
