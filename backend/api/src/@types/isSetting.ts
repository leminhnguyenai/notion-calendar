import { Setting } from "./settings";

function isSetting(obj: unknown): obj is Setting {
    return (
        "user_id" in (obj as Setting) &&
        typeof (obj as Setting).user_id == "number" &&
        "refresh_rate" in (obj as Setting) &&
        typeof (obj as Setting).refresh_rate == "number"
    );
}

export default isSetting;
