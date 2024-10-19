import { FormattedConnType } from "./connections";
import isOption from "./isOption";

export function isFormattedConn(obj: unknown): obj is FormattedConnType {
    return (
        typeof obj == "object" &&
        obj !== null &&
        typeof (obj as FormattedConnType).calendarId == "string" &&
        typeof (obj as FormattedConnType).calendarName == "string" &&
        (obj as FormattedConnType).date !== undefined &&
        isOption((obj as FormattedConnType).date) &&
        (obj as FormattedConnType).name !== undefined &&
        isOption((obj as FormattedConnType).name) &&
        ((obj as FormattedConnType).description === undefined ||
            isOption((obj as FormattedConnType).description)) &&
        ((obj as FormattedConnType).doneMethod === undefined ||
            isOption((obj as FormattedConnType).doneMethod)) &&
        ((obj as FormattedConnType).doneMethodOption === undefined ||
            isOption((obj as FormattedConnType).doneMethodOption))
    );
}
