import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest, NotionConnection } from "../../@types";
import { BaseError } from "../../Errors";
import { poolOption } from "../../config/db";
export const deleteConnectionController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const calendar_id = req.body.calendar_id;
        const pool: Pool = mysql.createPool(poolOption(3));
        const [connections] = await pool.query<NotionConnection[]>(
            `SELECT * FROM connections WHERE calendar_id = '${calendar_id}'`
        );
        if (connections.length !== 1) throw new BaseError("", "Error finding connection", 400);
        await pool.query(`DELETE FROM connections WHERE calendar_id = '${calendar_id}'`);
        await pool.end();
        res.status(200).send("Connection deleted successfully");
    } catch (err) {
        next(err);
    }
};
