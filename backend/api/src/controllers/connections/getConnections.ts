import { Request, Response, NextFunction } from "express";
import mysql, { ConnectionOptions } from "mysql2/promise";
import formattConnection from "../../utils/formattConnections";
import path from "path";
import dotenv from "dotenv";
import { UnformattedConnType } from "../../@types/connections";
import { isUnformattedConn } from "../../@types/isUnformattedConn";
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

const getConnections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conn = await mysql.createConnection(access);
        const [results] = await conn.query("SELECT * FROM connections ORDER BY calendar_name ASC");
        const formattedConns = (results as []).map((unformattedConn: UnformattedConnType) => {
            if (!isUnformattedConn(unformattedConn))
                throw new SqlError("Invalid query results", 400);
            return formattConnection(unformattedConn);
        });
        res.status(200).json(formattedConns);
    } catch (err) {
        next(err);
    }
};

export default getConnections;
