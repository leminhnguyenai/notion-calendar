import NotionEvent from "./NotionEvent";

function isNotionEvent(obj: unknown): obj is NotionEvent {
    return (
        "id" in (obj as NotionEvent) &&
        "title" in (obj as NotionEvent) &&
        "description" in (obj as NotionEvent) &&
        "created_time" in (obj as NotionEvent) &&
        "startDate" in (obj as NotionEvent) &&
        "endDate" in (obj as NotionEvent) &&
        typeof (obj as NotionEvent).id == "string" &&
        typeof (obj as NotionEvent).title == "string" &&
        typeof (obj as NotionEvent).description == "string" &&
        typeof (obj as NotionEvent).created_time == "string" &&
        typeof (obj as NotionEvent).startDate == "string" &&
        typeof (obj as NotionEvent).endDate == "string"
    );
}

export default isNotionEvent;
