import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest, NotionConnection, User } from "../../@types";
import { BaseError } from "../../Errors";
import { poolOption } from "../../config/db";

export const getConnectionsController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const refresh_token: string | undefined = req.refresh_token;
        if (!refresh_token) throw new BaseError("", "Error finding refresh token", 400);
        //* Now we perform directly action, but later we will wrap it around a method to send to message queue
        const pool: Pool = mysql.createPool(poolOption(2));
        const [users] = await pool.query<User[]>(
            `SELECT * FROM users WHERE refresh_token = '${refresh_token}'`
        );
        if (users.length !== 1) throw new BaseError("", "Error finding user", 400);
        const [connections] = await pool.query<NotionConnection[]>(
            `SELECT calendar_id, calendar_name, date, name, description, done_method, done_method_option FROM connections WHERE user_id = ${users[0].user_id}`
        );
        await pool.end();
        res.status(200).json(connections);
    } catch (err) {
        next(err);
    }
};
