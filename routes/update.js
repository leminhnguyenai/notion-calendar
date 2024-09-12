const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const updateFiles = require("../modules/updateFiles.js");
const syncCalendar = require(".././modules/updateCalendar.js");
const { findData, doneStatus } = require(".././modules/findData.js");
const { GoogleCalendarAPI } = require(".././modules/googleCalendarAPICustomFuncs.js");
require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });
const calendarClient = new GoogleCalendarAPI({
  credentials_path: path.join(__dirname, "../oauth/credentials.json"),
  token_path: path.join(__dirname, "../oauth/token.json"),
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.events.readonly",
    "https://www.googleapis.com/auth/calendar.settings.readonly",
    "https://www.googleapis.com/auth/calendar.addons.execute",
  ],
});

let intervalId = null;

function startInterval(refreshRate) {
  let count = 0;
  try {
    intervalId = setInterval(() => {
      if (count % refreshRate == 0) {
        try {
          axios.get(`http://localhost:${port}/api/update`);
        } catch (err) {
          console.error(err);
          stopInterval(intervalId);
        }
      }
      count += 1000;
    }, 1000);
    console.log("Interval started");
  } catch (err) {
    console.error(err);
    throw err;
  }
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
        database_id: connection.database.value,
        filter: {
          property: connection.date.name,
          date: {
            is_not_empty: true,
          },
        },
        sorts: [
          {
            property: connection.date.name,
            direction: "ascending",
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
    // Format notion data
    let notionCalEventsList = [];
    for (let i = 0; i <= notionData.results.length - 1; i++) {
      try {
        let done;
        if (connection.doneMethod.name == "" || connection.doneMethod.value == "") {
          done = "";
        } else {
          done = await doneStatus(
            notionData.results[i],
            connection.doneMethod.name,
            connection.doneMethodOption.value
          );
        }
        notionCalEventsList.push({
          page_id: notionData.results[i].id,
          summary: `${done}${await findData(notionData.results[i], connection.name.name)}`,
          description: await findData(notionData.results[i], connection.description.name),
          created_time: notionData.results[i].created_time,
          start_date: notionData.results[i].properties[connection.date.name].date.start,
          end_date: notionData.results[i].properties[connection.date.name].date.end,
        });
      } catch (err) {
        console.error(err);
      }
    }
    // Get data from google Calendar
    let googleCalData;
    try {
      googleCalData = await calendarClient.getEvents(connection.calendarId, 250);
    } catch (err) {
      console.error(err);
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
    // Sync notion calendar with google Calendar
    try {
      await updateFiles(
        `./relationTbs/relationTb_${connection.calendarId}.json`,
        async (relationTb) => {
          if (relationTb == "ENOENT" || !Array.isArray(relationTb)) relationTb = [];
          const response = await syncCalendar(
            connection.calendarId,
            notionCalEventsList,
            googleCalEventsList,
            relationTb
          );
          relationTb = response.relationTb;
          let changelog = response.changelog;
          console.log(`Calendar ID: ${connection.calendarId}`);
          console.log(`Change log:\n${changelog}`);
          return relationTb;
        }
      );
    } catch (err) {
      console.error(err);
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
        stopInterval();
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
