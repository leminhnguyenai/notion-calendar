const fs = require("fs").promises;

const checkFileExistIfNotCreate = (filePath, defaultValue) => async (req, res, next) => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, defaultValue, "utf8");
  }
  next();
};

module.exports = checkFileExistIfNotCreate;
