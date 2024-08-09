require("dotenv").config({ path: "../.env" });
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });

//Function to search for data based on the type of it
function findData(object, name) {
  return new Promise(async (resolve, reject) => {
    // Handle if the type is created_by or last_edited_by
    if (name == "created_by" || name == "last_edited_by") {
      // Get the user list
      const response = await notion.users.list();
      const userList = response.results;
      // Search for the user name according to the id provided
      for (let i = 0; i <= userList.length - 1; i++) {
        if (userList[i].id === object[name].id) {
          resolve(userList[i].name);
        }
      }
      reject("Failed to fetch user");
    }
    // Hanlde if it is property
    else {
      const property = object.properties[name];
      switch (property.type) {
        case "title":
          resolve(property.title[0].plain_text);
          break;
        case "formula":
          let content =
            property.formula.boolean ||
            property.formula.date ||
            property.formula.number ||
            property.formula.string;
          if (content) resolve(content);
          else if (content === null) resolve("");
          else reject("Failed to fetch formula content");
          break;
        case "rich_text":
          if (property.rich_text.length === 0) resolve("");
          else resolve(property.rich_text[0].plain_text);
          break;
        case "email":
          if (property.email === null) resolve("");
          else resolve("Email: " + property.email);
          break;
        case "files":
          if (property.files.length === 0) resolve("");
          else resolve("Files link: " + property.files[0].external.url);
          break;
        case "select":
          if (property.select === null) resolve("");
          else resolve(property.select.name);
          break;
        case "multi_select":
          if (property.multi_select.length === 0) resolve("");
          else
            resolve(
              property.multi_select.options
                .map((option) => option.name)
                .join(", ")
            );
          break;
        case "people":
          if (property.people.length === 0) resolve("");
          else
            resolve(
              name +
                ": " +
                property.people.map((person) => person.name).join(", ")
            );
          break;
        case "phone_number":
          if (property.phone_number === null) resolve("");
          else resolve("Phone number: " + property.phone_number);
          break;
        case "status":
          resolve("Status: " + property.status.name);
          break;
        case "url":
          if (property.url === null) resolve("");
          else resolve("Phone number: " + property.url);
          break;
      }
    }
  });
}

function doneStatus(object, name, id) {
  return new Promise((resolve, reject) => {
    if (name == "none") resolve("");
    else {
      const property = object.properties[name];
      switch (property.type) {
        case "checkbox":
          if (property.checkbox == true) {
            resolve("[DONE] - ");
            break;
          } else {
            resolve("");
            break;
          }
        case "select":
          if (property[property.type].id == id) {
            resolve("[DONE] - ");
            break;
          } else {
            resolve("");
            break;
          }
        case "status":
          if (property[property.type].id == id) {
            resolve("[DONE] - ");
            break;
          } else {
            resolve("");
            break;
          }
      }
    }
  });
}

module.exports = {
  findData,
  doneStatus,
};
