<template>
  <div class="flex flex-col size-4/5 bg-[#313131] rounded-md shadow-md overflow-y-auto">
    <span
      @click="emit('open_tab', false)"
      class="material-symbols-outlined absolute top-2 right-2 text-slate-100 text-xl hover:text-slate-200 active:text-slate-300 transition-all duration-200 select-none cursor-pointer">
      close
    </span>
    <div class="grid grid-cols-3 gap-4 m-4 mt-10">
      <div class="flex flex-col col-span-1 pb-8 bg-[#252525] rounded-lg">
        <p class="text-slate-100 text-md mx-4 my-2">Database</p>
        <CustomSelect
          v-if="new_connection"
          :default_option="default_database_option"
          :options="get_options.database(notion_data)"
          @selected="(selected) => update.database(selected)"
          class="mx-4 my-2"></CustomSelect>
        <div
          v-if="!new_connection"
          class="flex flex-col box-border justify-center h-8 w-64 pl-2 mx-4 my-2 rounded-md bg-[#252525] outline outline-1 outline-[#585858] text-xs text-slate-100 overflow-hidden overscroll-none select-none">
          {{ connection_data.database.name }}
        </div>
        <WarningEmptyField :class="{ 'opacity-100': database_warning }"></WarningEmptyField>
        <p class="text-slate-100 text-md mx-4 my-2">Calendar name</p>
        <CustomInput
          :placeholder="modified_connection.database.name"
          class="w-64 mx-4 my-2"
          v-model="modified_connection.calendarName"></CustomInput>
      </div>
      <div class="flex flex-col col-span-1 pb-8 bg-[#252525] rounded-lg">
        <p class="text-slate-100 text-md mx-4 my-2">Date</p>
        <div
          v-if="loading_notion_data"
          class="animate-pulse mx-4 my-2 h-8 w-64 bg-[#343434] rounded-md"></div>
        <CustomSelect
          v-if="!loading_notion_data"
          :default_option="default_date_option"
          :options="get_options.date(notion_data, modified_connection)"
          class="mx-4 my-2"
          @selected="(selected) => update.date(selected)"></CustomSelect>
        <WarningEmptyField :class="{ 'opacity-100': date_warning }"></WarningEmptyField>
        <p class="text-slate-100 text-md mx-4 my-2">Name</p>
        <div
          v-if="loading_notion_data"
          class="animate-pulse mx-4 my-2 h-8 w-64 bg-[#343434] rounded-md"></div>
        <CustomSelect
          v-if="!loading_notion_data"
          :default_option="default_name_option"
          :options="get_options.name(notion_data, modified_connection)"
          @selected="(selected) => update.name(selected)"
          class="mx-4 my-2"></CustomSelect>
        <WarningEmptyField :class="{ 'opacity-100': name_warning }"></WarningEmptyField>
        <p class="text-slate-100 text-md mx-4 my-2">Description</p>
        <div
          v-if="loading_notion_data"
          class="animate-pulse mx-4 my-2 h-8 w-64 bg-[#343434] rounded-md"></div>
        <CustomSelect
          v-if="!loading_notion_data"
          :default_option="default_description_option"
          :options="get_options.description(notion_data, modified_connection)"
          @selected="(selected) => update.description(selected)"
          class="mx-4 my-2"></CustomSelect>
        <WarningEmptyField :class="{ 'opacity-100': description_warning }"></WarningEmptyField>
      </div>
      <div class="flex flex-col col-span-1 pb-8 bg-[#252525] rounded-lg">
        <p class="text-slate-100 text-md mx-4 my-2">Mark as done</p>
        <div
          v-if="loading_notion_data"
          class="animate-pulse mx-4 my-2 h-8 w-64 bg-[#343434] rounded-md"></div>
        <CustomSelect
          v-if="!loading_notion_data"
          :default_option="default_done_method_option"
          :options="get_options.doneMethod(notion_data, modified_connection)"
          @selected="(selected) => update.doneMethod(selected)"
          class="mx-4 my-2"></CustomSelect>
        <div
          v-if="loading_notion_data"
          class="animate-pulse mx-4 my-2 h-8 w-64 bg-[#343434] rounded-md"></div>
        <CustomSelect
          v-if="modified_connection.doneMethod.value != '' && !loading_notion_data"
          :default_option="default_done_method_option_option"
          :options="get_options.doneMethodOption(notion_data, modified_connection)"
          @selected="(selected) => update.doneMethodOption(selected)"
          class="mx-4 my-2"></CustomSelect>
        <WarningEmptyField
          :class="{
            'opacity-100': done_method_option_warning,
          }"></WarningEmptyField>
      </div>
    </div>
    <div class="flex justify-center m-4">
      <CopyBlock v-if="calendarId != ''" :text_to_copy="calendarId" class="relative"></CopyBlock>
    </div>
    <div class="sticky buttom-0 flex grow w-full">
      <div class="flex flex-row absolute bottom-4 right-4">
        <CustomButton
          v-if="!new_connection"
          @click="deleteConnection()"
          :color="'red'"
          :name="'Delete'"
          class="relative h-8 w-24 mr-2"></CustomButton>
        <CustomButton
          v-if="new_connection"
          @click="createConnection()"
          :color="'green'"
          :name="'Create'"
          class="relative h-8 w-24"></CustomButton>
        <CustomButton
          v-if="!new_connection"
          @click="updateConnection()"
          :color="'green'"
          :name="'Save'"
          class="relative h-8 w-24"></CustomButton>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, toRefs, onMounted, watch, computed } from "vue";
