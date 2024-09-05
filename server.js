const express = require("express");
const app = express();
const cors = require("cors");
const connections = require("./routes/connections.js");
const update = require("./routes/update.js");
const config = require("./routes/config.js");
const dashboard = require("./routes/dashboard.js");
port = 6060;

app.use(require("express-status-monitor")());
app.use(cors());

app.get("/", (req, res) => {
  res.send("notion-calendar is on");
});

// Handle connections
app.use("/api/connections", connections);

// Handling update calendar
app.use("/api/update", update);

// Handling config
app.use("/api/config", config);

// Handling the interface
app.use("/dashboard", dashboard);

app.listen(port, () => {
  console.log(`The server is live on http://localhost:${port}`);
});
