const handlingJob = require("./handlingJob.js");

const jobQueue = {
  activeQueue: [],
  processedQueue: [],
  activate: false,
  async response(id) {
    let processing = true;
    let targetRequest = () => this.processedQueue.find((job) => job.id == id);
    while (processing) {
      if (targetRequest()) {
        return targetRequest();
      } else await new Promise((resolve) => setTimeout(resolve, 100));
    }
  },
  async init() {
    this.activate = true;
    while (this.activate) {
      if (this.activeQueue.length > 0) {
        try {
          const res = await handlingJob.init(this.activeQueue[0].job);
          this.activeQueue[0].status = 200;
          if (res) {
            this.activeQueue[0].responseData = res;
          }
        } catch (err) {
          this.activeQueue[0].status = 400;
          this.activeQueue[0].error = {
            errorCode: err.errorCode,
            statusCode: err.statusCode,
            message: err.message,
          };
        }
        this.processedQueue.push(this.activeQueue[0]);
        this.activeQueue.splice(0, 1);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  },
  deactivate() {
    this.activate = false;
  },
};

module.exports = jobQueue;
