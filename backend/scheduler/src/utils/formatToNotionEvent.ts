import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import NotionEvent from "../@types/NotionEvent";
import MarkAsDone from "./MarkAsDone";
import FindNotionData from "./findNotionData";

type OptionalProps = {
    descriptionName?: string;
    doneMethodName?: string;
    doneMethodOptionId?: string;
};

const formatToNotionEvents = (
    rawEvent: PageObjectResponse,
    dateName: string,
    titleName: string,
    optionalProps?: OptionalProps
): NotionEvent => {
    const data = new FindNotionData(rawEvent);
    let status: string;
    let description: string;
    if (!optionalProps) {
        status = "";
        description = "";
    } else {
        const { descriptionName, doneMethodName, doneMethodOptionId } = optionalProps;
        status = doneMethodName
            ? new MarkAsDone(rawEvent).getDoneStatus(doneMethodName, doneMethodOptionId)
            : "";
        description = descriptionName ? data.getData(descriptionName) : "";
    }
    const notionEvent: NotionEvent = {
        id: rawEvent.id,
        title: status + data.getData(titleName),
        description,
        created_time: rawEvent.created_time,
        startDate: data.getData(dateName, "start"),
        endDate: data.getData(dateName, "end"),
    };

    return notionEvent;
};

export default formatToNotionEvents;
