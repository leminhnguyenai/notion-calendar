import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest, NotionConnection, NotionConnectionSetting, User } from "../@types";
import { BaseError } from "../Errors";
import { poolOption } from "../config/db";
import MessageQueue from "../services/messageQueue";

export const getConnectionsController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const msgQueue = req.app.get("messageQueue") as MessageQueue;
        const refresh_token: string | undefined = req.refresh_token;
        if (!refresh_token) throw new BaseError("", "Error finding refresh token", 400);
        const pool: Pool = mysql.createPool(poolOption(2));
        const [users] = await msgQueue.enqueue(
            () =>
                pool.query<User[]>(`SELECT * FROM users WHERE refresh_token = '${refresh_token}'`),
            "db"
        );
        if (users.length !== 1) throw new BaseError("", "Error finding user", 400);
        const [connections] = await msgQueue.enqueue(
            () =>
                pool.query<
                    (NotionConnection & Pick<NotionConnectionSetting, "sync_rate" | "statistic">)[]
                >(
                    `SELECT 
                    connections.calendar_id AS calendar_id, 
                    calendar_name, 
                    date, 
                    name, 
                    description, 
                    done_method, 
                    done_method_option,
                    connection_settings.sync_rate AS sync_rate,
                    connection_settings.statistic AS statistic
                FROM ( 
                    connections LEFT JOIN connection_settings ON
                    connection_settings.calendar_id = connections.calendar_id
                ) 
                WHERE user_id = ${users[0].user_id}`
                ),
            "db"
        );
        await pool.end();
        res.status(200).json(connections);
    } catch (err) {
        next(err);
    }
};
