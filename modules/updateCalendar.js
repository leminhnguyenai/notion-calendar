const { authorize, addEvent, updateEvent, deleteEvent } = require("../modules/googleCalendarAPICustomFuncs.js");
const path = require("path");
const CREDENTIALS_PATH = path.join(__dirname, "../oauth/credentials.json");
const TOKEN_PATH = path.join(__dirname, "../oauth/token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.settings.readonly",
  "https://www.googleapis.com/auth/calendar.addons.execute",
];

function compareEvent(notionCalEvent, googleCalEvent) {
  let keysToBeCompared = ["summary", "description"];
  let equal = true;
  keysToBeCompared.map((key) => {
    if (notionCalEvent[key] !== googleCalEvent[key]) equal = false;
  });
  let notionCalendarEventStartDate = new Date(notionCalEvent.start_date).toISOString();
  let notionCalendarEventEndDate = new Date(notionCalEvent.end_date).toISOString();
  let googleCalendarEventStartDate = new Date(googleCalEvent.start_date).toISOString();
  let googleCalendarEventEndDate = new Date(googleCalEvent.end_date).toISOString();
  if (
    notionCalendarEventStartDate != googleCalendarEventStartDate ||
    notionCalendarEventEndDate != googleCalendarEventEndDate
  )
    equal = false;
  return equal;
}

async function syncCalendar(calendarId, notionCalEvents, googleCalEvents, relationTb) {
  let addEventCount = 0;
  let updateEventCount = 0;
  let deleteEventCount = 0;
  let reAddEventCount = 0;
  let addRelationCount = 0;
  let deleteRelationCount = 0;
  let updateRelationCount = 0;
  try {
    let auth = await authorize(CREDENTIALS_PATH, TOKEN_PATH, SCOPES);
    for (let i = 0; i <= relationTb.length - 1; i++) {
      let notionCalEvent = notionCalEvents.find((event) => event.page_id === relationTb[i].page_id);
      let googleCalEvent = googleCalEvents.find((event) => event.event_id === relationTb[i].event_id);
      // Update event if necessary
      if (typeof notionCalEvent != "undefined" && typeof googleCalEvent != "undefined") {
        if (compareEvent(notionCalEvent, googleCalEvent) == false) {
          try {
            const updatedEvent = await updateEvent(
              auth,
              calendarId,
              googleCalEvent.event_id,
              notionCalEvent.summary,
              notionCalEvent.description,
              notionCalEvent.start_date,
              notionCalEvent.end_date
            );
            updateEventCount++;
            console.log("Updated this event:\n" + JSON.stringify(updatedEvent, null, 2));
          } catch (err) {
            console.error(err);
          }
        }
      }
      // Delete event if still new
      else if (typeof notionCalEvent == "undefined" && typeof googleCalEvent != "undefined") {
        if (notionCalEvents.length == 0) {
          try {
            await deleteEvent(auth, calendarId, googleCalEvent.event_id);
            deleteEventCount++;
            console.log("Delete successfully");
            relationTb.splice(i, 1);
            deleteRelationCount;
            i--;
            console.log("Deleted relation");
          } catch (err) {
            console.error(err);
          }
        } else {
          let date = new Date(relationTb[i].created_time);
          let oldestDate = new Date(notionCalEvents[0].created_time);
          if (date > oldestDate) {
            try {
              await deleteEvent(auth, calendarId, googleCalEvent.event_id);
              deleteEventCount++;
              console.log("Delete successfully");
              relationTb.splice(i, 1);
              deleteRelationCount++;
              i--;
              console.log("Delete relation");
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
      // Re-adding event that is mistakenly deleted in Google Calendar & update the relation accordingly
      else if (typeof notionCalEvent != "undefined" && typeof googleCalEvent == "undefined") {
        try {
          const reAddedEvent = await addEvent(
            auth,
            calendarId,
            notionCalEvent.summary,
            notionCalEvent.description,
            notionCalEvent.start_date,
            notionCalEvent.end_date
          );
          reAddEventCount++;
          console.log("Re-added this event:\n" + JSON.stringify(reAddedEvent, null, 2));
          relationTb[i].event_id = reAddedEvent.id;
          updateRelationCount++;
          console.log("Updated relation");
        } catch (err) {
          console.error(err);
        }
      }
      // Delete relation that are not useful anymore
      else if (typeof notionCalEvent == "undefined" && typeof googleCalEvent == "undefined") {
        relationTb.splice(i, 1);
        deleteRelationCount++;
        i--;
        console.log("Delete relation");
      }
    }

    // Adding new events
    let pageIdsList = relationTb.map((relation) => relation.page_id);
    let newCalEventsList = notionCalEvents.filter((event) => !pageIdsList.includes(event.page_id));
    const addNewEvents = newCalEventsList.map((event) => {
      return new Promise(async (resolve, reject) => {
        try {
          const addedEvent = await addEvent(
            auth,
            calendarId,
            event.summary,
            event.description,
            event.start_date,
            event.end_date
          );
          addEventCount++;
          console.log("Added this event:\n" + JSON.stringify(addedEvent, null, 2));
          relationTb.push({
            event_id: addedEvent.id,
            page_id: event.page_id,
            created_time: event.created_time,
          });
          addRelationCount++;
          resolve();
        } catch (err) {
          console.log(err);
          reject();
        }
      });
    });

    await Promise.all(addNewEvents);
  } catch (err) {
    console.log(err);
  } finally {
    return {
      relationTb: relationTb,
      changelog: `
      Number of new events added: ${addEventCount}
      Number of updated events: ${updateEventCount}
      Number of re-added events: ${reAddEventCount}
      Number of deleted relation count: ${deleteRelationCount}
      Number of new relations: ${addRelationCount}
      Number of updated relation: ${updateRelationCount}
      Number of deleted relation: ${deleteRelationCount}
    `,
    };
  }
}

module.exports = syncCalendar;
