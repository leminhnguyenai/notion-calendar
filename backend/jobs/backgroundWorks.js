const { clearInterval } = require("timers");
const { CONS_DB_PATH, CONFIG_PATH, RELATIONS_PATH } = require("../Paths.js");
const checkFileExistIfNotCreate = require("./utils/checkFileExistIfNotCreate.js");
const configureWorker = require("./utils/configureWorker.js");
const wait = require("./utils/wait.js");
const fs = require("fs").promises;
const path = require("path");

const backgroundWorks = {
  workers: [],
  refreshRate: null,
  task: null,
  latestSyncedTime: null,
  busy: false,
  async init() {
    try {
      await checkFileExistIfNotCreate(CONS_DB_PATH, "[]");
      await checkFileExistIfNotCreate(CONFIG_PATH, '{ "refreshRate": 300000 }');
      const connectionsList = JSON.parse(await fs.readFile(CONS_DB_PATH, "utf8"));
      this.refreshRate = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8")).refreshRate;
      for (const connection of connectionsList) {
        const calendarId = connection.calendarId;
        const relationTbPath = path.join(RELATIONS_PATH, `/relationTb_${calendarId}.json`);
        await checkFileExistIfNotCreate(relationTbPath, "[]");
        const relationTb = JSON.parse(await fs.readFile(relationTbPath, "utf8"));
        const worker = configureWorker(calendarId, connection, relationTb, relationTbPath);
        this.workers.push(worker);
      }
    } catch (err) {
      console.log(err);
    }
  },
  async jobToExecute() {
    if (this.busy) await wait(() => !this.busy);
    try {
      this.busy = true;
      let length = this.workers.length;
      for (let i = 0; i <= length - 1; i++) {
        // Check for newly added connections and process them first
        let newLength = this.workers.length;
        for (let j = length; j <= newLength - 1; j++) {
          const newlyAddedWorkerReference = this.workers[j];
          const busy = () => newlyAddedWorkerReference.busy;
          await wait(() => !busy());
          // if this worker is retired, remove it and move to next worker
          if (newlyAddedWorkerReference.retired) {
            this.workers.splice(j, 1);
            newLength--;
            j--;
            continue;
          }
          await newlyAddedWorkerReference.init();
        }
        length = newLength;
        const workerReference = this.workers[i];
        const busy = () => workerReference.busy;
        await wait(() => !busy());
        // if this worker is retired, remove it and move to next worker
        if (workerReference.retired) {
          this.workers.splice(i, 1);
          length--;
          i--;
          continue;
        }
        await workerReference.init();
      }
      this.latestSyncedTime = new Date();
      console.log(this.latestSyncedTime);
      this.busy = false;
    } catch (err) {
      this.latestSyncedTime = undefined;
      this.busy = false;
      console.log(err);
    }
  },
  async createTask() {
    await this.jobToExecute();
    this.task = setInterval(this.jobToExecute.bind(this), this.refreshRate);
  },
  stopTask() {
    clearInterval(this.task);
    this.busy = false;
  },
  async updateTask(newRefreshRate) {
    this.stopTask();
    this.refreshRate = newRefreshRate;
    await this.createTask();
  },
};

module.exports = backgroundWorks;
