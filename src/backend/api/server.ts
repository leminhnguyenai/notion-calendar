import express from "express";
const app = express();
const PORT = 6060;

app.get("/", (req, res) => {
  res.send("REST API is live");
});

app.listen(PORT, () => {
  console.log(`The API is live on http://localhost:${PORT}`);
});
