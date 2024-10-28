import GoogleEvent from "./googleEvent";

function isGoogleEvent(obj: unknown): obj is GoogleEvent {
    return (
        "id" in (obj as GoogleEvent) &&
        "title" in (obj as GoogleEvent) &&
        "description" in (obj as GoogleEvent) &&
        "startDate" in (obj as GoogleEvent) &&
        "endDate" in (obj as GoogleEvent) &&
        typeof (obj as GoogleEvent).id == "string" &&
        typeof (obj as GoogleEvent).title == "string" &&
        typeof (obj as GoogleEvent).description == "string" &&
        typeof (obj as GoogleEvent).startDate == "string" &&
        typeof (obj as GoogleEvent).endDate == "string"
    );
}

export default isGoogleEvent;
