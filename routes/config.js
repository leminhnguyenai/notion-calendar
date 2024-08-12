const express = require("express");
const router = express.Router();
const fs = require("fs");
const axios = require("axios");
const updateFiles = require(".././modules/updateFiles.js");

router.get("/", (req, res) => {
  fs.readFile("./config.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      data = JSON.parse(data);
      res.json(data);
    }
  });
});

router.patch("/", async (req, res) => {
  let newRefreshRate = req.body.refreshRate;
  try {
    await axios.post(`http://localhost:6060/update`, {
      command: "stop",
    });
    await updateFiles("./config.json", (data) => {
      if (data == "ENOENT" || typeof data != "object")
        data = {
          refreshRate: 60000,
        };
      else data.refreshRate = newRefreshRate;
      return data;
    });
    console.log("Config updated");
  } catch (err) {
    console.error(err);
  } finally {
    await axios.post(`http://localhost:6060/update`, {
      command: "start",
    });
    res.send("Config updated");
  }
});

module.exports = router;
