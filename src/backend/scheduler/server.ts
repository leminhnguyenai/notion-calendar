import express from "express";
const app = express();
const PORT = 6061;

app.get("/", (req, res) => {
  res.send("The scheduler is live");
});

app.listen(PORT, () => {
  console.log(`The API is live on http://localhost:${PORT}`);
});
