import cors from "cors";
import express from "express";
import update from "./routes/update";
import JobQueue from "./services/jobQueue";
const app = express();
const jobQueue = new JobQueue();
app.use(cors());
app.get("/", (req, res) => {
    res.status(200).send("scheduler is on");
});
app.use("/update", update(jobQueue));
export default app;
