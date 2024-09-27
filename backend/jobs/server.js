const express = require("express");
const cors = require("cors");
const app = express();
const AppError = require("./AppError.js");
const backgroundWorks = require("./backgroundWorks.js");
const handlingJob = require("./handlingJob.js");
const { tryCatch } = require("./utils/tryCatch.js");
const wait = require("./utils/wait.js");
const backgroundErrorHandler = require("./middleware/backgroundErrorHandler.js");
const { watch, reactive, ref } = require("vue");
const _ = require("lodash");
const port = 6061;

let jobQueue = reactive([]);

// Route to recieve changes from REST api
app.use(cors());
app.use(express.json());

app.post(
  "/",
  tryCatch(async (req, res) => {
    let id = `${new Date().toISOString}_${req.body.type}_${req.body.method}`;
    let request = {
      id: id,
      job: req.body,
      statusCode: undefined,
    };
    jobQueue.push(_.cloneDeep(request));
    console.log("Added to queue");
    const processingRequest = () => jobQueue.find((rq) => rq.id == id);
    await wait(() => processingRequest().statusCode !== undefined);
    if (processingRequest().statusCode == 200) {
      console.log("Request processed successfully");
      res.status(200).send("Request processed successfully");
    } else {
      console.log("Error processing the request");
      throw new AppError(activeRequest().statusCode, "Error processing the request", 400);
    }
  })
);

app.use(backgroundErrorHandler);

// Initalize the background process
backgroundWorks.init().then(async () => {
  backgroundWorks.createTask();
  backgroundWorks.startTask();
});

// Job queue processor
let queueProcessing = ref(false);

watch(jobQueue, () => (queueProcessing.value = jobQueue.length > 0 ? true : false));
watch(queueProcessing, async () => {
  if (queueProcessing.value) {
    length = jobQueue.length;
    for (let i = 0; i < length; i++) {
      try {
        let job = jobQueue[i].job;
        await handlingJob.init(job);
        jobQueue.statusCode = 200;
      } catch (err) {
        jobQueue[i].statusCode = 400;
        console.log(err);
      }
      length = jobQueue.length;
    }
  }
});

app.listen(port, () => {
  console.log(`The server is live on http://localhost:${port}`);
});

// TODO: Fix bug where faulty request is not processed the right way
