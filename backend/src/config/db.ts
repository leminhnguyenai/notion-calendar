import dotenv from "dotenv";
import { ConnectionOptions, PoolOptions } from "mysql2/promise";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const connectionOption: ConnectionOptions = {
    host: "localhost",
    user: "root",
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
};

export const poolOption = (queueLimit: number): PoolOptions => {
    return {
        host: "localhost",
        user: "root",
        password: process.env.DATABASE_PASSWORD,
        port: Number(process.env.DATABASE_PORT),
        database: process.env.DATABASE_NAME,
        waitForConnections: true,
        queueLimit,
    };
};
