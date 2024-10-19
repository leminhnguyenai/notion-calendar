import express, { Application, Request, Response } from "express";
import cors from "cors";
const app: Application = express();
import connections from "./routes/connections";

app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("REST API is on");
});

app.use("/connections", connections);

export default app;
