import { Job } from "./JobRequest";
import { isFormattedConn } from "./isFormattedConn";

function isJob(obj: unknown): obj is Job {
    return (
        typeof obj == "object" &&
        obj !== null &&
        "method" in (obj as Job) &&
        "type" in (obj as Job) &&
        "data" in (obj as Job) &&
        ((obj as Job).method == "POST" ||
            (obj as Job).method == "PATCH" ||
            (obj as Job).method == "DELETE") &&
        ((obj as Job).type == "CONNECTION" || (obj as Job).type == "CONFIG") &&
        (isFormattedConn((obj as Job).data) ||
            typeof (obj as Job).data == "object")
    );
}

export default isJob;
