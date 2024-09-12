const updateForm = {
  get_connection_copy(connection) {
    return JSON.parse(JSON.stringify(connection));
  },
  database(connection, originalConnection, selected) {
    let updatedConnection = this.get_connection_copy(connection);
    updatedConnection.database = selected;
    if (updatedConnection.database.value != originalConnection.database.value)
      return {
        calendarName: "",
        calendarId: "",
        database: selected,
        date: { name: "", value: "" },
        name: { name: "", value: "" },
        description: { name: "", value: "" },
        doneMethod: { name: "", value: "" },
        doneMethodOption: { name: "", value: "" },
      };
    else return JSON.parse(JSON.stringify(originalConnection));
  },
  date(connection, selected) {
    let updatedConnection = this.get_connection_copy(connection);
    updatedConnection.date = selected;
    return updatedConnection;
  },
  name(connection, selected) {
    let updatedConnection = this.get_connection_copy(connection);
    updatedConnection.name = selected;
    return updatedConnection;
  },
  description(connection, selected) {
    let updatedConnection = this.get_connection_copy(connection);
    updatedConnection.description = selected;
    return updatedConnection;
  },
  doneMethod(connection, selected) {
    let updatedConnection = this.get_connection_copy(connection);
    updatedConnection.doneMethod = selected;
    return updatedConnection;
  },
  doneMethodOption(connection, selected) {
    let updatedConnection = this.get_connection_copy(connection);
    updatedConnection.doneMethodOption = selected;
    return updatedConnection;
  },
};

export default updateForm;
