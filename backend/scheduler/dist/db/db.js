import dotenv from "dotenv";
import mysql from "mysql2/promise";
import path from "path";
import { deleteConnInDb, patchConnInDb, postConnToDb } from "./connections";
import { patchSettinginDb } from "./relations";
dotenv.config({ path: path.join(__dirname, "../../../config/.env") });
const access = {
    host: "localhost",
    user: "root",
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};
let pool = undefined;
let poolCount = 0;
async function controller(callback, input) {
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
const db = {
    async init() {
        pool = mysql.createPool(access);
        setTimeout(() => {
            pool?.end();
            pool = undefined;
        }, 60000);
    },
    connection: {
        post: (newConn) => controller(postConnToDb, newConn),
        patch: (updatedConn) => controller(patchConnInDb, updatedConn),
        delete: (deletedCalendarId) => controller(deleteConnInDb, deletedCalendarId),
    },
    relation: {
        patch: (newSetting) => controller(patchSettinginDb, newSetting),
    },
};
export default db;
