const { CONS_DB_PATH, CONFIG_PATH, RELATIONS_PATH } = require("../Paths.js");
const checkFileExistIfNotCreate = require("./utils/checkFileExistIfNotCreate.js");
const configureWorker = require("./utils/configureWorker.js");
const wait = require("./utils/wait.js");
const fs = require("fs").promises;
const path = require("path");
const cron = require("node-cron");

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
        let calendarId = connection.calendarId;
        let relationTbPath = path.join(RELATIONS_PATH, `/relationTb_${calendarId}.json`);
        await checkFileExistIfNotCreate(relationTbPath, "[]");
        let relationTb = JSON.parse(await fs.readFile(relationTbPath, "utf8"));
        let worker = configureWorker(calendarId, connection, relationTb, relationTbPath);
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
        const newLength = this.workers.length;
        for (let j = length; j <= newLength - 1; j++) {
          let newlyAddedWorkerReference = this.workers[j];
          let busy = () => newlyAddedWorkerReference.busy;
          await wait(() => !busy());
          if (newlyAddedWorkerReference.retired) {
            this.workers.splice(j, 1);
            j--;
            continue;
          }
          await newlyAddedWorkerReference.init();
        }
        length = newLength;
        let workerReference = this.workers[i];
        let busy = () => workerReference.busy;
        await wait(() => !busy());
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
      this.busy = false;
      console.log(err);
    }
  },
  async createTask() {
    await this.jobToExecute().then(() => {});
    this.task = cron.schedule(
      `*/${this.refreshRate / (1000 * 60)} * * * *`,
      this.jobToExecute.bind(this),
      {
        scheduled: false,
      }
    );
  },
  startTask() {
    this.task.start();
  },
  async updateTask(newRefreshRate) {
    this.task.stop();
    this.refreshRate = newRefreshRate;
    await this.createTask();
    this.startTask();
  },
};

module.exports = backgroundWorks;
