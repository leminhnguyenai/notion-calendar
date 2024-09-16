const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

exports.CONS_DB_PATH = path.join(__dirname, "..", "./database/connections.json");
exports.CONFIG_PATH = path.join(__dirname, "..", "./database/config.json");
exports.NOTION_KEY = process.env.NOTION_KEY;
