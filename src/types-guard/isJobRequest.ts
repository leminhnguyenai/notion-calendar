import isJob from "./isJob";
import { isUnformattedConn } from "./isUnformattedConn";
import { JobRequest } from "../@types/job";

function isJobRequest(obj: unknown): obj is JobRequest {
    const baseCondition =
        typeof obj == "object" &&
        obj !== null &&
        "id" in (obj as JobRequest) &&
        "job" in (obj as JobRequest) &&
        "status" in (obj as JobRequest) &&
        typeof (obj as JobRequest).id == "string" &&
        isJob((obj as JobRequest).job) &&
        typeof (obj as JobRequest).status == "number";
    const request = obj as JobRequest;
    if (request.status == 200)
        return (
            baseCondition &&
            !("error" in request) &&
            "responseData" in request &&
            (typeof request.responseData == "object" || isUnformattedConn(request.responseData))
        );
    else if (request.status == 400 || request.status == 404 || request.status == 502)
        return (
            baseCondition &&
            !("responseData" in request) &&
            "error" in request &&
            typeof request.error == "string"
        );
    else
        return (
            baseCondition &&
            !("error" in (obj as JobRequest)) &&
            !("responseData" in (obj as JobRequest))
        );
}

export default isJobRequest;
