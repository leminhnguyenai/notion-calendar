import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest, NewNotionConnection, User } from "../../@types";
import { BaseError } from "../../Errors";
import { poolOption } from "../../config/db";

export const postConnectionController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const refresh_token: string | undefined = req.refresh_token;
        if (!refresh_token) throw new BaseError("", "Error finding refresh token", 400);
        const newConnection: NewNotionConnection = req.body.connection;
        const pool: Pool = mysql.createPool(poolOption(2));
        const [users] = await pool.query<User[]>("SELECT * FROM users WHERE refresh_token = ?", [
            refresh_token,
        ]);
        if (users.length !== 1) throw new BaseError("", "Error finding user", 400);
        const user_id: number = users[0].user_id;
        await pool.query(`
            INSERT INTO connections VALUES (
                '${new Date().toISOString()}',
                ${user_id},
                '${newConnection.calendar_name}',
                '${JSON.stringify(newConnection.name)}',
                '${JSON.stringify(newConnection.date)}',
                '${JSON.stringify(newConnection.description)}',
                '${JSON.stringify(newConnection.done_method)}',
                '${JSON.stringify(newConnection.done_method_option)}'
            )
        `);
        await pool.end();
        res.status(200).send("Connection created successfully");
    } catch (err) {
        next(err);
    }
};
