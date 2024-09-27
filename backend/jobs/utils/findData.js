//Function to search for data based on the type of it
class FindData {
  constructor(object, name) {
    this.object = object;
    this.name = name;
    this.property = object.properties[name];
    this.type = object.properties[name].type;
  }
  init() {
    const typeMethodMap = {
      title: () => this.title(),
      formula: () => this.formula(),
      rich_text: () => this.rich_text(),
      email: () => this.email(),
      files: () => this.files(),
      select: () => this.select(),
      multi_select: () => this.multi_select(),
      people: () => this.people(),
      phone_number: () => this.phone_number(),
      status: () => this.status(),
      url: () => this.url(),
    };

    let propertyValue = typeMethodMap[this.type];
    if (!propertyValue) return "";
    return propertyValue();
  }
  title() {
    let titleObject = this.property.title[0];
    if (!titleObject) return "";
    return titleObject.plain_text;
  }
  formula() {
    let formula = this.property.formula;
    let content = formula.boolean || formula.date || formula.number || formula.string || undefined;
    if (!content) return "";
    return content;
  }
  rich_text() {
    let richTextObject = this.property.rich_text[0];
    if (!richTextObject) return "";
    return richTextObject.plain_text;
  }
  email() {
    let email = this.property.email;
    if (!email) return "";
    return `Email: ${email}`;
  }
  files() {
    let fileObject = this.property.files[0];
    if (!fileObject) return "";
    return `File link: ${fileObject.external.url}`;
  }
  select() {
    let selectObject = this.property.select;
    if (!selectObject) return "";
    return selectObject.name;
  }
  multi_select() {
    let optionsList = this.property.multi_select.options;
    if (optionsListlength == 0) return "";
    return optionsList.map((option) => option.name).join(", ");
  }
  people() {
    let peopleList = this.property.people;
    if (peopleList == 0) return "";
    return `names: ${peopleList.map((person) => person.name).join(", ")}`;
  }
  phone_number() {
    let phoneNumber = this.property.phone_number;
    if (!phoneNumber) return "";
    return phoneNumber;
  }
  status() {
    let status = this.property.status.name;
    if (!status) return "";
    return status;
  }
  url() {
    let url = this.property.url;
    if (!url) return "";
    return url;
  }
}

module.exports = FindData;
