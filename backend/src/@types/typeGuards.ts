import { GoogleEvent, NewNotionConnection, NotionConnection, Option } from '.';

export const isOption = (obj: unknown): obj is Option => {
    return (
        typeof obj == 'object' &&
        obj !== null &&
        'name' in obj &&
        typeof obj.name == 'string' &&
        'id' in obj &&
        typeof obj.id == 'string'
    );
};

export const isNewNotionConnection = (
    obj: unknown,
): obj is NewNotionConnection => {
    return (
        typeof obj == 'object' &&
        obj !== null &&
        'calendar_name' in obj &&
        typeof obj.calendar_name == 'string' &&
        (!('sync_rate' in obj) || typeof obj.sync_rate == 'number') &&
        (!('statistic' in obj) || obj.statistic == 0 || obj.statistic == 1) &&
        'name' in obj &&
        isOption(obj.name) &&
        'date' in obj &&
        isOption(obj.date) &&
        'db' in obj &&
        isOption(obj.db) &&
        'description' in obj &&
        (obj.description === null || isOption(obj.description)) &&
        'done_method' in obj &&
        (obj.done_method === null || isOption(obj.done_method)) &&
        'done_method_option' in obj &&
        (obj.done_method_option === null || isOption(obj.done_method_option))
    );
};

export const isNotionConenction = (obj: unknown): obj is NotionConnection => {
    return (
        typeof obj == 'object' &&
        obj !== null &&
        'connection_id' in obj &&
        typeof obj.connection_id == 'string' &&
        'calendar_id' in obj &&
        typeof obj.calendar_id == 'string' &&
        'user_id' in obj &&
        typeof obj.user_id == 'string' &&
        'calendar_name' in obj &&
        typeof obj.calendar_name == 'string' &&
        'sync_rate' in obj &&
        typeof obj.sync_rate == 'number' &&
        'statistic' in obj &&
        (obj.statistic == 0 || obj.statistic == 1) &&
        'next_execution_time' in obj &&
        typeof obj.next_execution_time == 'string' &&
        'busy' in obj &&
        (obj.busy == 0 || obj.busy == 1) &&
        'name' in obj &&
        isOption(obj.name) &&
        'date' in obj &&
        isOption(obj.date) &&
        'db' in obj &&
        isOption(obj.db) &&
        'description' in obj &&
        (obj.description === null || isOption(obj.description)) &&
        'done_method' in obj &&
        (obj.done_method === null || isOption(obj.done_method)) &&
        'done_method_option' in obj &&
        (obj.done_method_option === null || isOption(obj.done_method_option))
    );
};

export const isGoogleEvent = (obj: unknown): obj is GoogleEvent => {
    return (
        'id' in (obj as GoogleEvent) &&
        'title' in (obj as GoogleEvent) &&
        'description' in (obj as GoogleEvent) &&
        'startDate' in (obj as GoogleEvent) &&
        'endDate' in (obj as GoogleEvent) &&
        typeof (obj as GoogleEvent).id == 'string' &&
        typeof (obj as GoogleEvent).title == 'string' &&
        typeof (obj as GoogleEvent).description == 'string' &&
        typeof (obj as GoogleEvent).startDate == 'string' &&
        typeof (obj as GoogleEvent).endDate == 'string'
    );
};
