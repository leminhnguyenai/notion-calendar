import { NextFunction, Request, Response, Router } from "express";
import mysql from "mysql2/promise";
import { ConnectionOptions } from "mysql2/promise";
import { connectionsErrorHandler } from "../middlewares/connectionsErrorHandler";
import { BaseError } from "../Error";
const router: Router = Router();
const access: ConnectionOptions = {
  host: "localhost",
  user: "root",
  password: "Submarin3z.",
  port: 3306,
  database: "notion_calendar",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

type FormattedConnType = {
  calendarId: string;
  calendarName: string;
  date: {
    name: string;
    value: string;
  };
  name: {
    name: string;
    value: string;
  };
  description?: {
    name: string;
    value: string;
  };
  doneMethod?: {
    name: string;
    value: string;
  };
  doneMethodOption?: {
    name: string;
    value: string;
  };
};

type UnFormattedConnType = {
  calendar_id: string;
  calendar_name: string;
  date: {
    name: string;
    value: string;
  };
  name: {
    name: string;
    value: string;
  };
  description?: {
    name: string;
    value: string;
  };
  done_method?: {
    name: string;
    value: string;
  };
  done_method_option?: {
    name: string;
    value: string;
  };
};

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = await mysql.createConnection(access);
    const [results] = await connection.query("SELECT * FROM connections");
    await connection.end();
    const formattedConns: FormattedConnType[] = (results as UnFormattedConnType[]).map(
      (unformattedConn: UnFormattedConnType) => {
        const formattedCon: FormattedConnType = {
          calendarId: unformattedConn.calendar_id,
          calendarName: unformattedConn.calendar_name,
          date: unformattedConn.date,
          name: unformattedConn.name,
        };
        if (unformattedConn.description !== null)
          formattedCon.description = unformattedConn.description;
        if (unformattedConn.done_method !== null)
          formattedCon.doneMethod = unformattedConn.done_method;
        if (unformattedConn.done_method_option !== null)
          formattedCon.doneMethodOption = unformattedConn.done_method_option;
        return formattedCon;
      }
    );
    res.json(formattedConns);
  } catch (err) {
    next(err);
  }
});

router.use(connectionsErrorHandler);

export const connections: Router = router;