import CustomInput from "./CustomInput.vue";
import CustomSelect from "./CustomSelect.vue";
import CustomButton from "./CustomButton.vue";
import CopyBlock from "./CopyBlock.vue";
import WarningEmptyField from "./WarningEmptyField.vue";
import get_options from "../utils/get_options.js";
import updateForm from "../utils/updateForm.js";
import axios from "axios";

const emit = defineEmits(["open_tab"]);
const { connection_data } = defineProps({
  connection_data: {
    type: Object,
    default: {},
  },
});

const modified_connection = ref(JSON.parse(JSON.stringify(connection_data)));
const calendarId = ref(modified_connection.value.calendarId);
const new_connection = ref(connection_data.calendarId == "");
const notion_data = ref([]);
const loading_notion_data = ref(false);
const form_checking = ref(false);
// Get the default options based on existing connection data and check if the data is available or not
const default_database_option = ref(JSON.parse(JSON.stringify(modified_connection.value.database)));
const default_date_option = ref(JSON.parse(JSON.stringify(modified_connection.value.date)));
const default_name_option = ref(JSON.parse(JSON.stringify(modified_connection.value.name)));
const default_description_option = ref(
  JSON.parse(JSON.stringify(modified_connection.value.description))
);
const default_done_method_option = ref(
  JSON.parse(JSON.stringify(modified_connection.value.doneMethod))
);
const default_done_method_option_option = ref(
  JSON.parse(JSON.stringify(modified_connection.value.doneMethodOption))
);
const database_warning = ref(false);
const date_warning = ref(false);
const name_warning = ref(false);
const description_warning = ref(false);
const done_method_option_warning = computed(() => {
  if (form_checking.value == false) return false;
  if (modified_connection.value.doneMethod.value == "") return false;
  if (modified_connection.value.doneMethodOption.value == "") return true;
  else return false;
});

const get_notion_data = async () => {
  loading_notion_data.value = true;
  try {
    const res = await axios.get("http://localhost:6060/dashboard/fetchData");
    notion_data.value = JSON.parse(JSON.stringify(res)).data;
    loading_notion_data.value = false;
  } catch (err) {
    console.error(err);
    loading_notion_data.value = false;
  }
};
const update = {
  async database(selected) {
    try {
      await get_notion_data();
      modified_connection.value = updateForm.database(
        modified_connection.value,
        connection_data,
        selected
      );
      default_date_option.value = modified_connection.value.date;
      default_name_option.value = modified_connection.value.name;
      default_description_option.value = modified_connection.value.description;
      default_done_method_option.value = modified_connection.value.doneMethod;
      default_done_method_option_option.value = modified_connection.value.doneMethodOption;
    } catch (err) {
      console.error(err);
    }
  },
  date(selected) {
    modified_connection.value = updateForm.date(modified_connection.value, selected);
  },
  name(selected) {
    modified_connection.value = updateForm.name(modified_connection.value, selected);
  },
  description(selected) {
    modified_connection.value = updateForm.description(modified_connection.value, selected);
  },
  doneMethod(selected) {
    modified_connection.value = updateForm.doneMethod(modified_connection.value, selected);
  },
  doneMethodOption(selected) {
    modified_connection.value = updateForm.doneMethodOption(modified_connection.value, selected);
  },
};
const check_form = () => {
  if (form_checking.value == true) {
    database_warning.value = modified_connection.value.database.value == "";
    date_warning.value = modified_connection.value.date.value == "";
    name_warning.value = modified_connection.value.name.value == "";
    description_warning.value = modified_connection.value.description.value == "";
  }
};
const createConnection = async () => {
  form_checking.value = true;
  check_form();
  if (
    database_warning.value == false &&
    date_warning.value == false &&
    name_warning.value == false &&
    description_warning.value == false &&
    done_method_option_warning.value == false
  ) {
    if (modified_connection.value.calendarName == "")
      modified_connection.value.calendarName = modified_connection.value.database.name;
    axios
      .post("http://localhost:6060/api/connections", modified_connection.value)
      .then((res) => {
        if (res.status == 200) {
          calendarId.value = res.data.calendarId;
          console.log("Created successfully");
        } else console.log("Create failed");
      })
      .catch((err) => {
        console.error(err);
      });
  }
};

const updateConnection = async () => {
  form_checking.value = true;
  check_form();
  if (
    database_warning.value == false &&
    date_warning.value == false &&
    name_warning.value == false &&
    description_warning.value == false &&
    done_method_option_warning.value == false
  ) {
    if (modified_connection.value.calendarName == "")
      modified_connection.value.calendarName = modified_connection.value.database.name;
    axios
      .patch("http://localhost:6060/api/connections", modified_connection.value)
      .then((res) => {
        if (res.status == 200) console.log("Updated successfully");
        else console.log("Update failed");
      })
      .catch((err) => {
        console.error(err);
      });
  }
};

const deleteConnection = async () => {
  axios
    .delete("http://localhost:6060/api/connections", {
      data: {
        calendarId: calendarId.value,
      },
    })
    .then((res) => {
      if (res.status == 200) {
        console.log("Deleted");
      } else console.log("Delete failed");
    });
};

watch(modified_connection, () => check_form());

onMounted(() => {
  get_notion_data();
});
</script>
