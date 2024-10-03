const backgroundWorksReference = require("./backgroundWorks.js");
const AppError = require("./AppError.js");
const { CONS_DB_PATH, RELATIONS_PATH, CONFIG_PATH } = require("../Paths.js");
const checkFileExistIfNotCreate = require("./utils/checkFileExistIfNotCreate.js");
const updateFile = require("./utils/updateFile.js");
const configureWorker = require("./utils/configureWorker.js");
const wait = require("./utils/wait.js");
const { GoogleCalendarAPI } = require("./utils/GoogleCalendarAPI.js");
const calendarClient = new GoogleCalendarAPI();
const path = require("path");
const fs = require("fs").promises;

const handlingJob = {
  async init(job) {
    try {
      const methodMap = {
        CONNECTION: {
          POST: async () => await this.connectionPost(job.data),
          DELETE: async () => await this.connectionDelete(job.data.calendarId),
          PATCH: async () => await this.connectionPatch(job.data),
        },
        CONFIG: {
          PATCH: async () => await this.configPatch(job.data.refreshRate),
        },
      };
      const handle = methodMap[job.type][job.method];
      await handle();
    } catch (err) {
      throw err;
    }
  },
  async connectionPost(newConnection) {
    try {
      const calendarId = await calendarClient.createCalendar(newConnection.calendarName);
      newConnection.calendarId = calendarId;
      const relationTbPath = path.join(RELATIONS_PATH, `/relationTb_${calendarId}.json`);
      await checkFileExistIfNotCreate(relationTbPath, "[]");
      let relationTb = JSON.parse(await fs.readFile(relationTbPath, "utf8"));
      await updateFile(CONS_DB_PATH, (data) => {
        data.push(newConnection);
        return data;
      });
      let newWorker = configureWorker(calendarId, newConnection, relationTb, relationTbPath);
      backgroundWorksReference.workers.push(newWorker);
      if (/*!backgroundWorksReference.busy*/ true) {
        backgroundWorksReference.stopTask();
        backgroundWorksReference.createTask();
      }
    } catch (err) {
      throw err;
    }
  },
  async connectionPatch(updatedConnection) {
    const calendarId = updatedConnection.calendarId;
    const updatingWorkerIndex = backgroundWorksReference.workers.findIndex(
      (worker) => worker.calendarId == calendarId
    );
    if (updatingWorkerIndex == -1) throw new AppError(404, "Can't find the connection", 404);
    let updatingWorkerReference = backgroundWorksReference.workers[updatingWorkerIndex];
    let busy = () => {
      return updatingWorkerReference.busy;
    };
    await wait(() => !busy());

    try {
      await updateFile(CONS_DB_PATH, (data) => {
        const connectionIndex = data.findIndex((conn) => conn.calendarId == calendarId);
        if (connectionIndex == -1) throw new AppError(404, "Can't find the connection in DB", 404);
        data[connectionIndex] = updatedConnection;
        return data;
      });
      updatingWorkerReference.connection = updatedConnection;
      updatingWorkerReference.calendarName = updatedConnection.calendarName;
    } catch (err) {
      throw err;
    }
  },
  async connectionDelete(calendarId) {
    try {
      const deletingWorkerIndex = backgroundWorksReference.workers.findIndex(
        (worker) => worker.calendarId == calendarId
      );
      if (deletingWorkerIndex == -1) throw new AppError(404, "Can't find the connection", 404);
      let deletingWorkerReference = backgroundWorksReference.workers[deletingWorkerIndex];
      let busy = () => {
        return deletingWorkerReference.busy;
      };
      await wait(() => !busy());
      deletingWorkerReference.busy = true;
      const relationPath = deletingWorkerReference.relationTbPath;
      deletingWorkerReference.retired = true;
      deletingWorkerReference.busy = false;
      await fs.unlink(relationPath);
      await updateFile(CONS_DB_PATH, (data) => {
        return data.filter((connection) => connection.calendarId != calendarId);
      });
      await calendarClient.deleteCalendar(calendarId);
    } catch (err) {
      throw err;
    }
  },
  async configPatch(refreshRate) {
    if (typeof refreshRate != "number")
      throw new AppError(400, "The refresh rate must be a number", 404);
    await updateFile(CONFIG_PATH, (data) => {
      data.refreshRate = refreshRate;
      return data;
    });
    backgroundWorksReference.updateTask(refreshRate);
    console.log(backgroundWorksReference.refreshRate);
  },
};

module.exports = handlingJob;
