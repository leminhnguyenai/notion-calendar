const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const equal = require("fast-deep-equal");
const updateFiles = require("../modules/updateFiles.js");
const { authorize, createCalendar, deleteCalendar } = require("../modules/googleCalendarAPICustomFuncs.js");
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

router.use(express.json());

// Sending list of connections
router.get("/", async (req, res) => {
  fs.readFile("./connections.json", (err, data) => {
    if (err) {
      console.log("Error");
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Adding new connections to the list
router.post("/", async (req, res) => {
  try {
    await axios.post(`http://localhost:6060/api/update`, {
      command: "stop",
    });
    const connection = req.body;
    await updateFiles("connections.json", async (data) => {
      if (data == "ENOENT" || !Array.isArray(data)) data = [];
      let auth = await authorize(CREDENTIALS_PATH, TOKEN_PATH, SCOPES);
      connection.calendarId = await createCalendar(auth, connection.databaseName);
      console.log(`Adding new connection:\n${JSON.stringify(connection, null, 2)}`);
      data.push(connection);
      res.json(connection);
      return data;
    });
  } catch (err) {
    console.error(err);
    res.send(`Error sending file: ${err}`);
  } finally {
    await axios.post(`http://localhost:6060/api/update`, {
      command: "start",
    });
  }
});

// Update a connection
router.patch("/", async (req, res) => {
  try {
    await axios.post(`http://localhost:6060/api/update`, {
      command: "stop",
    });
    let newConnection = req.body;
    console.log(req.body);
    await updateFiles("connections.json", async (data) => {
      if (data == "ENOENT" || !Array.isArray(data)) data = [];
      let newData = data.map((connection) => {
        if (connection.calendarId == newConnection.calendarId) {
          return newConnection;
        } else return connection;
      });
      res.status(200).send("Update successfully");
      return newData;
    });
  } catch (err) {
    console.error(err);
    res.status(404).send(`Error sending file: ${err}`);
  } finally {
    await axios.post(`http://localhost:6060/api/update`, {
      command: "start",
    });
  }
});

// Delete a connection
router.delete("/", async (req, res) => {
  let calendarId = req.body.calendarId;
  await updateFiles("connections.json", async (connections) => {
    if (connections == "ENOENT" || !Array.isArray(connections)) connections = [];
    let deleteConnectionIndex = connections.findIndex((connection) => connection.calendarId == calendarId);
    if (deleteConnectionIndex == -1) {
      console.log("No connection found");
      res.status(404).send("No connection found");
    } else {
      try {
        await axios.post(`http://localhost:6060/api/update`, {
          command: "stop",
        });
        let auth = await authorize(CREDENTIALS_PATH, TOKEN_PATH, SCOPES);
        await deleteCalendar(auth, calendarId);
        let file_path = `./relationTbs/relationTb_${connections[deleteConnectionIndex].calendarId}.json`;
        try {
          fs.unlinkSync(file_path);
        } catch (err) {
          if (err.code != "ENOENT") {
            throw err;
          }
        }
        connections.splice(deleteConnectionIndex, 1);
        console.log("Delete successfully");
        res.status(200).send("Delete successfully");
      } catch (err) {
        console.log("Error caught:", err);
        res.status(502).send(`Error: ${err}`);
      } finally {
        await axios.post(`http://localhost:6060/api/update`, {
          command: "start",
        });
      }
    }
    return connections;
  });
});

module.exports = router;
