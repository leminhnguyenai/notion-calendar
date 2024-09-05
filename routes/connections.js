const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const updateFiles = require("../modules/updateFiles.js");
const { GoogleCalendarAPI } = require(".././modules/googleCalendarAPICustomFuncs.js");
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
      connection.calendarId = await calendarClient.createCalendar(connection.calendarName);
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
          calendarClient.updateCalendar(newConnection.calendarId, newConnection.calendarName).catch((err) => {
            console.error(err);
            throw new err();
          });

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
        await calendarClient.deleteCalendar(calendarId);
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
