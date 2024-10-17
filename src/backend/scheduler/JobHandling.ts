import { FormattedConnType, UnFormattedConnType } from "../../@types/sql";
import { Job } from "../../@types/job";
import mysql from "mysql2/promise";
import { ConnectionOptions } from "mysql2/promise";
const access: ConnectionOptions = {
    host: "localhost",
    user: "root",
    password: "Submarin3z.",
    port: 3306,
    database: "notion_calendar",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

const jobHandling = {
    async init(job: Job) {
        const methodMap: {
            [key: string]: {
                [method: string]: () => Promise<string> | Promise<void>;
            };
        } = {
            CONNECTION: {
                POST: async (): Promise<string> =>
                    await this.connectionPost(job.data as FormattedConnType),
            },
        };
        const handle = methodMap[job.type][job.method];
        const res = await handle();
        return res;
    },
    async connectionPost(newConn: FormattedConnType): Promise<string> {
        const connection = await mysql.createConnection(access);
        //* NEXT STEP: create calendar -> add the new conn to db along with the newly created calendar Id
        try {
            await connection.query("INSERT INTO connections VALUES(?,?,?,?,?,?,?)", [
                newConn.calendarId,
                newConn.calendarName,
                JSON.stringify(newConn.date),
                JSON.stringify(newConn.name),
                JSON.stringify(newConn.description) || null,
                JSON.stringify(newConn.doneMethod) || null,
                JSON.stringify(newConn.doneMethodOption) || null,
            ]);
            await connection.end();
            return "Here is a calendar id";
        } catch (err) {
            connection.end();
            throw err;
        }
    },
};
export default jobHandling;
