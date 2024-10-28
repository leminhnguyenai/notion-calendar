import { BaseError } from "../Errors";
import db from "../db/db";
const deleteConnections = async (deletedCalendarObj) => {
    if (!("calendarId" in deletedCalendarObj) || typeof deletedCalendarObj.calendarId != "string")
        throw new BaseError("Invalid calendar ID", 400);
    await db.connection.delete(deletedCalendarObj.calendarId);
};
export default deleteConnections;
