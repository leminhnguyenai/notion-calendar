import dotenv from "dotenv";
import { ConnectionOptions } from "mysql2/promise";
import path from "path";
import { Job } from "../@types/JobRequest";
import { FormattedConnType, UnformattedConnType } from "../@types/connections";
import postConnections from "../controllers/postConnections";
dotenv.config({ path: path.join(__dirname, "../../../config/.env") });
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

type MethodMap = {
    [key: string]: {
        [method: string]: () => Promise<object>;
    };
};

const jobHandling = {
    async init(job: Job) {
        const methodMap: MethodMap = {
            CONNECTION: {
                POST: async (): Promise<object> =>
                    await this.postConnections(job.data as FormattedConnType, access),
            },
        };
        const handle = methodMap[job.type][job.method];
        const res = await handle();
        return res;
    },
    postConnections,
};
export default jobHandling;
