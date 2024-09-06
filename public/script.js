let app = Vue.createApp({
  template: `
  <div :key="updateKey">
  <nav class="fixed w-screen h-16 top-0 bg-[#202020] outline outline-1 outline-[#484848]">
  <div
    class="flex flex-row-reverse w-full h-full px-4 bg-[#202020] outline outline-1 outline-[#484848] items-center">
    <span
      @click="this.open_setting = !this.open_setting;"
      class="material-symbols-outlined text-slate-100 transition-all duration-200 hover:brightness-75 active:brightness-50 active:scale-95 select-none cursor-pointer">
      settings
    </span>
  </div>
</nav>
<div class="grid grid-cols-6 gap-2 mt-20 mx-2 mb-2">
  <connection
    v-for="(connection, index) in connectionList"
    :key="index"
    :localconnection="connection"
    :localnotiondata="notiondata"></connection>
</div>
<div
  v-if="open_setting"
  class="flex fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-2/5 bg-[#000000] rounded-md">
  <div class="flex justify-between w-full px-4 py-2 mt-12">
    <p class="text-slate-100">Refresh rate</p>
    <custom-input v-model="refresh_rate" class="" />
  </div>
  <div class="flex absolute bottom-2 right-2 items-center">
    <p class="text-yellow-300 text-xs px-2">{{ warning_message }}</p>
    <button
      @click="update_config()"
      class="box-border w-24 h-8 text-sm text-slate-100 bg-[#52b038]/75 px-4 outline outline-1 outline-[#52b038] rounded-md transition-all duration-300 hover:bg-[#52b038]/50 active:bg-[#52b038]/25">
      Save
    </button>
  </div>
  <span
    @click="this.open_setting = !this.open_setting;"
    class="material-symbols-outlined absolute top-2 right-2 text-slate-100 select-none cursor-pointer hover:brightness-75 active:brightness-50 transition-all duration-200">
    close
  </span>
</div>
<configuration-tab
  v-if="create_con"
  :localconnection="blank_connection"
  :localnotiondata="notiondata"
  :new_con="true"
  @tab="(tab)=> this.create_con=tab"></configuration-tab>
<addbtn @click="create_new_con()"></addbtn>
  </div>
  `,
  data: function () {
    return {
      connectionList: [],
      notiondata: "",
      open_setting: false,
      create_con: false,
      load_connection: false,
      load_notiondata: false,
      refresh_rate: 0,
      warning_message: "",
      updateKey: 0,
    };
  },
  computed: {
    blank_connection() {
      return {
        calendarId: "",
        calendarName: "",
        database: {
          name: "",
          value: "",
        },
        date: {
          name: "",
          value: "",
        },
        name: {
          name: "",
          value: "",
        },
        description: {
          name: "",
          value: "",
        },
        doneMethod: {
          name: "",
          value: "",
        },
        doneMethodOption: {
          name: "",
          value: "",
        },
      };
    },
  },
  methods: {
    create_new_con() {
      if (this.load_connection == true && this.load_notiondata == true)
        this.create_con = !this.create_con;
    },
    update_config() {
      let valid = true;
      if (isNaN(this.refresh_rate)) {
        this.warning_message = "The input must be a number";
        valid = false;
      }
      if (valid) {
        fetch("http://localhost:6060/api/config", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshRate: this.refresh_rate * 1000,
          }),
        })
          .then((res) => {
            if (res.status == 200) this.open_setting = !this.open_setting;
            else throw new Error("Failed update config");
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
    get_connection_data() {
      fetch("http://localhost:6060/api/connections", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          this.connectionList = JSON.parse(JSON.stringify(data));
        })
        .catch((err) => {
          console.error(err);
        });
    },
    get_config_data() {
      fetch("http://localhost:6060/api/config", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          let refreshRate = JSON.parse(JSON.stringify(data)).refreshRate;
          this.refresh_rate = refreshRate / 1000;
        })
        .catch((err) => {
          console.error(err);
        });
    },
    get_notion_data() {
      fetch("http://localhost:6060/dashboard/fetchData", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          this.notiondata = JSON.parse(JSON.stringify(data));
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
  watch: {
    connectionList() {
      (this.load_connection = true), console.log("Connection data uploaded");
    },
    notiondata() {
      (this.load_notiondata = true), console.log("NotionData uploaded");
    },
    refresh_rate(data) {
      console.log(data);
    },
  },
  mounted() {
    console.log("Hello there");
    this.get_connection_data();
    this.get_config_data();
    this.get_notion_data();
    setInterval(() => {
      this.updateKey += 1;
    }, 5000);
  },
});
app.component("addbtn", {
  template: `
  <button
  type="button"
  class="fixed bg-gray-100 size-14 right-0 bottom-0 m-4 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-gray-300 active:bg-gray-350 active:scale-95 shadow-md">
  <span class="text-4xl text-[#202020] material-symbols-outlined"> add </span>
</button>
  `,
});
app.component("connection", {
  template: `
  <div @click="open_tab" class="relative flex bg-[#FF8225] col-span-1 h-32 rounded-md select-none cursor-pointer transition-all duration-200 hover:bg-[#FF8225]/75 active:bg-[#FF8225]/50 active:scale-95">
    <p class="relative text-slate-100 text-lg mx-4 my-2"> {{ localconnection.calendarName }} </p>
    <p class="absolute bottom-3 right-3 text-slate-100 text-xs">{{ localconnection.database.name }}</p>
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
  <div class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-screen bg-[#000000]" style="opacity: 0.2;"></div>
            <div
                class="flex flex-col fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#000000] size-4/5 rounded-lg shadow-md select-none overflow-y-auto"
            >
                <button
                    @click="close_config_tab()"
                    class="flex flex-row-reverse sticky text-slate-300 text-sm top-1 mr-1 transition-all duration-100 hover:text-slate-100 active:text-slate-300"
                >
                    <span class="material-symbols-outlined"> close </span>
                </button>
                <div class="relative grid grid-cols-3 gap-4 mx-4 my-4">
                    <div
                        class="col-span-1 pb-4 pt-2 pl-2 bg-[#545454]/40 rounded-md"
                    >
                        <p class="relative mx-4 my-2 text-slate-100">
                            Database
                        </p>
                        <custom-select
                            class="mx-4 my-2"
                            :defaultvalue="new_connection ? default_empty_option : localconnection.database"
                            :optionsvalue="database_options_list"
                            @selected="(selected)=>updateForm(selected, 'database')"
                        ></custom-select>
                        <p class="relative mx-4 my-2 text-slate-100">
                            Calendar name
                        </p>
                        <custom-input
                            class="relative mx-4 my-2 text-slate-100"
                            v-model="this.modified_connection.calendarName"
                            :default_name="this.new_connection ? this.modified_connection.database.name : ''"
                        />
                    </div>
                    <div
                        class="col-span-1 pb-4 pt-2 pl-2 bg-[#545454]/40 rounded-md"
                    >
                        <span
                            v-if="loading_properties"
                            class="animate-spin mx-4 my-2 text-slate-100 material-symbols-outlined"
                        >
                            progress_activity
                        </span>
                        <div v-if="!loading_properties">
                            <p class="relative mx-4 my-2 text-slate-100">
                                Date
                            </p>
                            <custom-select
                                class="mx-4 my-2"
                                :defaultvalue="new_connection ? default_empty_option : localconnection.date"
                                :optionsvalue="load_options('date')"
                                @selected="(selected)=>updateForm(selected, 'date')"
                            ></custom-select>
                            <p class="relative mx-4 my-2 text-slate-100">
                                Name
                            </p>
                            <custom-select
                                class="mx-4 my-2"
                                :defaultvalue="new_connection ? default_empty_option : localconnection.name"
                                :optionsvalue="load_options('name')"
                                @selected="(selected)=>updateForm(selected, 'name')"
                            ></custom-select>
                            <p class="relative mx-4 my-2 text-slate-100">
                                Description
                            </p>
                            <custom-select
                                class="mx-4 my-2"
                                :defaultvalue="new_connection ? default_empty_option : localconnection.description"
                                :optionsvalue="load_options('description')"
                                @selected="(selected)=>updateForm(selected, 'description')"
                            ></custom-select>
                        </div>
                    </div>
                    <div
                        class="col-span-1 pb-4 pt-2 pl-2 bg-[#545454]/40 rounded-md"
                    >
                        <span
                            v-if="loading_properties"
                            class="animate-spin mx-4 my-2 text-slate-100 material-symbols-outlined"
                        >
                            progress_activity
                        </span>
                        <div v-if="!loading_properties">
                            <p class="relative mx-4 my-2 text-slate-100">
                                Mark as done
                            </p>
                            <custom-select
                                class="mx-4 my-2"
                                :defaultvalue="defaultOptionalOption(localconnection.doneMethod)"
                                :optionsvalue="load_options('done')"
                                @selected="(selected)=>updateForm(selected, 'done')"
                            ></custom-select>
                            <custom-select
                                v-if="!loading_method_option"
                                class="mx-4 my-2"
                                :defaultvalue="defaultOptionalOption(localconnection.doneMethodOption)"
                                :optionsvalue="load_method_options()"
                                @selected="(selected)=>updateForm(selected, 'doneOption')"
                            ></custom-select>
                        </div>
                    </div>
                </div>
                <div
                    v-if="modified_connection.calendarId != ''"
                    class="flex flex-col relative justify-center items-center m-4"
                >
                    <div class="w-80 my-4">
                        <span class="text-slate-100">Calendar ID</span>
                    </div>
                    <copy-block
                        :text="modified_connection.calendarId"
                    ></copy-block>
                </div>
                <div class="sticky bottom-1 flex grow w-full">
                    <div class="absolute bottom-2 right-2">
                        <div class="flex flex-row-reverse h-8 box-border">
                            <button
                                @click="new_connection ? createConnection() : updateConnection()"
                                class="relative box-border w-24 h-8 text-sm text-slate-100 bg-[#52b038]/75 px-4 ml-2 outline outline-1 outline-[#52b038] rounded-md transition-all duration-300 hover:bg-[#52b038]/50 active:bg-[#52b038]/25"
                            >
                                {{new_connection ? "Create" : "Save"}}
                            </button>
                            <button
                                v-if="!new_connection"
                                @click="deleteConnection"
                                class="relative box-border w-24 h-8 text-sm text-slate-100 bg-[#f54b38]/75 px-4 outline outline-1 outline-[#f54b38] rounded-md transition-all duration-300 hover:bg-[#f54b38]/50 active:bg-[#f54b38]/25"
                            >
                                Delete
                            </button>
                            <p class="text-xs text-yellow-300 my-2">
                                {{ warning_message }}
                            </p>
                            <span
                                v-if="deleting || creating_or_adding"
                                class="flex items-center justify-center animate-spin mx-2 text-md text-gray-300 material-symbols-outlined p-2"
                            >
                                progress_activity
                            </span>
                        </div>
                    </div>
                </div>
            </div>
`,
  emits: ["tab"],
  props: ["localconnection", "localnotiondata", "new_con"],
  data() {
    return {
      new_connection: this.new_con,
      loading_properties: false,
      deleting: false,
      creating_or_adding: false,
      notiondata: JSON.parse(JSON.stringify(this.localnotiondata, null, 2)),
      modified_connection: JSON.parse(
        JSON.stringify(this.localconnection, null, 2),
      ),
      default_empty_option: {
        name: "Choose an option",
        value: "",
      },
      warning_message: "",
      current_database: "",
      intervalId: null,
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
      databaseOptionsList.unshift({ ...this.default_empty_option });
      return databaseOptionsList;
    },
    loading_method_option() {
      if (
        this.modified_connection.doneMethod != "" &&
        this.modified_connection.doneMethod.value != ""
      ) {
        return false;
      } else {
        this.modified_connection.doneMethod = { name: "", value: "" };
        this.modified_connection.doneMethodOption = { name: "", value: "" };
        return true;
      }
    },
  },
  methods: {
    deleteConnection() {
      this.deleting = true;
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
    },
    updateConnection() {
      let valid = true;
      this.creating_or_adding = true;
      if (this.new_connection) valid = false;
      let connection = JSON.parse(
        JSON.stringify(this.modified_connection, null, 2),
      );
      Object.keys(connection).forEach((key) => {
        if (
          key != "calendarId" &&
          key != "doneMethod" &&
          key != "doneMethodOption"
        ) {
          if (
            connection[key] == "" ||
            connection[key].name == "" ||
            connection[key].value == ""
          )
            valid = false;
        }
      });
      if (valid) {
        fetch("http://localhost:6060/api/connections", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(connection),
        }).then((res) => {
          if (res.status == 200) {
            console.log("Updated successfully");
            window.location.reload();
          } else {
            console.log("Error");
            this.creating_or_adding = false;
          }
        });
      } else {
        this.creating_or_adding = false;
        this.warning_message = "You have missing fields";
        setTimeout(() => {
          this.warning_message = "";
        }, 5000);
      }
    },
    createConnection() {
      let valid = true;
      this.creating_or_adding = true;
      if (!this.new_connection) valid = false;
      let connection = JSON.parse(
        JSON.stringify(this.modified_connection, null, 2),
      );
      if (
        connection.calendarName == "" &&
        connection.database.name != "" &&
        connection.database.value != ""
      ) {
        connection.calendarName = connection.database.name;
      }
      Object.keys(connection).forEach((key) => {
        if (
          key != "calendarId" &&
          key != "doneMethod" &&
          key != "doneMethodOption"
        ) {
          if (
            connection[key] == "" ||
            connection[key].name == "" ||
            connection[key].value == ""
          )
            valid = false;
        }
      });
      if (valid) {
        fetch("http://localhost:6060/api/connections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(connection),
        }).then((res) => {
          if (res.status == 200) {
            console.log("Connection added successfully");
            res
              .json()
              .then((data) => {
                this.modified_connection = data;
                this.creating_or_adding = false;
              })
              .catch((err) => {
                console.error(err);
              });
          } else {
            console.log("Error");
            thid.creating_or_adding = false;
          }
        });
      } else {
        this.creating_or_adding = false;
        this.warning_message = "You have missing fields";
        setTimeout(() => {
          this.warning_message = "";
        }, 5000);
      }
    },

    defaultOptionalOption(option) {
      if (
        option.name != "" &&
        option.value != "" &&
        this.new_connection == false
      ) {
        return option;
      } else return { ...this.default_empty_option };
    },
    close_config_tab() {
      //window.location.reload();
      this.$emit("tab", false);
    },
    updateForm(selected, type) {
      const updatedConnection = JSON.parse(
        JSON.stringify(this.modified_connection),
      );
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
      else if (type == "name")
        typeList = ["title", "formula", "text", "rich_text"];
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
      let database = this.notiondata.find(
        (result) =>
          result.databaseId == this.modified_connection.database.value,
      );
      let options = [];
      if (typeof database != "undefined") {
        if (this.current_database == "")
          this.current_database = JSON.parse(JSON.stringify(database, null, 2));
        let properties = (options = Object.values(database.properties).filter(
          (property) => typeList.includes(property.type),
        ));

        options = properties.map((property) => {
          return {
            name: property.name,
            value: property.id,
          };
        });
        options.unshift({ ...this.default_empty_option });
      } else return [];
      return options;
    },
    load_method_options() {
      let database = JSON.parse(JSON.stringify(this.current_database));
      let doneMethodId = this.modified_connection.doneMethod.value;
      let options = [];
      if (database != "") {
        let doneMethod = Object.values(database.properties).find(
          (property) => property.id == doneMethodId,
        );
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
          this.modified_connection.calendarName = "";
          fetch("http://localhost:6060/dashboard/fetchData", {
            method: "GET",
          })
            .then((res) => res.json())
            .then((data) => {
              this.notion_data = JSON.parse(JSON.stringify(data));
              if (newDbId == this.localconnection.database.value) {
                this.new_connection = false;
                this.modified_connection = JSON.parse(
                  JSON.stringify(this.localconnection, null, 2),
                );
                this.loading_properties = false;
              } else {
                this.new_connection = true;
                this.modified_connection.calendarName = "";
                let updated_connection = JSON.parse(
                  JSON.stringify(this.modified_connection),
                );
                Object.keys(updated_connection).forEach((key) => {
                  if (key != "database" && key != "calendarId") {
                    updated_connection[key] = {
                      name: "",
                      value: "",
                    };
                  }
                });
                updated_connection.calendarName = "";
                updated_connection.calendarId = "";
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
    this.intervalId = setInterval(() => {
      console.log(
        JSON.parse(JSON.stringify(this.modified_connection, null, 2)),
      );
    }, 5000);
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
  },
});
app.component("custom-input", {
  template: `
<input
    v-model="inputValue"
    class="relative flex items-center select-none h-6 w-64 text-slate-100 bg-[#585858]/40 px-2 py-4 text-xs rounded-md outline outline-1 outline-[#585858]"
    type="text"
    :placeholder="default_name"
/>
`,
  props: ["default_name", "modelValue"],
  data() {
    return {};
  },
  computed: {
    inputValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
});
app.component("custom-select", {
  template: `
  <div ref="dropdown" class="flex flex-col w-64 bg-[#242424] overflow-hidden rounded-md outline outline-1 outline-[#585858] cursor-pointer">
    <div :class="{ 'brightness-125' : visibility}"
      class="relative select-none h-6 w-64 bg-[#242424] flex items-center px-2 py-4 text-xs transition-all duration-300 hover:bg-[#202020]"
      @click="changeVisibility()">
          <p class="absolute text-slate-100">{{ localselected.name }}</p>
          <span :class="{ 'rotate-180': visibility }" class="absolute right-0 text-slate-100 transition-all duration-200 material-symbols-outlined"> arrow_drop_down </span>
    </div>
    <div v-if="localoptions.length > 0" :class="{ 'rounded-md outline outline-1 outline-[#585858] z-20 brightness-125': visibility }" class="absolute translate-y-9 flex flex-col max-h-64 w-64 overflow-y-auto overflow-x-hidden">
      <div
        class="relative select-none h-6 w-64 text-slate-100 bg-[#242424] flex items-center px-2 py-4 text-xs transition-all duration-300 hover:bg-[#202020]"
        v-for="(option, index) in localoptions"
        v-if="visibility"
        @click="
          changeVisibility();
          localselected = option;
          ">
        {{ option.name }}
      </div>
    </div>
  </div>
  `,
  props: ["optionsvalue", "defaultvalue"],
  data() {
    return {
      localselected: this.$props.defaultvalue,
      visibility: false,
    };
  },
  computed: {
    localoptions() {
      return this.optionsvalue;
    },
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
  watch: {
    localselected(newData, oldData) {
      if (newData != oldData) {
        this.$emit("selected", this.localselected);
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
  class="bg-[#242424] text-slate-100 px-2 py-4 h-6 w-80 rounded-md outline outline-1 outline-[#585858] flex relative"
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
