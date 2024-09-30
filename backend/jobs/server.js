const express = require("express");
const cors = require("cors");
const app = express();
const AppError = require("./AppError.js");
const backgroundWorks = require("./backgroundWorks.js");
const jobQueue = require("./jobQueue.js");
const { tryCatch } = require("./utils/tryCatch.js");
const wait = require("./utils/wait.js");
const backgroundErrorHandler = require("./middleware/backgroundErrorHandler.js");
const { watch, reactive, ref } = require("vue");
const _ = require("lodash");
const port = 6061;

// Route to recieve changes from REST api
app.use(cors());
app.use(express.json());

app.post(
  "/",
  tryCatch(async (req, res) => {
    let id = `${new Date().toISOString()}_${req.body.type}_${req.body.method}`;
    let request = {
      id: id,
      job: req.body,
      status: null,
    };
    jobQueue.activeQueue.push(_.cloneDeep(request));
    console.log("Added to queue");
    const response = await jobQueue.response(request.id);
    if (response.status == 200) {
      console.log("Request processed successfully");
      res.status(200).send("Request processed successfully");
    } else {
      console.log(response.error);
      throw new AppError(
        response.error.errorCode,
        response.error.message,
        response.error.statusCode
      );
    }
  })
);

app.get(
  "/status",
  tryCatch(async (req, res) => {
    let timeSinceLastSync = new Date() - backgroundWorks.latestSyncedTime;
    if (typeof timeSinceLastSync != "number") throw new AppError(404, "Error fetching time", 404);
    timeSinceLastSync /= 1000 * 60;
    timeSinceLastSync = Math.floor(timeSinceLastSync);
    res.status(200).json({ timeSinceLastSync });
  })
);

app.use(backgroundErrorHandler);

// Start the job queue
jobQueue.init();

app.listen(port, async () => {
  try {
    await wait(() => jobQueue.activate);
    // Initialize the background processes
    await backgroundWorks.init();
    console.log(`The server is live on http://localhost:${port}`);
    // Start the background task
    await backgroundWorks.createTask();
    backgroundWorks.startTask();
  } catch (err) {
    console.error("Failed to initialize background processes:", err);
    process.exit(1);
  }
});
