import { Pool } from "mysql2/promise";
import { User } from "../@types";
import { BaseError } from "../Errors";
import MessageQueue from "../services/messageQueue";

const checkUserExist = async (
    pool: Pool,
    msgQueue: MessageQueue,
    refresh_token: string
): Promise<string> => {
    const [users] = await msgQueue.enqueue(
        pool.query<User[]>(`SELECT * FROM users WHERE refresh_token = '${refresh_token}'`),
        "db"
    );
    if (users.length !== 1) throw new BaseError("", "Error finding user", 400);
    return users[0].user_id;
};

export default checkUserExist;
//*
