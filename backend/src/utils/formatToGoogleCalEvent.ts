import { calendar_v3 } from 'googleapis';
import { GoogleEvent } from '../@types';
import { isGoogleEvent } from '../@types/typeGuards';
import { BaseError } from '../Errors';

const formattToGoogleEvent = (
    rawEvent: calendar_v3.Schema$Event,
): GoogleEvent => {
    const event: { [property: string]: string } = {};
    if (!rawEvent.id)
        throw new BaseError('', "Missing 'id' in the response data", 400);
    else event.id = rawEvent.id;
    if (!rawEvent.summary)
        throw new BaseError('', "Missing 'summary' in the response data", 400);
    else event.title = rawEvent.summary;
    if (!rawEvent.description)
        throw new BaseError(
            '',
            "Missing 'description' in the response data",
            400,
        );
    else event.description = rawEvent.description;
    if (!rawEvent.start?.dateTime)
        throw new BaseError(
            '',
            "Missing 'start dateTime' in the response data",
            400,
        );
    else event.startDate = rawEvent.start.dateTime;
    if (!rawEvent.end?.dateTime)
        throw new BaseError(
            '',
            "Missing 'end dateTime' in the response data",
            400,
        );
    else event.endDate = rawEvent.end?.dateTime;
    if (!isGoogleEvent(event))
        throw new BaseError('', 'Error assigning data to even', 400);
    return event;
};

export default formattToGoogleEvent;
