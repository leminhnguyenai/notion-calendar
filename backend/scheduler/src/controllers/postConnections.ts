import { isFormattedConn } from "../@types/isFormattedConn";
import { BaseError } from "../Errors";
import db from "../db/db";

const postConnections = async (connection: unknown): Promise<object> => {
    if (!isFormattedConn(connection)) throw new BaseError("Invalid connection", 400);
    await db.connection.post(connection);
    return {
        calendarId: "This is calendar ID",
    };
};

export default postConnections;
