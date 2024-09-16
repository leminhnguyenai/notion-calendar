const fs = require("fs").promises;

const checkFileExistIfNotCreate = (filePath) => async (req, res, next) => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify([]), "utf8");
  }
  next();
};

module.exports = checkFileExistIfNotCreate;
