const { NOTION_KEY } = require("../../Paths.js");
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: NOTION_KEY });
const FindData = require("./findData.js");
const MarkAsDone = require("./markAsDone.js");

const getNotionEventsAndFormat = async (connection, pageSize = 100) => {
  let nextCursor = undefined;
  let hasMore = true;
  let unformattedNotionEvents = [];
  const databaseId = connection.database.value;
  const dateName = connection.date.name;
  const nameName = connection.name.name;
  const descriptionName = connection.description.name;
  const doneMethodName = connection.doneMethod.name;
  const doneMethodOptionValue = connection.doneMethodOption.value;
  while (hasMore) {
    const data = await notion.databases.query({
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
  const formmattedNotionEvents = unformattedNotionEvents.map((result) => {
    let doneStatus = "";
    let description = "";
    if (doneMethodName != "")
      doneStatus = new MarkAsDone(result, doneMethodName, doneMethodOptionValue).init();
    if (descriptionName != "") description = new FindData(result, descriptionName).init();
    return {
      page_id: result.id,
      summary: doneStatus + new FindData(result, nameName).init(),
      description: description,
      created_time: new Date(result.created_time).toISOString(),
      start_date: new Date(result.properties[dateName].date.start).toISOString(),
      end_date: new Date(result.properties[dateName].date.end).toISOString(),
    };
  });
  return formmattedNotionEvents;
};

module.exports = getNotionEventsAndFormat;
