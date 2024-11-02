import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest, NotionConnection } from "../../@types";
import { BaseError } from "../../Errors";
import { poolOption } from "../../config/db";

export const patchConnectionController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const refresh_token: string | undefined = req.refresh_token;
        if (!refresh_token) throw new BaseError("", "Error finding refresh token", 400);
        const connectionToUpdate: NotionConnection = req.body.connection;
        const pool: Pool = mysql.createPool(poolOption(2));
        const [connections] = await pool.query<NotionConnection[]>(
            `SELECT * FROM connections WHERE calendar_id = '${connectionToUpdate.calendar_id}'`
        );
        if (connections.length !== 1) throw new BaseError("", "Error finding connection", 400);
        await pool.query(`
        UPDATE connections SET 
            calendar_name = '${connectionToUpdate.calendar_name}',
            date = '${JSON.stringify(connectionToUpdate.date)}',
            name = '${JSON.stringify(connectionToUpdate.name)}',
            description = '${JSON.stringify(connectionToUpdate.description)}',
            done_method = '${JSON.stringify(connectionToUpdate.done_method)}',
            done_method_option = '${JSON.stringify(connectionToUpdate.done_method_option)}'
        WHERE calendar_id = '${connectionToUpdate.calendar_id}'
    `);
        await pool.end();
        res.status(200).send("Connection updated successfully");
    } catch (err) {
        next(err);
    }
};
