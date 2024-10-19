import { UnformattedConnType, FormattedConnType } from "../@types/connections";

function formattConnection(connection: UnformattedConnType): FormattedConnType {
    const formattedConn: FormattedConnType = {
        calendarId: connection.calendar_id,
        calendarName: connection.calendar_name,
        date: connection.date,
        name: connection.name,
    };
    if (connection.description !== null) formattedConn.description = connection.description;
    if (connection.done_method !== null) formattedConn.doneMethod = connection.done_method;
    if (connection.done_method_option !== null)
        formattedConn.doneMethodOption = connection.done_method_option;
    return formattedConn;
}

export default formattConnection;
