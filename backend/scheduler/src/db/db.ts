import dotenv from "dotenv";
import mysql, { Pool, PoolOptions } from "mysql2/promise";
import path from "path";
import { FormattedConnType } from "../@types/connections";
import { deleteConnInDb, patchConnInDb, postConnToDb } from "./connections";
dotenv.config({ path: path.join(__dirname, "../../../config/.env") });

const access: PoolOptions = {
    host: "localhost",
    user: "root",
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

let pool: Pool | undefined = undefined;
let poolCount: number = 0;

type Db = {
    init(): Promise<void>;
    connection: {
        post: (newConn: FormattedConnType) => Promise<void>;
        patch: (updatedConn: FormattedConnType) => Promise<void>;
        delete: (deletedCalendarId: string) => Promise<void>;
    };
    //* Add one later for relation
};

async function controller<T>(
    callback: (pool: Pool, input: T) => Promise<void>,
    input: T
): Promise<void> {
    if (!pool) {
        pool = mysql.createPool(access);
        poolCount = 100;
    }
    await callback(pool, input);
    poolCount--;
    if (poolCount == 0) {
        pool?.end();
        pool = undefined;
    }
}

const db: Db = {
    async init() {
        pool = mysql.createPool(access);
        setTimeout(() => {
            pool?.end();
            pool = undefined;
        }, 60000);
    },

    connection: {
        post: (newConn: FormattedConnType) => controller(postConnToDb, newConn),
        patch: (updatedConn: FormattedConnType) => controller(patchConnInDb, updatedConn),
        delete: (deletedCalendarId: string) => controller(deleteConnInDb, deletedCalendarId),
    },
};

export default db;
