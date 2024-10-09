const calendarsEqual = require("./calendarsEqual.js");
const { GoogleCalendarAPI } = require("./GoogleCalendarAPI.js");
const _ = require("lodash");
const calendarClient = new GoogleCalendarAPI();

const syncCalendar = async (calendarId, notionEvents, googleCalEvents, relationTb) => {
  let copyRelationTb = _.cloneDeep(relationTb);
  const copyNotionEvents = _.cloneDeep(notionEvents);
  const copyGoogleCalEvents = _.cloneDeep(googleCalEvents);
  const statistic = {
    taskAdded: 0,
    taskReAdded: 0,
    taskUpdated: 0,
    taskDeleted: 0,
  };
  // Create a table to represent the relation between Notion and Google Calendar
  const table = [];
  for (const notionEvent of copyNotionEvents) {
    const relation = copyRelationTb.find((result) => result.page_id == notionEvent.page_id);
    let googleCalEvent;
    if (relation) {
      copyRelationTb = copyRelationTb.filter((result) => result.page_id != relation.page_id);
      googleCalEvent = copyGoogleCalEvents.find((result) => result.event_id == relation.event_id);
    }
    table.push([notionEvent, relation, googleCalEvent]);
  }
  for (const relation of copyRelationTb) {
    const googleCalEvent = copyGoogleCalEvents.find(
      (result) => result.event_id == relation.event_id
    );
    table.push([undefined, relation, googleCalEvent]);
  }
  // Perform necessary action on each event
  for (const row of table) {
    const notionEventToBeSent =
      row[0] === undefined
        ? undefined
        : {
            title: row[0].summary,
            description: row[0].description,
            startDate: row[0].start_date,
            endDate: row[0].end_date,
          };
    if (!row.includes(undefined)) {
      // Update the event if there are difference
      if (calendarsEqual(row[0], row[2])) continue;
      const eventId = row[2].event_id;
      await calendarClient.updateEvent(calendarId, eventId, notionEventToBeSent);
      statistic.taskUpdated++;
    } else if (row[0] && row[1] && !row[2]) {
      // Re-add event that are accidentally deleted in Google Calendar side and update the relation
      const res = await calendarClient.addEvent(calendarId, notionEventToBeSent);
      row[1].event_id = res.id;
      statistic.taskReAdded++;
    } else if (!row[0] && row[1] && row[2]) {
      // Delete event that are deleted in Notion side and delete the relation
      await calendarClient.deleteEvent(calendarId, row[2].event_id);
      row[1] = undefined;
      statistic.taskDeleted++;
    } else if (row[0] && !row[1] && !row[2]) {
      // Add new event from Notion and add new relation
      const res = await calendarClient.addEvent(calendarId, notionEventToBeSent);
      row[1] = {
        event_id: res.id,
        page_id: row[0].page_id,
        created_time: row[0].created_time,
      };
      statistic.taskAdded++;
    }
  }
  // Return an updated relationTb
  let updatedRelationTb = table.map((row) => row[1]);
  updatedRelationTb = updatedRelationTb.filter((relation) => relation !== undefined);
  return { updatedRelationTb, statistic };
};

module.exports = syncCalendar;

//TODO: fix the readded event not updated accordingly
