const express = require("express");
const v1 = require("./v1/server.js");
const app = express();
const port = 6060;

app.use("/v1", v1);

app.listen(port, () => {
  console.log(`The server is live on http://localhost:${port}`);
});
