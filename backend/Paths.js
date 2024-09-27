const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

exports.CONS_DB_PATH = path.join(__dirname, "..", "./database/connections.json");
exports.CONFIG_PATH = path.join(__dirname, "..", "./database/config.json");
exports.RELATIONS_PATH = path.join(__dirname, "..", "./database/relationTbs");
exports.NOTION_KEY = process.env.NOTION_KEY;
exports.CREDENTIALS_PATH = path.join(__dirname, "..", "/authentication/credentials.json");
exports.TOKEN_PATH = path.join(__dirname, "..", "/authentication/token.json");
exports.CAL_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.settings.readonly",
];
