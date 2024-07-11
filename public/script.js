(async () => {
  let databaseList = document.getElementById("database");
  let columnList = document.getElementById("column");
  let connection = {};

  // Get the database list
  const response = await fetch("/search", {
    method: "GET",
  });

  // Add the databases to the options
  let databaseSearchResult = await response.json();
  console.log(databaseSearchResult);
  for (let i = 0; i <= databaseSearchResult.length - 1; i++) {
    let newOption = document.createElement("option");
    newOption.value = i;
    newOption.text = databaseSearchResult[i].database;
    databaseList.appendChild(newOption);
  }

  //Add columns to the options
  const dbSubmitBtn = document.querySelector(".submit.database");
  dbSubmitBtn.addEventListener("click", () => {
    console.log(databaseList.value);
    if (databaseList.value == "none") {
      // handle if no database is selected
      let alert = document.getElementById("alert");
      alert.style = "color: #E4003A;";
      alert.textContent = `You haven't selected any database !`;
    } else {
      // reset column options
      let alert = document.getElementById("alert");
      alert.textContent = "";
      columnList.innerHTML = '<option value="none">No column selected</option>';
      let unfilteredColumnList =
        databaseSearchResult[databaseList.value].properties;
      console.log(unfilteredColumnList);

      for (let i = 0; i <= unfilteredColumnList.length - 1; i++) {
        if (unfilteredColumnList[i].type == "date") {
          let newOption = document.createElement("option");
          newOption.value = unfilteredColumnList[i].name;
          newOption.text = unfilteredColumnList[i].name;
          columnList.appendChild(newOption);
        }
      }
    }
  });

  //Create the connection info
  const columnSubmitBtn = document.querySelector(".submit.column");
  columnSubmitBtn.addEventListener("click", () => {
    if (columnList.value == "none") {
      // handle if no column is selected
      let alert = document.getElementById("alert");
      alert.style = "color: #E4003A;";
      alert.textContent = `You haven't selected any column !`;
    } else {
      let alert = document.getElementById("alert");
      alert.textContent = "";
      connection = {
        databaseId: databaseSearchResult[databaseList.value].id,
        columnName: columnList.value,
      };
    }
    console.log(connection);
  });

  //Send the connection info
  const syncBtn = document.querySelector(".submitForm");
  syncBtn.addEventListener("click", async () => {
    try {
      fetch("/connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(connection, null, 2),
      });
    } catch (error) {
      console.log("Sync failed");
    } finally {
      console.log("Sync succeeded");
      syncBtn.textContent = "Synced !";
      setTimeout(() => {
        syncBtn.textContent = "Sync";
      }, 2000);
    }
  });
})();
