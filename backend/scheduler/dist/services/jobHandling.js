import dotenv from "dotenv";
import path from "path";
import deleteConnections from "../controllers/deleteConnections";
import patchConnections from "../controllers/patchConnections";
import patchSetting from "../controllers/patchSetting";
import postConnections from "../controllers/postConnections";
dotenv.config({ path: path.join(__dirname, "../../../config/.env") });
const jobHandling = {
    async init(job) {
        const methodMap = {
            CONNECTION: {
                POST: async () => await this.postConnections(job.data),
                PATCH: async () => await this.patchConnections(job.data),
                DELETE: async () => await this.deleteConnections(job.data),
            },
            CONFIG: {
                PATCH: async () => await this.patchSetting(job.data),
            },
        };
        const handle = methodMap[job.type][job.method];
        const res = await handle();
        return res;
    },
    postConnections,
    patchConnections,
    deleteConnections,
    patchSetting,
};
export default jobHandling;
