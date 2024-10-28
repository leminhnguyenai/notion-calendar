import isJob from "./isJob";
import { isUnformattedConn } from "./isUnformattedConn";
function isJobRequest(obj) {
    const baseCondition = typeof obj == "object" &&
        obj !== null &&
        "id" in obj &&
        "job" in obj &&
        "status" in obj &&
        typeof obj.id == "string" &&
        isJob(obj.job) &&
        typeof obj.status == "number";
    const request = obj;
    if (request.status == 200)
        return (baseCondition &&
            !("error" in request) &&
            "responseData" in request &&
            (typeof request.responseData == "object" || isUnformattedConn(request.responseData)));
    else if (request.status == 400 || request.status == 404 || request.status == 502)
        return (baseCondition &&
            !("responseData" in request) &&
            "error" in request &&
            typeof request.error == "string");
    else
        return (baseCondition &&
            !("error" in obj) &&
            !("responseData" in obj));
}
export default isJobRequest;
