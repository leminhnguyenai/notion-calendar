import dotenv from "dotenv";
import path from "path";
import { Job } from "../@types/JobRequest";
import { FormattedConnType } from "../@types/connections";
import postConnections from "../controllers/postConnections";
dotenv.config({ path: path.join(__dirname, "../../../config/.env") });

type MethodMap = {
    [key: string]: {
        [method: string]: () => Promise<object>;
    };
};

const jobHandling = {
    async init(job: Job) {
        const methodMap: MethodMap = {
            CONNECTION: {
                POST: async () => await this.postConnections(job.data as FormattedConnType),
            },
        };
        const handle = methodMap[job.type][job.method];
        const res = await handle();
        return res;
    },
    postConnections,
};
export default jobHandling;
