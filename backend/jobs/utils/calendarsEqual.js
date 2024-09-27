const calendarsEqual = (notionEvents, googleCalsEvents) => {
  // Assume that the date format is the same on both calendars
  let keysToBeCompared = ["summary", "description", "start_date", "end_date"];
  for (const key of keysToBeCompared) if (notionEvents[key] != googleCalsEvents[key]) return false;
  return true;
};

module.exports = calendarsEqual;
