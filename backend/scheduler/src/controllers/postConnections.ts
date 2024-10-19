import mysql, { ConnectionOptions } from "mysql2/promise";
import { FormattedConnType } from "../@types/connections";
import { isFormattedConn } from "../@types/isFormattedConn";
import { BaseError } from "../Errors";

const postConnections = async (
    connection: FormattedConnType,
    access: ConnectionOptions
): Promise<object> => {
    const newConn = JSON.parse(JSON.stringify(connection));
    if (!isFormattedConn(newConn)) throw new BaseError("Invalid input connection", 400);
    const conn = await mysql.createConnection(access);
    //* NEXT STEP: create calendar -> add the new conn to db along with the newly created calendar Id
    try {
        await conn.query("INSERT INTO connections VALUES(?,?,?,?,?,?,?)", [
            newConn.calendarId,
            newConn.calendarName,
            JSON.stringify(newConn.date),
            JSON.stringify(newConn.name),
            JSON.stringify(newConn.description) || null,
            JSON.stringify(newConn.doneMethod) || null,
            JSON.stringify(newConn.doneMethodOption) || null,
        ]);
        await conn.end();
        //* This function return a newly added calendar ID
        return {
            calendarId: "Here is a calendar id",
        };
    } catch (err) {
        conn.end();
        throw err;
    }
};

export default postConnections;
