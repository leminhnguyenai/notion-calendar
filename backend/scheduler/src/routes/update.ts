import express, { NextFunction, Request, Response, Router } from "express";
import { JobRequest } from "../@types/JobRequest";
import isJob from "../@types/isJob";
import { BaseError } from "../Errors";
import updateErrorHandler from "../middlewares/errorHandlers/updateErrorHandlers";
import { JobQueueType } from "../services/jobQueue";

const update = (jobQueueReference: JobQueueType): Router => {
    const router: Router = express.Router();
    router.use(express.json());

    router.post("/", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newJob = JSON.parse(JSON.stringify(req.body));
            if (!isJob(newJob)) throw new BaseError("Invalid Job input", 400);
            const id = `${new Date().toISOString()}_${req.body.type}_${req.body.method}`;
            const newReq: JobRequest = {
                status: 0,
                id: id,
                job: req.body,
            };
            jobQueueReference.addToQueue(newReq);
            const response = await jobQueueReference.response(newReq.id);
            res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    });

    router.use(updateErrorHandler);

    return router;
};

export default update;
