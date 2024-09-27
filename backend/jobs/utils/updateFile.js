const fs = require("fs").promises;

const updateFile = async (path, callback) => {
  try {
    const data = JSON.parse(await fs.readFile(path, "utf8"));
    const newData = await callback(data);
    await fs.writeFile(path, JSON.stringify(newData), "utf8");
  } catch (err) {
    throw err;
  }
};

module.exports = updateFile;
