const { NOTION_KEY } = require("../../Paths.js");
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: NOTION_KEY });
const FindData = require("./findData.js");
const MarkAsDone = require("./markAsDone.js");

const getNotionEventsAndFormat = async (connection, pageSize = 100) => {
  let nextCursor = undefined;
  let hasMore = true;
  let unformattedNotionEvents = [];
  let databaseId = connection.database.value;
  let dateName = connection.date.name;
  let nameName = connection.name.name;
  let descriptionName = connection.description.name;
  let doneMethodName = connection.doneMethod.name;
  let doneMethodOptionValue = connection.doneMethodOption.value;
  while (hasMore) {
    let data = await notion.databases.query({
      database_id: databaseId,
      filter: { property: dateName, date: { is_not_empty: true } },
      sorts: [{ property: dateName, direction: "ascending" }],
      page_size: pageSize,
      start_cursor: nextCursor,
    });
    hasMore = data.has_more;
    nextCursor = data.next_cursor;
    unformattedNotionEvents = unformattedNotionEvents.concat(data.results);
  }
  let formmattedNotionEvents = unformattedNotionEvents.map((result) => {
    let doneStatus = "";
    if (doneMethodName != "")
      doneStatus = new MarkAsDone(result, doneMethodName, doneMethodOptionValue).init();
    return {
      page_id: result.id,
      summary: doneStatus + new FindData(result, nameName).init(),
      description: new FindData(result, descriptionName).init(),
      created_time: new Date(result.created_time).toISOString(),
      start_date: new Date(result.properties[dateName].date.start).toISOString(),
      end_date: new Date(result.properties[dateName].date.end).toISOString(),
    };
  });
  return formmattedNotionEvents;
};

/**
 * //TEST
(async () => {
  let connection = {
    calendarName: "Notion projects 2",
    calendarId:
      "1b1089ca004a8456888454bf73333bb1d092bc7eea2a0ff504910bbc247bdfd3@group.calendar.google.com",
    database: { name: "📋 Notion tasks", value: "fe62e687-5fa5-4b2f-b8cb-8e4bd4a1eb65" },
    date: { name: "Due Date", value: "eD%3DI" },
    name: { name: "Name", value: "title" },
    description: { name: "Notes", value: "Jg~E" },
    doneMethod: { name: "Status", value: "F%3FJa" },
    doneMethodOption: { name: "Done", value: "Jqhn" },
  };

  console.log(await getNotionEventsAndFormat(connection));
})();
 */

module.exports = getNotionEventsAndFormat;
