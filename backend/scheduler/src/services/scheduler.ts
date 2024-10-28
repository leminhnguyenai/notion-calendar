interface SchedulerType {
    loadJob(): Promise<void>;
    jobToExecute(): Promise<void>;
    createTask(): Promise<void>;
    stopTask(): Promise<void>;
    updateTask(): Promise<void>;
}

class Scheduler implements SchedulerType {
    loadJob(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    jobToExecute(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    createTask(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    stopTask(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateTask(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export default Scheduler;
