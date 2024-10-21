import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import mysql, { ConnectionOptions } from "mysql2/promise";
import path from "path";
import { SqlError } from "../../Errors";
dotenv.config({ path: path.join(__dirname, "../../../../config/.env") });
const access: ConnectionOptions = {
    host: "localhost",
    user: "root",
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    queueLimit: 0,
    connectionLimit: 10,
};

const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conn = await mysql.createConnection(access);
        const [results] = await conn.query("SELECT * FROM settings WHERE user_id = 1");
        if (!Array.isArray(results)) throw new SqlError("Invalid SQL results", 400);
        else res.status(200).json(results[0]);
    } catch (err) {
        next(err);
    }
};
export default getSettings;
