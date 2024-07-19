(async () => {
  let databaseList = document.getElementById("database");
  let dateList = document.getElementById("date");
  let nameList = document.getElementById("name");
  let descriptionList = document.getElementById("description");
  let doneList = document.getElementById("done");
  const columnSubmitBtn = document.querySelector(".submitColumns");
  let connection = {};
  // html element to store data for doneMethodOption
  let doneMethodOptionList = document.createElement("select");

  // Get the database list
  const response = await fetch("/search", {
    method: "GET",
  });

  // Add the options to the database
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
      dateList.innerHTML = '<option value="none">No column selected</option>';
      nameList.innerHTML = '<option value="none">No column selected</option>';
      descriptionList.innerHTML =
        '<option value="none">No column selected</option>';
      doneList.innerHTML = '<option value="none">No column selected</option>';
      let unfilteredColumnList =
        databaseSearchResult[databaseList.value].properties;
      console.log(unfilteredColumnList);

      //add options to the date
      for (let i = 0; i <= unfilteredColumnList.length - 1; i++) {
        if (unfilteredColumnList[i].type == "date") {
          let newOption = document.createElement("option");
          newOption.value = unfilteredColumnList[i].name;
          newOption.text = unfilteredColumnList[i].name;
          dateList.appendChild(newOption);
        }
      }

      //add options to the name
      for (let i = 0; i <= unfilteredColumnList.length - 1; i++) {
        if (
          unfilteredColumnList[i].type == "title" ||
          unfilteredColumnList[i].type == "formula" ||
          unfilteredColumnList[i].type == "rich_text"
        ) {
          let newOption = document.createElement("option");
          newOption.value = unfilteredColumnList[i].name;
          newOption.text = unfilteredColumnList[i].name;
          nameList.appendChild(newOption);
        }
      }

      //add options to the description
      const validDescriptionType = [
        "email",
        "files",
        "formula",
        "select",
        "multi_select",
        "people",
        "phone_number",
        "rich_text",
        "status",
        "url",
      ];
      for (let i = 0; i <= unfilteredColumnList.length - 1; i++) {
        if (validDescriptionType.includes(unfilteredColumnList[i].type)) {
          let newOption = document.createElement("option");
          newOption.value = unfilteredColumnList[i].name;
          newOption.text = unfilteredColumnList[i].name;
          descriptionList.appendChild(newOption);
        }
      }
      let newOption1 = document.createElement("option");
      let newOption2 = document.createElement("option");
      newOption1.value = "created_by";
      newOption2.value = "last_edited_by";
      newOption1.text = "created by";
      newOption2.text = "last edited by";
      descriptionList.appendChild(newOption1);
      descriptionList.appendChild(newOption2);

      // Add options to the done method
      const validDoneType = ["checkbox", "status", "select"];
      for (let i = 0; i <= unfilteredColumnList.length - 1; i++) {
        if (validDoneType.includes(unfilteredColumnList[i].type)) {
          let newOption = document.createElement("option");
          newOption.value = unfilteredColumnList[i].name;
          newOption.text =
            unfilteredColumnList[i].name + ` (${unfilteredColumnList[i].type})`;
          doneList.appendChild(newOption);
        }
      }
      // Add option according to the done method choosen
      let submitDoneMethodBtn = document.querySelector(".submitDoneMethod");
      submitDoneMethodBtn.addEventListener("click", () => {
        if (doneList.value == "none") {
          let alert = document.getElementById("alert");
          alert.style = "color: #E4003A;";
          alert.textContent = `You havent't filled all column yet !`;
        } else {
          // forEach execute a function on each element of the array
          unfilteredColumnList.forEach((property) => {
            if (property.name == doneList.value) {
              if (property.type != "checkbox") {
                let list = property.optionsList;
                doneMethodOptionList.id = "doneOption";
                doneMethodOptionList.innerHTML =
                  '<option value="none">No column selected</option>';
                for (let i = 0; i <= list.length - 1; i++) {
                  let newOption = document.createElement("option");
                  newOption.value = list[i].id;
                  newOption.text = list[i].name;
                  doneMethodOptionList.appendChild(newOption);
                }
                let insert = document.querySelector(".insert");
                insert.insertBefore(
                  doneMethodOptionList,
                  document.querySelector(".submitDoneMethod")
                );
                document.querySelector(".submitDoneMethod").style =
                  "opacity: 0;";
              } else {
                doneMethodOptionList.id = "doneOption";
                doneMethodOptionList.innerHTML = `<option value = "checked"></option>`;
              }
            }
          });
        }
      });
    }
  });

  //Create the connection info
  columnSubmitBtn.addEventListener("click", () => {
    if (
      dateList.value == "none" ||
      nameList.value == "none" ||
      descriptionList.value == "none" ||
      doneMethodOptionList.value == "none"
    ) {
      // handle if no column is selected
      let alert = document.getElementById("alert");
      alert.style = "color: #E4003A;";
      alert.textContent = `You havent't filled all column yet !`;
    } else {
      let alert = document.getElementById("alert");
      alert.textContent = "";
      connection = {
        databaseId: databaseSearchResult[databaseList.value].id,
        dateColumn: dateList.value,
        nameColumn: nameList.value,
        descriptionColumn: descriptionList.value,
        doneMethod: doneList.value,
        doneMethodOption: doneMethodOptionList.value,
      };
    }
    console.log(connection);
  });

  //Send the connection info
  const syncBtn = document.querySelector(".submitForm");
  syncBtn.addEventListener("click", async () => {
    if (Object.keys(connection).length == 0) {
      let alert = document.getElementById("alert");
      alert.style = "color: #E4003A;";
      alert.textContent = `You havent't filled all column yet !`;
      console.log("Missing info");
      syncBtn.textContent = "Not Synced !";
      setTimeout(() => {
        syncBtn.textContent = "Sync";
      }, 2000);
    } else {
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
    }
  });
})();
