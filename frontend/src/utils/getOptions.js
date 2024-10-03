const getOptions = {
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
    const databaseOptionsList = data.map((result) => {
      return {
        name: result.databaseName,
        value: result.databaseId,
      };
    });
    return databaseOptionsList;
  },
  load_options(data, typeList, connection) {
    // Get the database
    const database = data.find(
      (result) => result.databaseId == connection.database.value,
    );
    if (typeof database == "undefined") return [];
    // List all the suitable property based on type list
    const properties = Object.values(database.properties).filter((property) =>
      typeList.includes(property.type),
    );
    const options = properties.map((property) => {
      return {
        name: property.name,
        value: property.id,
      };
    });
    return options;
  },
  date(data, connection) {
    return this.load_options(data, this.dateTypeList, connection);
  },
  name(data, connection) {
    return this.load_options(data, this.nameTypeList, connection);
  },
  description(data, connection) {
    let options = this.load_options(data, this.descriptionTypeList, connection);
    options.unshift({
      name: "Choose an option",
      value: "",
    });
    return options;
  },
  doneMethod(data, connection) {
    let options = this.load_options(data, this.doneTypeList, connection);
    options.unshift({
      name: "Choose an option",
      value: "",
    });
    return options;
  },
  doneMethodOption(data, connection) {
    let database = data.find(
      (result) => result.databaseId == connection.database.value,
    );
    if (typeof database == "undefined") return [];
    let doneMethodId = connection.doneMethod.value;
    let doneMethodProperty = Object.values(database.properties).find(
      (property) => property.id == doneMethodId,
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

export default getOptions;
