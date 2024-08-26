let app = Vue.createApp({
  data: function () {
    return {
      connectionList: [],
      notiondata: "",
      create_con: false,
      load_connection: false,
      load_notiondata: false,
    };
  },
  computed: {
    blank_connection() {
      return {
        calendarId: "",
        database: "",
        date: "",
        name: "",
        description: "",
        doneMethod: "",
        doneMethodOption: "",
      };
    },
  },
  methods: {
    create_new_con() {
      if (this.load_connection == true && this.load_notiondata == true) this.create_con = !this.create_con;
    },
  },
  watch: {
    connectionList(newData, oldData) {
      (this.load_connection = true), console.log("Connection data uploaded");
    },
    notiondata(newData, oldData) {
      (this.load_notiondata = true), console.log("NotionData uploaded");
    },
  },
  mounted() {
    fetch("http://localhost:6060/api/reformat/connections", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        this.connectionList = JSON.parse(JSON.stringify(data, null, 2));
        console.log(this.connectionList);
      })
      .catch((err) => {
        console.error(err);
      });

    fetch("http://localhost:6060/dashboard/fetchData", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        this.notiondata = JSON.parse(JSON.stringify(data, null, 2));
      })
      .catch((err) => {
        console.error(err);
      });
  },
});
app.component("addbtn", {
  template: `
  <button
  type="button"
  class="fixed size-14 right-0 bottom-0 m-4 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-gray-300 active:bg-gray-350 active:scale-95 shadow-md">
  <span class="text-4xl text-[#202020] material-symbols-outlined"> add </span>
</button>
  `,
});
app.component("connection", {
  template: `
  <div @click="open_tab" class="bg-[#FF8225] col-span-1 h-32 rounded-md select-none cursor-pointer transition-all duration-200 hover:bg-[#FF8225]/75 active:bg-[#FF8225]/50 active:scale-95">
    <p class="relative text-slate-100 text-lg mx-4 my-2"> {{ localconnection.database.name }} </p>
  </div>
  <configuration-tab v-if="open_config_tab" :localconnection="connection" :localnotiondata="notion_data" :new_con="false" @tab="(tab) => this.open_config_tab = tab"></configuration-tab>
  `,
  props: ["localconnection", "localnotiondata"],
  data() {
    return {
      data_loaded: false,
      open_config_tab: false,
      notion_data: "",
      connection: JSON.parse(JSON.stringify(this.localconnection, null, 2)),
    };
  },
  methods: {
    open_tab() {
      if (this.data_loaded == true) {
        this.open_config_tab = !this.open_config_tab;
      }
    },
  },
  watch: {
    localnotiondata(newData) {
      console.log(`Notion data recieved`);
      this.data_loaded = true;
      this.notion_data = JSON.parse(JSON.stringify(newData, null, 2));
    },
  },
});
app.component("configuration-tab", {
  template: `
  <div
      v-if="!close_tab"
      class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#000000] size-4/5 rounded-lg shadow-md select-none flex"
  >
      <div class="grid grid-cols-3 gap-4 mx-4 my-8 h-4/6 w-full">
          <div class="col-span-1 h-full bg-[#545454]/40 rounded-md">
              <p class="relative mx-4 my-2 text-slate-100">Database</p>
              <custom-select
                  class="mx-4 my-2"
                  :defaultvalue="new_connection ? default_empty_option : localconnection.database"
                  :optionsvalue="database_options_list"
                  @selected="(selected)=>updateForm(selected, 'database')"
              ></custom-select>
          </div>
          <div class="col-span-1 h-full bg-[#545454]/40 rounded-md">
              <span
                  v-if="loading_properties"
                  class="animate-spin mx-4 my-2 text-slate-100 material-symbols-outlined"
              >
                  progress_activity
              </span>
              <div v-if="!loading_properties">
                  <p class="relative mx-4 my-2 text-slate-100">Date</p>
                  <custom-select
                      class="mx-4 my-2"
                      :defaultvalue="new_connection ? default_empty_option : localconnection.date"
                      :optionsvalue="load_options('date')"
                      @selected="(selected)=>updateForm(selected, 'date')"
                  ></custom-select>
                  <p class="relative mx-4 my-2 text-slate-100">Name</p>
                  <custom-select
                      class="mx-4 my-2"
                      :defaultvalue="new_connection ? default_empty_option : localconnection.name"
                      :optionsvalue="load_options('name')"
                      @selected="(selected)=>updateForm(selected, 'name')"
                  ></custom-select>
                  <p class="relative mx-4 my-2 text-slate-100">Description</p>
                  <custom-select
                      class="mx-4 my-2"
                      :defaultvalue="new_connection ? default_empty_option : localconnection.description"
                      :optionsvalue="load_options('description')"
                      @selected="(selected)=>updateForm(selected, 'description')"
                  ></custom-select>
              </div>
          </div>
          <div class="col-span-1 h-full bg-[#545454]/40 rounded-md">
              <span
                  v-if="loading_properties"
                  class="animate-spin mx-4 my-2 text-slate-100 material-symbols-outlined"
              >
                  progress_activity
              </span>
              <div v-if="!loading_properties">
                  <p class="relative mx-4 my-2 text-slate-100">Mark as done</p>
                  <custom-select
                      class="mx-4 my-2"
                      :defaultvalue="new_connection ? default_empty_option : localconnection.doneMethod"
                      :optionsvalue="load_options('done')"
                      @selected="(selected)=>updateForm(selected, 'done')"
                  ></custom-select>
                  <custom-select
                      v-if="!loading_method_option"
                      class="mx-4 my-2"
                      :defaultvalue="new_connection ? default_empty_option : localconnection.doneMethodOption"
                      :optionsvalue="load_method_options()"
                      @selected="(selected)=>updateForm(selected, 'doneOption')"
                  ></custom-select>
              </div>
          </div>
      </div>
      <div
          v-if="modified_connection.calendarId != ''"
          class="absolute left-1/2 bottom-4 transform -translate-x-1/2"
      >
          <p class="text-slate-100 my-2">Calendar ID</p>
          <copy-block :text="modified_connection.calendarId"></copy-block>
      </div>
      <button
          @click="close_config_tab()"
          class="absolute text-slate-300 text-sm top-1 right-1 transition-all duration-100 hover:text-slate-100 active:text-slate-300"
      >
          <span class="material-symbols-outlined"> close </span>
      </button>
      <div
        class="flex absolute bottom-4 right-4"
      >
          <button
            v-if="!new_connection"
            @click="deleteConnection"
            class="relative box-border w-24 h-8 text-sm text-slate-100 bg-[#f54b38]/75 px-4 mr-2 outline outline-1 outline-[#f54b38] rounded-md transition-all duration-300 hover:bg-[#f54b38]/50 active:bg-[#f54b38]/25"
          >{{deleting ? "Deleting" : "Delete"}}</button>
          <button
            @click="new_connection ? createConnection() : updateConnection()"
            class="relative box-border w-24 h-8 text-sm text-slate-100 bg-[#52b038]/75 px-4 ml-2 outline outline-1 outline-[#52b038] rounded-md ransition-all duration-300 hover:bg-[#52b038]/50 active:bg-[#52b038]/25"
          >{{new_connection ? "Create" : "Save"}}</button>
      </div>
  </div>
`,
  props: ["localconnection", "localnotiondata", "new_con"],
  data() {
    return {
      close_tab: false,
      new_connection: this.new_con,
      loading_properties: false,
      deleting: false,
      notiondata: JSON.parse(JSON.stringify(this.localnotiondata, null, 2)),
      modified_connection: JSON.parse(JSON.stringify(this.localconnection, null, 2)),
      default_empty_option: {
        name: "Choose an option",
        value: "",
      },
      current_database: "",
    };
  },
  computed: {
    database_options_list() {
      let databaseOptionsList = this.notiondata.map((result) => {
        return {
          name: result.databaseName,
          value: result.databaseId,
        };
      });
      return databaseOptionsList;
    },
    loading_method_option() {
      if (this.modified_connection.doneMethod != "") {
        return false;
      } else return true;
    },
  },
  methods: {
    deleteConnection() {
      fetch("http://localhost:6060/api/connections", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarId: this.modified_connection.calendarId,
        }),
      }).then((res) => {
        if (res.status == 200) {
          console.log("Deleted successfully");
          window.location.reload();
        } else {
          this.deleting = false;
          console.log("Error");
        }
      });
      this.deleting = true;
    },
    updateConnection() {
      let valid = true;
      if (this.new_connection) valid = false;
      let connection = JSON.parse(JSON.stringify(this.modified_connection, null, 2));
      Object.values(connection)
        .slice(2)
        .forEach((property) => {
          if (property == "") valid = false;
        });
      if (valid) {
        fetch("http://localhost:6060/api/reformat/connections", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(connection),
        }).then((res) => {
          if (res.status == 200) {
            console.log("Updated successfully");
            window.location.reload();
          } else console.log("Error");
        });
      }
    },
    createConnection() {
      let valid = true;
      if (!this.new_connection) valid = false;
      let connection = JSON.parse(JSON.stringify(this.modified_connection, null, 2));
      Object.values(connection)
        .slice(2)
        .forEach((property) => {
          if (property == "") valid = false;
        });
      if (valid) {
        fetch("http://localhost:6060/api/reformat/connections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(connection),
        }).then((res) => {
          if (res.status == 200) {
            console.log("Connection added successfully");
            window.location.reload();
          } else console.log("Error");
        });
      }
    },
    close_config_tab() {
      this.$emit("tab", false);
      this.close_tab = true;
    },
    updateForm(selected, type) {
      const updatedConnection = JSON.parse(JSON.stringify(this.modified_connection));
      if (type == "database") {
        updatedConnection.database = selected;
      } else if (type == "date") {
        updatedConnection.date = selected;
      } else if (type == "name") {
        updatedConnection.name = selected;
      } else if (type == "description") {
        updatedConnection.description = selected;
      } else if (type == "done") {
        updatedConnection.doneMethod = selected;
      } else if (type == "doneOption") {
        updatedConnection.doneMethodOption = selected;
      }

      this.modified_connection = updatedConnection;
    },

    load_options(type) {
      let typeList;
      if (type == "date") typeList = ["date"];
      else if (type == "name") typeList = ["title", "formula", "text", "rich_text"];
      else if (type == "description")
        typeList = [
          "email",
          "file",
          "formula",
          "created_by",
          "updated_by",
          "select",
          "multi_select",
          "people",
          "phone_number",
          "rich_text",
          "status",
          "url",
          "title",
        ];
      else if (type == "done") typeList = ["select", "status"];
      let database = this.notiondata.find((result) => result.databaseId == this.modified_connection.database.value);
      let options = [];
      if (typeof database != "undefined") {
        if (this.current_database == "") this.current_database = JSON.parse(JSON.stringify(database, null, 2));
        let properties = (options = Object.values(database.properties).filter((property) =>
          typeList.includes(property.type)
        ));

        options = properties.map((property) => {
          return {
            name: property.name,
            value: property.id,
          };
        });
      } else return [];
      return options;
    },
    load_method_options() {
      let database = JSON.parse(JSON.stringify(this.current_database));
      let doneMethodId = this.modified_connection.doneMethod.value;
      let options = [];
      if (database != "") {
        let doneMethod = Object.values(database.properties).find((property) => property.id == doneMethodId);
        if (typeof doneMethod != "undefined") {
          options = doneMethod.select.options.map((option) => {
            return {
              name: option.name,
              value: option.id,
            };
          });
        } else return [];
      } else return [];
      return options;
    },
  },
  watch: {
    modified_connection: {
      handler(newData, oldData) {
        let newDbId = newData.database.value;
        let oldDbId = oldData.database.value;
        if (newDbId != oldDbId) {
          this.loading_properties = true;
          fetch("http://localhost:6060/dashboard/fetchData", {
            method: "GET",
          })
            .then((res) => res.json())
            .then((data) => {
              this.notion_data = JSON.parse(JSON.stringify(data));
              if (newDbId == this.localconnection.database.value) {
                this.new_connection = false;
                this.modified_connection = JSON.parse(JSON.stringify(this.localconnection, null, 2));
                this.loading_properties = false;
              } else {
                this.new_connection = true;
                let updated_connection = {
                  ...this.modified_connection,
                };
                Object.keys(updated_connection).forEach((key) => {
                  if (key != "database") {
                    updated_connection[key] = "";
                  }
                });
                this.modified_connection = updated_connection;
                this.loading_properties = false;
              }
            })
            .catch((err) => {
              console.error(err);
            });
        }
      },
      deep: true,
    },
  },
  mounted() {
    setInterval(() => {
      console.log(JSON.parse(JSON.stringify(this.modified_connection, null, 2)));
    }, 5000);
  },
});
app.component("custom-select", {
  template: `
  <div ref="dropdown" class="flex flex-col w-64 bg-[#242424] overflow-hidden rounded-md outline outline-1 outline-[#585858] cursor-pointer">
    <div
      :class="{ 'brightness-125 z-30': visibility }"
      class="relative select-none h-6 w-64 bg-[#242424] flex items-center px-2 py-4 text-xs transition-all duration-300 hover:bg-[#202020]"
      @click="changeVisibility"
    >
      <p class="absolute text-slate-100">{{ localSelected.name }}</p>
      <span
        :class="{ 'rotate-180': visibility }"
        class="absolute right-0 text-slate-100 transition-all duration-200 material-symbols-outlined"
      >
        arrow_drop_down
      </span>
    </div>
    <div
    :class="[
          { 'translate-y-9 opacity-100': localOptions.length > 0 && visibility },
          { 'rounded-md outline outline-1 outline-[#585858] z-20 brightness-125': visibility },
          'transition-all ease-in-out duration-300'
        ]"
      class="absolute translate-y-5 flex flex-col max-h-48 w-64 opacity-0 overflow-y-auto"
    >
      <div
        class="relative select-none h-6 w-64 text-slate-100 bg-[#242424] flex items-center px-2 py-4 text-xs transition-all duration-300 hover:bg-[#202020]"
        v-for="(option, index) in localOptions"
        :key="index"
        v-if="visibility"
        @click="
          changeVisibility();
          localSelected = option;
        "
      >
        {{ option.name }}
      </div>
    </div>
  </div>

  `,
  props: ["optionsvalue", "defaultvalue"],
  data() {
    return {
      localSelected: this.$props.defaultvalue,
      visibility: false,
      localOptions: this.$props.optionsvalue,
    };
  },
  methods: {
    changeVisibility() {
      this.visibility = !this.visibility;
    },
    handleClickOutside(event) {
      if (!this.$refs.dropdown.contains(event.target)) {
        this.visibility = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
});
app.component("copy-block", {
  template: `
<div
  class="bg-[#242424] text-slate-100 px-2 py-4 h-6 w-80 rounded-md outline outline-1 outline-[#585858] flex"
>
  <span v-if="!success" @click="copy_text()"
      class="absolute bg-[#242424] text-[#585858] right-0 p-1 scale-75 self-center rounded-md select-none cursor-pointer transition-all duration-300 hover:brightness-150 material-symbols-outlined"
  >
      content_paste
  </span>
  <span v-if="success" class="absolute bg-[#242424] text-[#585858] right-0 p-1 scale-75 self-center rounded-md select-none cursor-pointer transition-all duration-300 hover:brightness-150 material-symbols-outlined">
  check
  </span>
  <p class="overflow-hidden text-xs self-center select-text">{{ text }}</p>
</div>
`,
  props: ["text"],
  data() {
    return {
      success: false,
    };
  },
  methods: {
    copy_text() {
      navigator.clipboard
        .writeText(this.text)
        .then(() => {
          this.success = true;
          setTimeout(() => {
            this.success = false;
          }, 3000);
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
});
app.mount("#app");
