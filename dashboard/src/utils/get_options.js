const get_options = {
  dateTypeList: ["date"],
  nameTypeList: ["title", "formula", "text", "rich_text"],
  descriptionTypeList: [
    "email",
    "file",
    "formula",
    "created_by",
    "updated_by",
    "select",
    "multi_select",
    "people",
    "phone_number",
    "rich_text",
    "status",
    "url",
    "title",
  ],
  doneTypeList: ["select", "status"],
  database(data) {
    let databaseOptionsList = data.map((result) => {
      return {
        name: result.databaseName,
        value: result.databaseId,
      };
    });
    return databaseOptionsList;
  },
  load_options(data, typeList, modified_connection) {
    let database = data.find((result) => result.databaseId == modified_connection.database.value);
    if (typeof database == "undefined") return [];
    let properties = Object.values(database.properties).filter((property) =>
      typeList.includes(property.type)
    );
    let options = properties.map((property) => {
      return {
        name: property.name,
        value: property.id,
      };
    });
    return options;
  },
  date(data, modified_connection) {
    return this.load_options(data, this.dateTypeList, modified_connection);
  },
  name(data, modified_connection) {
    return this.load_options(data, this.nameTypeList, modified_connection);
  },
  description(data, modified_connection) {
    return this.load_options(data, this.descriptionTypeList, modified_connection);
  },
  doneMethod(data, modified_connection) {
    let options = this.load_options(data, this.doneTypeList, modified_connection);
    options.unshift({
      name: "Choose an option",
      value: "",
    });
    return options;
  },
  doneMethodOption(data, modified_connection) {
    let database = data.find((result) => result.databaseId == modified_connection.database.value);
    if (typeof database == "undefined") return [];
    let doneMethodId = modified_connection.doneMethod.value;
    let doneMethodProperty = Object.values(database.properties).find(
      (property) => property.id == doneMethodId
    );
    if (typeof doneMethodProperty == "undefined") return [];
    let options = doneMethodProperty.select.options.map((option) => {
      return {
        name: option.name,
        value: option.id,
      };
    });
    return options;
  },
};

export default get_options;
