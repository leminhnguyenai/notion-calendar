import isOption from "./isOption";
export function isUnformattedConn(obj) {
    return (typeof obj == "object" &&
        obj !== null &&
        typeof obj.calendar_id == "string" &&
        typeof obj.calendar_name == "string" &&
        obj.date !== null &&
        isOption(obj.date) &&
        obj.name !== null &&
        isOption(obj.name) &&
        (obj.description === null ||
            isOption(obj.description)) &&
        (obj.done_method === null ||
            isOption(obj.done_method)) &&
        (obj.done_method_option === null ||
            isOption(obj.done_method_option)));
}
