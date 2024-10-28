import isOption from "./isOption";
export function isFormattedConn(obj) {
    return (typeof obj == "object" &&
        obj !== null &&
        typeof obj.calendarId == "string" &&
        typeof obj.calendarName == "string" &&
        obj.date !== undefined &&
        isOption(obj.date) &&
        obj.name !== undefined &&
        isOption(obj.name) &&
        (obj.description === undefined ||
            isOption(obj.description)) &&
        (obj.doneMethod === undefined ||
            isOption(obj.doneMethod)) &&
        (obj.doneMethodOption === undefined ||
            isOption(obj.doneMethodOption)));
}
