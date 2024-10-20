import { Pool } from "mysql2/promise";
import { FormattedConnType } from "../@types/connections";
import { isFormattedConn } from "../@types/isFormattedConn";
import { BaseError } from "../Errors";

export const postConnToDb = async (pool: Pool, newConn: FormattedConnType): Promise<void> => {
    if (!isFormattedConn(newConn)) throw new BaseError("Invalid input connection", 400);
    await pool.query("INSERT INTO connections VALUES(?,?,?,?,?,?,?)", [
        newConn.calendarId,
        newConn.calendarName,
        JSON.stringify(newConn.date),
        JSON.stringify(newConn.name),
        JSON.stringify(newConn.description) || null,
        JSON.stringify(newConn.doneMethod) || null,
        JSON.stringify(newConn.doneMethodOption) || null,
    ]);
};
