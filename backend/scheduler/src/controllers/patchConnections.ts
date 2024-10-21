import { FormattedConnType } from "../@types/connections";
import db from "../db/db";

const patchConnections = async (connection: FormattedConnType): Promise<void> => {
    const updatedConn = JSON.parse(JSON.stringify(connection));
    await db.connection.patch(updatedConn);
};

export default patchConnections;
