const { GoogleCalendarAPI } = require("./GoogleCalendarAPI.js");
const calendarClient = new GoogleCalendarAPI();

const getGoogleCalendarEventsAndFormat = async (calendarId) => {
  const unformattedGoogleCalEvents = await calendarClient.getEvents(calendarId);
  const formmattedGoogleCalEvents = unformattedGoogleCalEvents.map((result) => {
    return {
      event_id: result.id,
      summary: result.summary,
      description: result.description || "",
      start_date: new Date(result.start.dateTime).toISOString(),
      end_date: new Date(result.end.dateTime).toISOString(),
    };
  });
  return formmattedGoogleCalEvents;
};

module.exports = getGoogleCalendarEventsAndFormat;
