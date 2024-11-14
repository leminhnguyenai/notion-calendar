import JobToTrack from './JobToTrack';

class JobQueue {
    private queues: Array<JobToTrack<Promise<any>>[]>;
    private window: number;
    private token: number;
    constructor(window: number) {
        this.queues = [];
        for (let i = 0; i < window; i++) {
            this.queues[i] = [];
        }
        this.window = Math.floor(window);
        this.token = -1;
    }

    addToQueue(job: JobToTrack<Promise<any>>): void {
        this.token = (this.token + 1) % this.window;
        this.queues[this.token].push(job);
        this.processQueue(this.token);
    }

    async processQueue(index: number): Promise<void> {
        while (this.queues[index].length > 0) {
            await this.queues[index][0].process();
            this.queues[index].splice(0, 1);
        }
    }
}

export default JobQueue;
