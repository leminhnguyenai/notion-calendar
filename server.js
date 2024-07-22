const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { findData, doneStatus } = require("./modules/findData.js");
const { renderJSON, mergeCalendar } = require("./modules/jsonTool.js");
require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });

const port = 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(require("express-status-monitor")());

// Modification tab
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "/views/index.html");
  res.sendFile(filePath);
});

// Get databases list
app.get("/search", async (req, res) => {
  const searchResults = await notion.search({
    filter: {
      value: "database",
      property: "object",
    },
    sort: {
      direction: "ascending",
      timestamp: "last_edited_time",
    },
  });
  const results = [];
  const length = searchResults.results.length;
  for (let i = 0; i <= length - 1; i++) {
    results.push({
      database: searchResults.results[i].title[0].plain_text,
      id: searchResults.results[i].id,
      properties: Object.keys(searchResults.results[i].properties).map(
        (key) => {
          let optionsList =
            searchResults.results[i].properties[key].select ||
            searchResults.results[i].properties[key].multi_select ||
            searchResults.results[i].properties[key].status;
          if (optionsList !== undefined) {
            optionsList = optionsList.options;
          }
          const { id, name, type } = searchResults.results[i].properties[key];
          return { id, name, type, optionsList };
        }
      ),
    });
  }
  console.log(JSON.stringify(results, null, 2));
  res.json(results);
});

//Add connection info
app.post("/connection", async (req, res) => {
  const connection = req.body;
  console.log(connection);
  fs.readFile("connections.json", "utf8", (err, data) => {
    if (err) {
      console.log("error reading file");
      return;
    } else {
      let existingData = JSON.parse(data);
      console.log(data);
      existingData.push(connection);
      fs.writeFile(
        "connections.json",
        JSON.stringify(existingData, null, 2),
        "utf8",
        (err) => {}
      );
    }
  });
});

// Hosting calendar
app.get("/calendarRendered.ics", bodyParser.json(), (req, res) => {
  // Update the calendar whenever the calendar app send a request
  fs.readFile("connections.json", "utf8", async (err, data) => {
    if (err) {
      console.log("error reading file");
      return;
    } else {
      let existingData = JSON.parse(data);
      let length = existingData.length;
      let calendarData = [];
      for (let j = 0; j <= length - 1; j++) {
        const response = await notion.databases.query({
          database_id: existingData[j].databaseId,
          filter: {
            property: existingData[j].dateColumn,
            date: {
              is_not_empty: true,
            },
          },
          sorts: [
            {
              property: existingData[j].dateColumn,
              direction: "ascending",
            },
          ],
        });
        console.log(JSON.stringify(response, null, 2));
        let eventsLength = response.results.length;
        for (let i = 0; i <= eventsLength - 1; i++) {
          calendarData.push({
            uid: response.results[i].id,
            dtstamp: response.results[i].created_time,
            dtstart:
              response.results[i].properties[existingData[j].dateColumn].date
                .start,
            dtend:
              response.results[i].properties[existingData[j].dateColumn].date
                .end,
            summary:
              (await doneStatus(
                response.results[i],
                existingData[j].doneMethod,
                existingData[j].doneMethodOption
              )) +
              (await findData(response.results[i], existingData[j].nameColumn)),
            description: await findData(
              response.results[i],
              existingData[j].descriptionColumn
            ),
          });
        }
      }
      console.log(calendarData);
      fs.readFile("./calendar.json", "utf8", async (err, data) => {
        if (err) {
          console.log("error reading file");
          return;
        } else {
          fs.writeFile(
            "calendar.json",
            JSON.stringify(mergeCalendar(data, calendarData), null, 2),
            "utf8",
            async (err) => {
              if (err) {
                console.log("error reading file");
                return;
              } else {
                fs.writeFile(
                  "calendarRendered.ics",
                  await renderJSON(mergeCalendar(data, calendarData)),
                  "utf8",
                  (err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("Done !");
                      const icsPath = path.join(
                        __dirname,
                        "calendarRendered.ics"
                      );
                      res.setHeader("Content-Type", "text/calendar");
                      console.log("Here");
                      res.sendFile(icsPath);
                    }
                  }
                );
              }
            }
          );
        }
      });
    }
  });
});

//Update tab
app
  .route("/update")
  .get((req, res) => {
    const filePath = path.join(__dirname, "/views/update.html");
    res.sendFile(filePath);
  })
  .post((req, res) => {
    fs.readFile("connections.json", "utf8", async (err, data) => {
      if (err) {
        console.log("error reading file");
        return;
      } else {
        let existingData = JSON.parse(data);
        let length = existingData.length;
        let calendarData = [];
        for (let j = 0; j <= length - 1; j++) {
          const response = await notion.databases.query({
            database_id: existingData[j].databaseId,
            filter: {
              property: existingData[j].dateColumn,
              date: {
                is_not_empty: true,
              },
            },
            sorts: [
              {
                property: existingData[j].dateColumn,
                direction: "ascending",
              },
            ],
          });
          console.log(JSON.stringify(response, null, 2));
          let eventsLength = response.results.length;
          for (let i = 0; i <= eventsLength - 1; i++) {
            calendarData.push({
              uid: response.results[i].id,
              dtstamp: response.results[i].created_time,
              dtstart:
                response.results[i].properties[existingData[j].dateColumn].date
                  .start,
              dtend:
                response.results[i].properties[existingData[j].dateColumn].date
                  .end,
              summary:
                (await doneStatus(
                  response.results[i],
                  existingData[j].doneMethod,
                  existingData[j].doneMethodOption
                )) +
                (await findData(
                  response.results[i],
                  existingData[j].nameColumn
                )),
              description: await findData(
                response.results[i],
                existingData[j].descriptionColumn
              ),
            });
          }
        }
        console.log(calendarData);
        fs.readFile("./calendar.json", "utf8", async (err, data) => {
          if (err) {
            console.log("error reading file");
            return;
          } else {
            fs.writeFile(
              "calendar.json",
              JSON.stringify(mergeCalendar(data, calendarData), null, 2),
              "utf8",
              async (err) => {
                if (err) {
                  console.log("error reading file");
                  return;
                } else {
                  fs.writeFile(
                    "calendarRendered.ics",
                    await renderJSON(mergeCalendar(data, calendarData)),
                    "utf8",
                    (err) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log("Done !");
                        const icsPath = path.join(
                          __dirname,
                          "calendarRendered.ics"
                        );
                        res.setHeader("Content-Type", "text/calendar");
                        console.log("Here");
                        res.sendFile(icsPath);
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    });
  });

app.listen(port, () => {
  console.log(`the server is live on http://localhost:${port}`);
});
