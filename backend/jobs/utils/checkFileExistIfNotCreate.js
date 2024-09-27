const fs = require("fs").promises;

const checkFileExistIfNotCreate = async (filePath, defaultValue) => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, defaultValue, "utf8");
  }
};

module.exports = checkFileExistIfNotCreate;
