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
    const res = await handle();
    return res;
  },
  async connectionPost(newConnection) {
    const calendarId = await calendarClient.createCalendar(newConnection.calendarName);
    newConnection.calendarId = calendarId;
    const relationTbPath = path.join(RELATIONS_PATH, `/relationTb_${calendarId}.json`);
    await checkFileExistIfNotCreate(relationTbPath, "[]");
    const relationTb = JSON.parse(await fs.readFile(relationTbPath, "utf8"));
    await updateFile(CONS_DB_PATH, (data) => {
      data.push(newConnection);
      return data;
    });
    const newWorker = configureWorker(calendarId, newConnection, relationTb, relationTbPath);
    backgroundWorksReference.workers.push(newWorker);
    if (!backgroundWorksReference.busy) {
      backgroundWorksReference.stopTask();
      backgroundWorksReference.createTask();
    }
    return { calendarId };
  },
  async connectionPatch(updatedConnection) {
    const calendarId = updatedConnection.calendarId;
    const updatingWorkerIndex = backgroundWorksReference.workers.findIndex(
      (worker) => worker.calendarId == calendarId
    );
    if (updatingWorkerIndex == -1) {
      throw new AppError(404, "Can't find the connection", 404);
    }
    const updatingWorkerReference = backgroundWorksReference.workers[updatingWorkerIndex];
    // Wait until the worker is free
    const busy = () => {
      return updatingWorkerReference.busy;
    };
    await wait(() => !busy());
    try {
      updatingWorkerReference.busy = true;
      // Update the connection in the database
      await updateFile(CONS_DB_PATH, (data) => {
        const connectionIndex = data.findIndex((conn) => conn.calendarId == calendarId);
        if (connectionIndex == -1) {
          throw new AppError(404, "Can't find the connection in DB", 404);
        }
        data[connectionIndex] = updatedConnection;
        return data;
      });
      // Update the calendar name if needed
      if (updatedConnection.calendarName != updatingWorkerReference.calendarName)
        await calendarClient.updateCalendar(calendarId, updatedConnection.calendarName);
      // Equip wokrer with up to date information
      updatingWorkerReference.connection = updatedConnection;
      updatingWorkerReference.calendarName = updatedConnection.calendarName;
      updatingWorkerReference.busy = false;
      // Start task immediately if it the syncing interval is currently free
      if (!backgroundWorksReference.busy) {
        backgroundWorksReference.stopTask();
        backgroundWorksReference.createTask();
      }
    } catch (err) {
      updatingWorkerReference.busy = false;
      throw err;
    }
  },
  async connectionDelete(calendarId) {
    const deletingWorkerIndex = backgroundWorksReference.workers.findIndex(
      (worker) => worker.calendarId == calendarId
    );
    if (deletingWorkerIndex == -1) {
      throw new AppError(404, "Can't find the connection", 404);
    }
    const deletingWorkerReference = backgroundWorksReference.workers[deletingWorkerIndex];
    // Wait until the worker is free
    const busy = () => {
      return deletingWorkerReference.busy;
    };
    await wait(() => !busy());
    try {
      deletingWorkerReference.busy = true;
      deletingWorkerReference.retired = true;
      deletingWorkerReference.busy = false;
    } catch (err) {
      deletingWorkerReference.busy = false;
      throw err;
    }
    // Delete relation table accordingly
    const relationPath = deletingWorkerReference.relationTbPath;
    await fs.unlink(relationPath);
    // Delete from the connection database
    await updateFile(CONS_DB_PATH, (data) => {
      return data.filter((connection) => connection.calendarId != calendarId);
    });
    await calendarClient.deleteCalendar(calendarId);
  },
  async configPatch(refreshRate) {
    if (typeof refreshRate != "number") {
      throw new AppError(400, "The refresh rate must be a number", 404);
    }
    await updateFile(CONFIG_PATH, (data) => {
      data.refreshRate = refreshRate;
      return data;
    });
    backgroundWorksReference.updateTask(refreshRate);
    console.log(backgroundWorksReference.refreshRate);
  },
};

module.exports = handlingJob;
