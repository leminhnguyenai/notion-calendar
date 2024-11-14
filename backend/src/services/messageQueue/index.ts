import { FuncType } from '../../@types';
import JobQueue from './JobQueue';
import JobToTrack from './JobToTrack';

type Queues = {
    [key in FuncType]: JobQueue;
};

class MessageQueue {
    private queues: Queues;
    constructor() {
        this.queues = {
            db: new JobQueue(20),
            fetch_notion: new JobQueue(3),
            fetch_google: new JobQueue(5),
        };
    }

    async enqueue<T extends Promise<any>>(
        func: T,
        type: FuncType,
    ): Promise<Awaited<T>> {
        const job = new JobToTrack(func, type);
        this.queues[job.type].addToQueue(job);
        return new Promise<Awaited<T>>((resolve, reject) => {
            job.once('result', (result: Awaited<T>) => {
                job.removeAllListeners('error');
                resolve(result);
            });
            job.once('error', (err: Error) => {
                job.removeAllListeners('result');
                reject(err);
            });
        });
    }
}

export default MessageQueue;
