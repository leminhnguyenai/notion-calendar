const express = require("express");
const router = express.Router();
const axios = require("axios");

router.use(express.json());

router
  .route("/connections")
  .get(async (req, res) => {
    let unformattedConnectionsList;
    try {
      unformattedConnectionsList = await axios.get(`http://localhost:${port}/api/connections`);
      let formattedConnectionsList = [];
      for (connection of unformattedConnectionsList.data) {
        formattedConnectionsList.push({
          calendarId: connection.calendarId,
          database: {
            name: connection.databaseName,
            value: connection.databaseId,
          },
          date: {
            name: connection.dateColumn,
            value: connection.dateColumnId,
          },
          name: {
            name: connection.nameColumn,
            value: connection.nameColumnId,
          },
          description: {
            name: connection.descriptionColumn,
            value: connection.descriptionColumnId,
          },
          doneMethod: {
            name: connection.doneMethod,
            value: connection.doneMethodId,
          },
          doneMethodOption: {
            name: connection.doneMethodOptionName,
            value: connection.doneMethodOptionId,
          },
        });
      }
      res.json(formattedConnectionsList);
    } catch (err) {
      console.error(err);
      res.send(err);
    }
  })
  .post(async (req, res) => {
    let unformattedConnection = req.body;
    let formattedConnection = {
      calendarId: "",
      databaseName: unformattedConnection.database.name,
      databaseId: unformattedConnection.database.value,
      dateColumn: unformattedConnection.date.name,
      dateColumnId: unformattedConnection.date.value,
      nameColumn: unformattedConnection.name.name,
      nameColumnId: unformattedConnection.name.value,
      descriptionColumn: unformattedConnection.description.name,
      descriptionColumnId: unformattedConnection.description.value,
      doneMethod: unformattedConnection.doneMethod.name,
      doneMethodId: unformattedConnection.doneMethod.value,
      doneMethodOptionName: unformattedConnection.doneMethodOption.name,
      doneMethodOptionId: unformattedConnection.doneMethodOption.value,
    };
    try {
      await axios.post(
        `http://localhost:${port}/api/connections`,
        JSON.parse(JSON.stringify(formattedConnection, null, 2))
      );
      res.status("200").send("Data added successfully");
    } catch (err) {
      console.error(err);
      res.status("404").send("Data adding failed");
    }
  })
  .patch(async (req, res) => {
    let unformattedConnection = req.body;
    let formattedConnection = {
      calendarId: unformattedConnection.calendarId,
      databaseName: unformattedConnection.database.name,
      databaseId: unformattedConnection.database.value,
      dateColumn: unformattedConnection.date.name,
      dateColumnId: unformattedConnection.date.value,
      nameColumn: unformattedConnection.name.name,
      nameColumnId: unformattedConnection.name.value,
      descriptionColumn: unformattedConnection.description.name,
      descriptionColumnId: unformattedConnection.description.value,
      doneMethod: unformattedConnection.doneMethod.name,
      doneMethodId: unformattedConnection.doneMethod.value,
      doneMethodOptionName: unformattedConnection.doneMethodOption.name,
      doneMethodOptionId: unformattedConnection.doneMethodOption.value,
    };
    try {
      await axios.patch(
        `http://localhost:${port}/api/connections`,
        JSON.parse(JSON.stringify(formattedConnection, null, 2))
      );
      res.status("200").send("Data updated successfully");
    } catch (err) {
      console.error(err);
      res.status("404").send("Data updating failed");
    }
  });

module.exports = router;
