const express = require("express");
const router = express.Router();
const AppError = require("../AppError.js");
const { NO_CONNECTION_FOUND } = require("../ErrorCode.js");
const { CONS_DB_PATH } = require("../../../Paths.js");
const { tryCatch } = require("../utils/tryCatch.js");
const updateFile = require("../utils/updateFile.js");
const checkFileExistIfNotCreate = require("../utils/checkFileExistIfNotCreate.js");
const connectionsErrorHandler = require("../middleware/connectionsErrorHandler.js");
const fs = require("fs").promises;

let busyPosting = false;
let busyPatching = false;
let busyDeleting = false;

// Check if the route is busy or not
router.use((req, res, next) => {
  const method = req.method;
  if (method == "POST") return !busyPosting ? next() : res.status(429).send("Too many request");
  if (method == "PATCH") return !busyPatching ? next() : res.status(429).send("Too many request");
  if (method == "DELETE") return !busyDeleting ? next() : res.status(429).send("Too many request");
  next();
});
router.use(checkFileExistIfNotCreate(CONS_DB_PATH));

router.get(
  "/",
  tryCatch(async (req, res) => {
    const data = await fs.readFile(CONS_DB_PATH, "utf8");
    res.status(200).json(JSON.parse(data));
  })
);

router.post(
  "/",
  tryCatch(async (req, res) => {
    busyPosting = true;
    const newCon = req.body;
    await updateFile(CONS_DB_PATH, (data) => (data.push(newCon), data));
    //TODO Replace this comment with the code for sending and recieving data from the background workers
    res.status(200).json(newCon);
    busyPosting = false;
  })
);

router.patch(
  "/",
  tryCatch(async (req, res) => {
    busyPatching = true;
    const updatedCon = req.body;
    await updateFile(CONS_DB_PATH, (data) => {
      const newData = data.map((connection) =>
        connection.calendarId === updatedCon.calendarId ? updatedCon : connection
      );
      if (JSON.stringify(newData) == JSON.stringify(data)) {
        busyPatching = false;
        throw new AppError(NO_CONNECTION_FOUND, "Can't find the connection in the database", 404);
      } else return newData;
    });
    //TODO Replace this comment with the code for sending and recieving data from the background workers
    res.status(200).json(newCon);
    busyPatching = false;
  })
);

router.delete(
  "/",
  tryCatch(async (req, res) => {
    busyDeleting = true;
    const deletingCalendarId = req.body.calendarId;
    await updateFile(CONS_DB_PATH, (data) => {
      const newData = data.filter((connections) => connections.calendarId != deletingCalendarId);
      if (JSON.stringify(data) == JSON.stringify(newData)) {
        busyDeleting = false;
        throw new AppError(NO_CONNECTION_FOUND, "Can't find the connection in the database", 404);
      } else return newData;
    });
    //TODO Replace this comment with the code for sending and recieving data from the background workers
    res.status(200).send("Deleted");
    busyDeleting = false;
  })
);

router.use(connectionsErrorHandler);

module.exports = router;
