import { FormattedConnType } from "../@types/connections";
import db from "../db/db";

const postConnections = async (connection: FormattedConnType): Promise<object> => {
    const newConn = JSON.parse(JSON.stringify(connection));
    await db.connection.post(newConn);
    return {
        calendarId: "This is calendar ID",
    };
};

export default postConnections;
