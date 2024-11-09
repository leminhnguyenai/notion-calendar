import { Pool } from "mysql2/promise";
import { NotionConnection } from "../@types";
import { BaseError } from "../Errors";
import MessageQueue from "../services/messageQueue";

const checkConnectionExist = async (
    pool: Pool,
    msgQueue: MessageQueue,
    connection_id: string
): Promise<NotionConnection> => {
    const [connections] = await msgQueue.enqueue(
        pool.query<NotionConnection[]>(
            `SELECT * FROM connections WHERE connection_id = '${connection_id}'`
        ),
        "db"
    );
    if (connections.length !== 1) throw new BaseError("", "Error finding connection", 400);
    return connections[0];
};

export default checkConnectionExist;
