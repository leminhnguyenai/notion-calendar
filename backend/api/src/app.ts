import cors from "cors";
import express, { Application, Request, Response } from "express";
import connections from "./routes/connections";
const app: Application = express();

app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("REST API is on");
});

app.use("/connections", connections);

export default app;
