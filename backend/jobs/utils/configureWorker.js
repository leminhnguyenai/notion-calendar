const getNotionEventsAndFormat = require("./getNotionEventsAndFormat.js");
const getGoogleCalendarEventsAndFormat = require("./getGoogleCalendarEventsAndFormat.js");
const syncCalendar = require("./syncCalendar.js");
const updateFile = require("./updateFile.js");

const configureWorker = (calendarId, connection, relationTb, relationTbPath) => {
  return {
    calendarId: calendarId,
    calendarName: connection.calendarName,
    connection: connection,
    relationTb: relationTb,
    relationTbPath: relationTbPath,
    busy: false,
    retired: false,
    async init() {
      if (!this.busy) {
        this.busy = true;
        try {
          const [formattedNotionEvents, formmattedGoogleCalEvents] = await Promise.all([
            getNotionEventsAndFormat(this.connection),
            getGoogleCalendarEventsAndFormat(this.calendarId),
          ]);
          // Update the calendar
          const { updatedRelationTb, statistic } = await syncCalendar(
            this.calendarId,
            formattedNotionEvents,
            formmattedGoogleCalEvents,
            this.relationTb
          );
          await updateFile(this.relationTbPath, () => {
            return updatedRelationTb;
          });
          this.relationTb = updatedRelationTb;
          console.log(`Calendar ID: ${this.calendarId}`);
          console.log(statistic);
          this.busy = false;
        } catch (err) {
          this.busy = false;
          console.log(err);
        }
      }
    },
  };
};

module.exports = configureWorker;
