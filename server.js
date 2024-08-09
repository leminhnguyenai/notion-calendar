const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const equal = require("fast-deep-equal");
const { google } = require("googleapis");
const { findData, doneStatus } = require("./modules/findData.js");
const { authorize, createCalendar, deleteCalendar, getEvents } = require("./modules/googleCalendarAPICustomFuncs.js");
const syncCalendar = require("./modules/updateCalendar.js");
const updateFiles = require("./modules/updateFiles.js");
require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });
const CREDENTIALS_PATH = path.join(__dirname, "/oauth/credentials.json");
const TOKEN_PATH = path.join(__dirname, "/oauth/token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.settings.readonly",
  "https://www.googleapis.com/auth/calendar.addons.execute",
];
port = 6060;
// Interval variabled & functions
let intervalId = null;

function startInterval(refreshRate) {
  let count = 0;
  intervalId = setInterval(() => {
    if (count % refreshRate == 0) {
      axios.get(`http://localhost:${port}/update`).catch((err) => {
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

app.use(express.static("public"));
app.use(express.json());
app.use(require("express-status-monitor")());

app.get("/", (req, res) => {
  res.send("notion-calendar is on");
});

// Handle connections
app
  .route("/connections")
  // Sending list of connections
  .get(async (req, res) => {
    fs.readFile("./connections.json", (err, data) => {
      if (err) {
        console.log("Error");
      } else {
        res.json(JSON.parse(data));
      }
    });
  })
  // Adding new connections to the list
  .post(async (req, res) => {
    const connection = req.body;
    await updateFiles("connections.json", async (data) => {
      if (Object.keys(data).length === 0 && data.constructor === Object) data = [];
      let auth = await authorize(CREDENTIALS_PATH, TOKEN_PATH, SCOPES);
      connection.calendarId = await createCalendar(auth, connection.databaseName);
      console.log(`Adding new connection:\n${JSON.stringify(connection, null, 2)}`);
      data.push(connection);
      res.json(connection);
      return data;
    });
  })
  // Update a connection
  .patch(async (req, res) => {
    let newConnection = req.body;
    await updateFiles("connections.json", async (data) => {
      if (Object.keys(data).length === 0 && data.constructor === Object) data = [];
      let newData = data.map((connection) => {
        if (connection.calendarId == newConnection.calendarId && !equal(connection, newConnection)) {
          return newConnection;
        }
      });
      return newData;
    });
  })
  .delete(async (req, res) => {
    let calendarId = req.body.calendarId;
    await updateFiles("connections.json", async (data) => {
      if (Object.keys(data).length === 0 && data.constructor === Object) data = [];
      let calendarIdList = data.map((connection) => connection.calendarId);
      let deleteConnectionNo = calendarIdList.indexOf(calendarId);
      if (deleteConnectionNo == -1) {
        console.log("No connection found");
        res.send("No connection found");
      } else {
        data.splice(deleteConnectionNo, 1);
        let auth = await authorize(CREDENTIALS_PATH, TOKEN_PATH, SCOPES);
        await deleteCalendar(auth, calendarId)
          .catch((err) => {
            console.error("Error caught:", err);
            res.send(`Error: ${err}`);
          })
          .then(() => {
            console.log("Delete successfully");
            res.send("Delete successfully");
          });
      }
      return data;
    });
  });

// Handling update calendar
app
  .route("/update")
  .get(async (req, res) => {
    // Get the connections list
    let connectionsList;
    try {
      connectionsList = fs.readFileSync("connections.json", "utf8");
      connectionsList = JSON.parse(connectionsList);
    } catch (err) {
      console.error(err);
    }
    // Update for each connection
    const sync = connectionsList.map((connection) => {
      return new Promise(async (resolve, reject) => {
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
              summary: await findData(notionData.results[i], connection.nameColumn),
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
        let relationTb;
        try {
          relationTb = fs.readFileSync("relationTb.json", "utf8");
          relationTb = JSON.parse(relationTb);
        } catch (err) {
          console.error(err);
          reject();
        }
        try {
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
        } catch (err) {
          console.error(err);
          reject();
        }
        // Update relation table
        try {
          await updateFiles("relationTb.json", (data) => {
            data = relationTb;
            return data;
          });
          res.send("Sync successfully");
        } catch (err) {
          console.error(err);
          reject();
        }
      });
    });
    await Promise.all(sync);
  })
  .post(async (req, res) => {
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

// Handling config
app
  .route("/config")
  .get((req, res) => {
    fs.readFile("./config.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        data = JSON.parse(data);
        res.json(data);
      }
    });
  })
  .patch(async (req, res) => {
    let newRefreshRate = req.body.refreshRate;
    try {
      await updateFiles("./config.json", (data) => {
        data.refreshRate = newRefreshRate;
        return data;
      });
      console.log("Config updated");
    } catch (err) {
      console.error(err);
    } finally {
      stopInterval();
      startInterval(newRefreshRate);
      res.send("Config updated");
    }
  });
app.listen(port, () => {
  console.log(`The server is live on http://localhost:${port}`);
  fs.readFile("./config.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      let refreshRate = JSON.parse(data).refreshRate;
      startInterval(refreshRate);
    }
  });
});
