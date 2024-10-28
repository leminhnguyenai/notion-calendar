import express from "express";
import isJob from "../@types/isJob";
import { BaseError } from "../Errors";
import updateErrorHandler from "../middlewares/errorHandlers/updateErrorHandlers";
const update = (jobQueueReference) => {
    const router = express.Router();
    router.use(express.json());
    router.post("/", async (req, res, next) => {
        try {
            const newJob = JSON.parse(JSON.stringify(req.body));
            if (!isJob(newJob))
                throw new BaseError("Invalid Job input", 400);
            const id = `${new Date().toISOString()}_${req.body.type}_${req.body.method}`;
            const newReq = {
                status: 0,
                id: id,
                job: req.body,
            };
            jobQueueReference.addToQueue(newReq);
            const response = await jobQueueReference.response(newReq.id);
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    });
    router.use(updateErrorHandler);
    return router;
};
export default update;
