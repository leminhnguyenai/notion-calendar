const fs = require("fs");

async function updateFiles(file_path, callback) {
  fs.readFile(file_path, "utf8", async (err, data) => {
    if (err) {
      if (err.code == "ENOENT") {
        let oldData = {};
        let newData = await callback(oldData);
        fs.writeFile(
          file_path,
          JSON.stringify(newData, null, 2),
          "utf8",
          (err) => {
            if (err) {
              console.log(`Error: ${err}`);
            }
          }
        );
      }
    } else {
      let oldData = JSON.parse(data);
      let newData = await callback(oldData);
      fs.writeFile(
        file_path,
        JSON.stringify(newData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.log(`Error: ${err}`);
          }
        }
      );
    }
  });
}

module.exports = updateFiles;
