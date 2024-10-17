import express, { NextFunction } from "express";
import { Request, Response } from "express";
import jobQueue from "./jobQueue";
import isJobRequest from "../../types-guard/isJobRequest";
import { BaseError } from "./Error";
import { JobRequest } from "../../@types/job";
import isJob from "../../types-guard/isJob";
const app = express();
const PORT = 6061;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("The scheduler is live");
});

app.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!isJob(req.body)) throw new BaseError("Invalid job", 400);
        const id = `${new Date().toISOString()}_${req.body.type}_${req.body.method}`;
        const newReq: JobRequest = {
            status: 0,
            id: id,
            job: req.body,
        };
        if (!isJobRequest(newReq)) throw new BaseError("Invalid request", 400);
        jobQueue.activeQueue.push(newReq);
        const finalReq = await jobQueue.response(newReq.id);
        if (!finalReq || finalReq.status == 0)
            throw new BaseError("Error getting the request from job queue", 404);
        else if (finalReq.status == 400 || finalReq.status == 404 || finalReq.status == 502)
            throw new BaseError(finalReq.error, finalReq.status);
        if (finalReq.status == 200) res.status(200).json(finalReq.respondData);
    } catch (err) {
        next(err);
    }
});

app.listen(PORT, () => {
    jobQueue.init();
    console.log(`The API is live on http://localhost:${PORT}`);
});
