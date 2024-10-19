import { UnformattedConnType } from "./connections";
import isOption from "./isOption";

export function isUnformattedConn(obj: unknown): obj is UnformattedConnType {
    return (
        typeof obj == "object" &&
        obj !== null &&
        typeof (obj as UnformattedConnType).calendar_id == "string" &&
        typeof (obj as UnformattedConnType).calendar_name == "string" &&
        (obj as UnformattedConnType).date !== null &&
        isOption((obj as UnformattedConnType).date) &&
        (obj as UnformattedConnType).name !== null &&
        isOption((obj as UnformattedConnType).name) &&
        ((obj as UnformattedConnType).description === null ||
            isOption((obj as UnformattedConnType).description)) &&
        ((obj as UnformattedConnType).done_method === null ||
            isOption((obj as UnformattedConnType).done_method)) &&
        ((obj as UnformattedConnType).done_method_option === null ||
            isOption((obj as UnformattedConnType).done_method_option))
    );
}
