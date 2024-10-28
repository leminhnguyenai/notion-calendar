import isJobRequest from "../@types/isJobRequest";
import { BaseError } from "../Errors";
import jobHandling from "./jobHandling";
class JobQueue {
    constructor( /* scheduler : object */) {
        this.activeQueue = [];
        this.processedQueue = [];
        this.activate = false;
    }
    addToQueue(req) {
        const reqToAdd = JSON.parse(JSON.stringify(req));
        if (!isJobRequest(reqToAdd))
            throw new BaseError("Invalid request input", 403);
        this.activeQueue.push(reqToAdd);
        if (!this.activate) {
            this.activate = true;
            this.requestsProcessor();
        }
    }
    async requestsProcessor() {
        while (this.activate) {
            if (this.activeQueue.length > 0) {
                try {
                    const processedReq = JSON.parse(JSON.stringify(this.activeQueue[0]));
                    const jobRes = await jobHandling.init(processedReq.job);
                    processedReq.status = 200;
                    if (processedReq.status == 200) {
                        if (jobRes)
                            processedReq.respondData = jobRes;
                        else
                            processedReq.respondData = {};
                    }
                    this.processedQueue.push(processedReq);
                }
                catch (err) {
                    const failedReq = JSON.parse(JSON.stringify(this.activeQueue[0]));
                    if (err instanceof BaseError) {
                        failedReq.status = err.statusCode;
                        if (failedReq.status == err.statusCode)
                            failedReq.error = err.message;
                    }
                    else if (err instanceof Error) {
                        failedReq.status = 400;
                        if (failedReq.status == 400)
                            failedReq.error = err.message;
                    }
                    else {
                        failedReq.status = 400;
                        if (failedReq.status == 400)
                            failedReq.error = "Unknown error occurs";
                    }
                    this.processedQueue.push(failedReq);
                }
                this.activeQueue.splice(0, 1);
            }
            else {
                this.activate = false;
            }
        }
    }
    async response(id) {
        let processing = true;
        const targetRequest = () => this.processedQueue.find((req) => req.id == id);
        while (processing) {
            if (targetRequest())
                processing = false;
            else
                await new Promise((resolve) => setTimeout(resolve, 50));
        }
        const finalRequest = targetRequest();
        if (!finalRequest)
            throw new BaseError("Error recieving request", 404);
        if (finalRequest.status == 400 ||
            finalRequest.status == 403 ||
            finalRequest.status == 404 ||
            finalRequest.status == 502)
            throw new BaseError(finalRequest.error, finalRequest.status);
        else if (finalRequest.status == 200)
            return finalRequest.respondData;
        else
            throw new BaseError("Error handling request", 400);
    }
}
export default JobQueue;
