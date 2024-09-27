// Function to display the done status of the event

class MarkAsDone {
  constructor(object, name, id) {
    this.object = object;
    this.name = name;
    this.id = id;
    this.property = object.properties[name];
    this.type = object.properties[name].type;
  }
  init() {
    const typeMethodMap = {
      checkbox: () => this.checkbox(),
      select: () => this.select(),
      status: () => this.status(),
    };
    let propertyValue = typeMethodMap[this.type];
    if (!propertyValue) return "";
    return propertyValue();
  }
  checkbox() {
    if (!this.property.checkbox) return "";
    return "✅ ";
  }
  select() {
    let optionId = this.property[this.type].id;
    if (optionId != this.id) return "";
    return "✅ ";
  }
  status() {
    let optionId = this.property[this.type].id;
    if (optionId != this.id) return "";
    return "✅ ";
  }
}

module.exports = MarkAsDone;
