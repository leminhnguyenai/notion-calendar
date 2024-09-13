const fs = require("fs");

async function updateFiles(file_path, callback) {
  try {
    let data = fs.readFileSync(file_path, "utf8");
    data = JSON.parse(data);
    let newData = await callback(data);
    fs.writeFileSync(file_path, JSON.stringify(newData, null, 2), "utf8");
  } catch (err) {
    if (err.code == "ENOENT") {
      fs.writeFile(file_path, JSON.stringify(await callback(err.code), null, 2), "utf8", (error) => {
        if (error) {
          console.error(error);
          throw error;
        }
      });
    } else {
      console.error(err);
      throw err;
    }
  }
}

module.exports = updateFiles;
