const express = require("express");
const router = express.Router();
const AppError = require("../AppError.js");
const { CONS_DB_PATH } = require("../../../Paths.js");
const { tryCatch } = require("../utils/tryCatch.js");
const checkFileExistIfNotCreate = require("../middleware/checkFileExistIfNotCreate.js");
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
router.use(checkFileExistIfNotCreate(CONS_DB_PATH, `[]`));

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
    // Sending change to the jobs queue to be processed by background workers
    try {
      const jobQueueResponse = await fetch("http://localhost:6061", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CONNECTION",
          method: "POST",
          data: newCon,
        }),
      });

      if (jobQueueResponse.status != 200) {
        throw new AppError(
          jobQueueResponse.status,
          await jobQueueResponse.text(),
          jobQueueResponse.status
        );
      }
      const jsonResponse = await jobQueueResponse.json();

      res.status(200).json({
        message: "Added sucessfully",
        responseData: jsonResponse.responseData,
      });
      busyPosting = false;
    } catch (err) {
      busyPosting = false;
      throw err;
    }
  })
);

router.patch(
  "/",
  tryCatch(async (req, res) => {
    busyPatching = true;
    const updatedCon = req.body;
    try {
      const jobQueueResponse = await fetch("http://localhost:6061", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CONNECTION",
          method: "PATCH",
          data: updatedCon,
        }),
      });

      if (jobQueueResponse.status != 200) {
        throw new AppError(
          jobQueueResponse.status,
          await jobQueueResponse.text(),
          jobQueueResponse.status
        );
      }
      res.status(200).json({
        message: "Updated sucessfully",
      });
      busyPatching = false;
    } catch (err) {
      busyPatching = false;
      throw err;
    }
  })
);

router.delete(
  "/",
  tryCatch(async (req, res) => {
    busyDeleting = true;
    const deletingCalendarId = req.body.calendarId;
    console.log(req.body);
    try {
      //TODO change this to using axios without getting error
      const jobQueueResponse = await fetch("http://localhost:6061", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CONNECTION",
          method: "DELETE",
          data: { calendarId: deletingCalendarId },
        }),
      });

      if (jobQueueResponse.status != 200) {
        throw new AppError(
          jobQueueResponse.status,
          await jobQueueResponse.text(),
          jobQueueResponse.status
        );
      }
      res.status(200).json({
        message: "Deleted successfully",
      });
      busyDeleting = false;
    } catch (err) {
      busyDeleting = false;
      throw err;
    }
  })
);

router.use(connectionsErrorHandler);

module.exports = router;
