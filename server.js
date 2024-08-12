const express = require("express");
const app = express();
const connections = require("./routes/connections.js");
const update = require("./routes/update.js");
const config = require("./routes/config.js");
port = 6060;

app.use(express.static("public"));
app.use(express.json());
app.use(require("express-status-monitor")());

app.get("/", (req, res) => {
  res.send("notion-calendar is on");
});

// Handle connections
app.use("/connections", connections);

// Handling update calendar
app.use("/update", update);

// Handling config
app.use("/config", config);

app.listen(port, () => {
  console.log(`The server is live on http://localhost:${port}`);
});
