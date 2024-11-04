import { FuncType } from "../../@types";
import JobToTrack from "./JobToTrack";
import Queue from "./Queue";

type Queues = {
    [key in FuncType]: Queue;
};

class MessageQueue {
    private queues: Queues;
    constructor() {
        this.queues = {
            db: new Queue(20),
            fetch_notion: new Queue(3),
            fetch_google: new Queue(5),
        };
    }

    async enqueue<T extends () => Promise<any>>(
        func: T,
        type: FuncType
    ): Promise<Awaited<ReturnType<T>>> {
        const job = new JobToTrack(func, type);
        this.queues[job.type].addToQueue(job);
        return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
            job.once("result", (result: Awaited<ReturnType<T>>) => {
                job.removeAllListeners("error");
                resolve(result);
            });
            job.once("error", (err: Error) => {
                job.removeAllListeners("result");
                reject(err);
            });
        });
    }
}

export default MessageQueue;
