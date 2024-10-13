import express from "express";
import { Application } from "express";
import cors from "cors";
const app: Application = express();
import { v1 } from "./v1/v1";
const PORT: number = 6060;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("REST API is live");
});

app.use("/api/v1", v1);

app.listen(PORT, () => {
  console.log(`The API is live on http://localhost:${PORT}`);
});
