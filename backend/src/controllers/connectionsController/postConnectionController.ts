import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest, NewNotionConnection, User } from "../../@types";
import { BaseError } from "../../Errors";
import { poolOption } from "../../config/db";
import MessageQueue from "../../services/messageQueue";

export const postConnectionController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const msgQueue = req.app.get("messageQueue") as MessageQueue;
        const refresh_token: string | undefined = req.refresh_token;
        if (!refresh_token) throw new BaseError("", "Error finding refresh token", 400);
        const newConnection: NewNotionConnection = req.body.connection;
        const pool: Pool = mysql.createPool(poolOption(3));
        const [users] = await msgQueue.enqueue(() =>
            pool.query<User[]>(`SELECT * FROM users WHERE refresh_token = '${refresh_token}'`)
        );
        if (users.length !== 1) throw new BaseError("", "Error finding user", 400);
        const user_id: number = users[0].user_id;
        //* Create the calendar and retrieve the id
        const calendarId = new Date().toISOString();
        await msgQueue.enqueue(() =>
            pool.query(`
            INSERT INTO connections VALUES (
                '${calendarId}',
                ${user_id},
                '${newConnection.calendar_name}',
                '${JSON.stringify(newConnection.name)}',
                '${JSON.stringify(newConnection.date)}',
                '${JSON.stringify(newConnection.description)}',
                '${JSON.stringify(newConnection.done_method)}',
                '${JSON.stringify(newConnection.done_method_option)}'
            )
        `)
        );
        await msgQueue.enqueue(() =>
            pool.query(`INSERT INTO connection_settings(calendar_id) VALUES('${calendarId}')`)
        );
        await pool.end();
        res.status(200).send("Connection created successfully");
    } catch (err) {
        next(err);
    }
};
