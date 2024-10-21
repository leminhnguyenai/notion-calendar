import { isFormattedConn } from "../@types/isFormattedConn";
import { BaseError } from "../Errors";
import db from "../db/db";

const patchConnections = async (connection: unknown): Promise<void> => {
    if (!isFormattedConn(connection)) throw new BaseError("Invalid connection", 400);
    await db.connection.patch(connection);
};

export default patchConnections;
