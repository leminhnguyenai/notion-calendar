import { UnFormattedConnType } from "../@types/sql";
import { isOption } from "./isOption";

export function isUnformattedConn(obj: unknown): obj is UnFormattedConnType {
    return (
        typeof obj == "object" &&
        obj !== null &&
        typeof (obj as UnFormattedConnType).calendar_id == "string" &&
        typeof (obj as UnFormattedConnType).calendar_name == "string" &&
        (obj as UnFormattedConnType).date !== null &&
        isOption((obj as UnFormattedConnType).date) &&
        (obj as UnFormattedConnType).name !== null &&
        isOption((obj as UnFormattedConnType).name) &&
        ((obj as UnFormattedConnType).description === null ||
            isOption((obj as UnFormattedConnType).description)) &&
        ((obj as UnFormattedConnType).done_method === null ||
            isOption((obj as UnFormattedConnType).done_method)) &&
        ((obj as UnFormattedConnType).done_method_option === null ||
            isOption((obj as UnFormattedConnType).done_method_option))
    );
}
