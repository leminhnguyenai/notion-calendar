import cors from "cors";
import express, { Application, Request, Response } from "express";
import auth from "./routes/auth";
import connections from "./routes/connections";
import users from "./routes/users";
import MessageQueue from "./services/messageQueue";
const app: Application = express();

const messageQueue = new MessageQueue();

app.set("messageQueue", messageQueue);
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("notion-calendar is on");
});

app.use("/connections", connections);
app.use("/users", users);
app.use("/auth", auth);

export default app;
