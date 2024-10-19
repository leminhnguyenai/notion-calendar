import cors from "cors";
import express, { Application, Request, Response } from "express";
import update from "./routes/update";
import JobQueue from "./services/jobQueue";
const app: Application = express();
const jobQueue = new JobQueue();

app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("scheduler is on");
});

app.use("/update", update(jobQueue));

export default app;
