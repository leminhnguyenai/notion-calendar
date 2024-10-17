import { NextFunction, Request, Response, Router } from "express";
import mysql from "mysql2/promise";
import { ConnectionOptions } from "mysql2/promise";
import { connectionsErrorHandler } from "../middlewares/connectionsErrorHandler";
import { isFormattedConn } from "../../../../types-guard/isFormattedConn";
import { isUnformattedConn } from "../../../../types-guard/isUnformattedConn";
import { BaseError } from "../Error";
import { UnFormattedConnType, FormattedConnType } from "../../../../@types/sql";
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

// Check if the route is busy or not

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const connection = await mysql.createConnection(access);
        const [results] = await connection.query(
            "SELECT * FROM connections ORDER BY calendar_name ASC"
        );
        await connection.end();
        const formattedConns: FormattedConnType[] = (results as []).map(
            (unformattedConn: UnFormattedConnType) => {
                if (!isUnformattedConn(unformattedConn))
                    throw new BaseError("Invalid formatt for SQL results", 400);
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
        res.status(200).json(formattedConns);
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!isFormattedConn(req.body)) throw new BaseError("Request type not match", 400);
        const newConn: FormattedConnType = req.body;

        const jobResponse = await fetch("http://localhost:6061", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "CONNECTION",
                method: "POST",
                data: newConn,
            }),
        });
        if (!jobResponse.ok) throw new BaseError(await jobResponse.text(), jobResponse.status);
        const jsonResponse = await jobResponse.json();
        res.status(200).json({
            message: "Added sucessfully",
            responseData: jsonResponse.responseData,
        });
    } catch (err) {
        next(err);
    }
});

router.use(connectionsErrorHandler);

export const connections: Router = router;
