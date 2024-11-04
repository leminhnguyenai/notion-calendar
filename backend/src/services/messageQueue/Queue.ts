import JobToTrack from "./JobToTrack";

class Queue {
    private queue: Array<JobToTrack<() => Promise<any>>>;
    private window: number;
    private activate: boolean;
    constructor(window: number) {
        this.queue = [];
        this.window = Math.floor(window);
        this.activate = false;
    }

    addToQueue(job: JobToTrack<() => Promise<any>>): void {
        this.queue.push(job);
        this.processQueue();
    }

    async processQueue(): Promise<void> {
        if (this.activate) return;
        this.activate = true;
        while (this.queue.length > 0) {
            const batchCount = this.queue.length > this.window ? this.window : this.queue.length;
            for (let i = 0; i < batchCount; i++) {
                await this.queue[i].process();
            }
            this.queue.splice(0, batchCount);
        }
        this.activate = false;
    }
}

export default Queue;
