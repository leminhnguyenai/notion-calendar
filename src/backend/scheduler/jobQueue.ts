import { JobRequest } from "../../@types/job";
import isJobRequest from "../../types-guard/isJobRequest";
import { BaseError } from "./Error";
import jobHandling from "./JobHandling";
import _ from "lodash";
type Queue = {
    activeQueue: JobRequest[];
    processedQueue: JobRequest[];
    activate: boolean;
    response(id: string): Promise<JobRequest>;
    init(): void;
    activateLoop(): Promise<void>;
    deactivate(): void;
};

const jobQueue: Queue = {
    activeQueue: [],
    processedQueue: [],
    activate: false,
    async response(id) {
        let processing: boolean = true;
        const targetRequest = (): JobRequest | undefined =>
            this.processedQueue.find((req: JobRequest) => req.id == id);
        while (processing) {
            if (targetRequest()) processing = false;
            else await new Promise((resolve) => setTimeout(resolve, 100));
        }
        const finalRequest = targetRequest();
        if (!finalRequest) throw new BaseError("Error recieving request", 404);
        return finalRequest;
    },
    init() {
        this.activate = true;
        this.activateLoop();
        console.log("Job queue ready to serve");
    },
    async activateLoop() {
        while (this.activate) {
            if (this.activeQueue.length > 0) {
                try {
                    console.log("Request recieved");
                    const processedReq = _.cloneDeep(this.activeQueue[0]);
                    if (!isJobRequest(processedReq)) throw new BaseError("Invalid Request", 400);
                    const jobRes = await jobHandling.init(processedReq.job);
                    processedReq.status = 200;
                    if (processedReq.status == 200) {
                        if (jobRes) processedReq.respondData = jobRes;
                        else processedReq.respondData = {};
                    }
                    this.processedQueue.push(processedReq);
                } catch (err) {
                    const failedReq = this.activeQueue[0];
                    if (err instanceof BaseError) {
                        failedReq.status = err.statusCode;
                        if (failedReq.status == err.statusCode) failedReq.error = err.message;
                    } else if (err instanceof Error) {
                        failedReq.status = 400;
                        if (failedReq.status == 400) failedReq.error = err.message;
                    } else {
                        failedReq.status = 400;
                        if (failedReq.status == 400) failedReq.error = "Unknown error occurs";
                    }
                    this.processedQueue.push(failedReq);
                    console.log("Error processing request");
                }
                this.activeQueue.splice(0, 1);
            } else await new Promise((resolve) => setTimeout(resolve, 100));
        }
    },
    deactivate() {
        this.activate = false;
    },
};

export default jobQueue;
