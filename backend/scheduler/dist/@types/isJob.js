import { isFormattedConn } from "./isFormattedConn";
function isJob(obj) {
    return (typeof obj == "object" &&
        obj !== null &&
        "method" in obj &&
        "type" in obj &&
        "data" in obj &&
        (obj.method == "POST" ||
            obj.method == "PATCH" ||
            obj.method == "DELETE") &&
        (obj.type == "CONNECTION" || obj.type == "CONFIG") &&
        (isFormattedConn(obj.data) ||
            "calendarId" in obj.data ||
            typeof obj.data == "object"));
}
export default isJob;
