const express = require("express");
const router = express.Router();
const AppError = require("../AppError.js");
const { INVALID_INPUT } = require("../ErrorCode.js");
const { CONFIG_PATH } = require("../../../Paths.js");
const { tryCatch } = require("../utils/tryCatch.js");
const updateFile = require("../utils/updateFile.js");
const checkFileExistIfNotCreate = require("../utils/checkFileExistIfNotCreate.js");
const configErrorHandler = require("../middleware/configErrorHandler.js");
const fs = require("fs").promises;

let busyPatching = false;

// Check if the route is busy or not
router.use((req, res, next) => {
  const method = req.method;
  if (method == "PATCH") return !busyPatching ? next() : res.status(429).send("Too many request");
  next();
});
router.use(checkFileExistIfNotCreate(CONFIG_PATH));

router.get(
  "/",
  tryCatch(async (req, res) => {
    const config = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
    res.status(200).json(config);
  })
);

router.patch(
  "/",
  tryCatch(async (req, res) => {
    busyPatching = true;
    const refreshRate = req.body.refreshRate;
    if (typeof refreshRate != "number") {
      busyPatching = false;
      throw new AppError(INVALID_INPUT, "The input must be a number", 405);
    }
    await updateFile(CONFIG_PATH, () => req.body);
    //TODO Replace this comment with the code for sending and recieving data from the background workers
    res.status(200).send("Config updated");
    busyPatching = false;
  })
);

router.use(configErrorHandler);

module.exports = router;
