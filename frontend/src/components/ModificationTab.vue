<template>
  <div
    class="z-30 fixed size-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#000000] opacity-20"></div>
  <div
    class="flex flex-col z-40 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full xl:w-2/3 xl:h-4/5 bg-[#252525] outline outline-1 outline-[#484848] rounded-md shadow-md overflow-y-auto">
    <XMarkIcon
      @click="emit('close', true)"
      class="absolute top-4 right-4 size-6 text-[#484848] select-none cursor-pointer transition-all duration-100 hover:text-[#606060] active:text-[#252525] active:duration-0"></XMarkIcon>
    <div class="flex flex-col">
      <div class="flex items-center w-auto m-2">
        <CustomInput
          v-model="form.calendarName"
          :placeholder="form.database.name"
          :canBeInvisible="true"
          :canBeFlexible="true"
          :wordLimit="40"
          :textClass="'text-lg'"
          class="mr-4"></CustomInput>
        <CopyBlock :text_to_copy="form.calendarId" class="mx-4"></CopyBlock>
      </div>
      <p class="select-none mx-4 text-xs text-slate-100 opacity-60">
        {{ form.database.name }}
      </p>
    </div>
    <div
      :class="{ 'opacity-100': !loading && form.database.value != '' }"
      class="w-auto m-4 grid grid-cols-3 gap-4 opacity-0 transition-all duration-500">
      <div class="flex flex-col col-span-1">
        <p class="select-none my-4 text-sm text-slate-100 font-medium">Date</p>
        <CustomSelect
          v-model="form.date"
          :options="getOptions.date(notionData, form)"
          class="mb-4 mr-4"></CustomSelect>
        <p class="select-none my-4 text-sm text-slate-100 font-medium">Name</p>
        <CustomSelect
          v-model="form.name"
          :options="getOptions.name(notionData, form)"
          class="mb-4 mr-4"></CustomSelect>
        <p class="select-none my-4 text-sm text-slate-100 font-medium">Description</p>
        <CustomSelect
          v-model="form.description"
          :options="getOptions.description(notionData, form)"
          class="mb-4 mr-4"></CustomSelect>
      </div>
      <div class="flex flex-col col-span-1">
        <p class="select-none my-4 text-sm text-slate-100 font-medium">Mark as done</p>
        <CustomSelect
          v-model="form.doneMethod"
          :options="getOptions.doneMethod(notionData, form)"
          class="mb-4 mr-4"></CustomSelect>
        <p
          :class="{ 'opacity-100': doneMethodOptionCondition() }"
          class="my-4 text-sm text-slate-100 font-medium opacity-0 transition-all duration-500">
          Done option
        </p>
        <CustomSelect
          :class="{ 'opacity-100': doneMethodOptionCondition() }"
          v-model="form.doneMethodOption"
          :options="getOptions.doneMethodOption(notionData, form)"
          class="mb-4 mr-4 opacity-0 transition-all duration-500"></CustomSelect>
      </div>
    </div>
    <div class="sticky buttom-0 flex grow w-full">
      <div class="flex flex-row absolute bottom-4 right-4 items-center">
        <div
          v-if="!successfulPatchRequest"
          :class="{ 'animate-ping opacity-100': sending }"
          class="mx-4 size-3 rounded-full bg-green-500 opacity-0"></div>
        <CustomButton
          @click="deleteConnection()"
          :name="'Delete'"
          :color="'red'"
          class="mr-4"></CustomButton>
        <CustomButton @click="updateconnection()" :name="'Save'" :color="'green'"></CustomButton>
      </div>
    </div>
  </div>
  <PopUp
    v-if="openPopUp"
    :color="popUpStatus"
    :message="message"
    @close="(close) => (openPopUp = !close)"
    class="fixed z-50 top-4 right-4"></PopUp>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/solid";
import axios from "axios";
import getOptions from "../utils/getOptions.js";
import CustomButton from "./CustomButton.vue";
import CustomSelect from "./CustomSelect.vue";
import CustomInput from "./CustomInput.vue";
import PopUp from "./PopUp.vue";
import CopyBlock from "./CopyBlock.vue";

const emit = defineEmits(["close"]);
const { form } = defineProps({
  form: {
    type: Object,
    requrired: true,
  },
});

const loading = ref(true);
const sending = ref(false);
const successfulPatchRequest = ref(false);
const notionData = ref([]);
const doneMethodProperty = computed(() => {
  const database = notionData.value.find((result) => result.databaseId == form.database.value);
  if (typeof database == "undefined") return [];
  const doneMethodId = form.doneMethod.value;
  const doneMethodProperty = Object.values(database.properties).find(
    (property) => property.id == doneMethodId
  );
  return doneMethodProperty;
});
const openPopUp = ref(false);
const message = ref("");
const popUpStatus = ref("");

const get_notion_data = async () => {
  loading.value = true;
  try {
    const res = await axios.get("http://localhost:6060/v1/api/data");
    notionData.value = JSON.parse(JSON.stringify(res)).data;
    loading.value = false;
  } catch (err) {
    console.error(err);
    loading.value = false;
  }
};

const doneMethodOptionCondition = () => {
  if (doneMethodProperty.value === undefined) return false;
  if (doneMethodProperty.value.type == "checkbox") return false;
  return true;
};

const updateconnection = async () => {
  try {
    if (!sending.value) {
      sending.value = true;
      // Check if the form is valid
      const formToCheck = [
        form.calendarName,
        form.date.value,
        form.name.value,
        form.description.value,
        form.doneMethod.value,
        form.doneMethodOption.value,
      ];
      if (!formToCheck.toSpliced(3, 3).every((parameter) => parameter != ""))
        throw new Error("Missing fields");
      if (formToCheck[4] != "" && formToCheck[5] == "") {
        if (doneMethodProperty.value === undefined) throw new Error("Can't find done method");
        if (doneMethodProperty.value.type != "checkbox") throw new Error("Missing fields");
      }
      // Modify the form before sending
      let formToSend = JSON.parse(JSON.stringify(form));
      if (formToSend.calendarName == "") formToSend.calendarName = formToSend.database.name;
      const columnsToFormat = ["description", "doneMethod", "doneMethodOption"];
      columnsToFormat.forEach((columnToFormat) => {
        if (formToSend[columnToFormat].name == "Choose an option")
          formToSend[columnToFormat].name == "";
      });
      if (formToSend.calendarName == "") formToSend.calendarName = formToSend.database.name;
      const res = await axios.patch("http://localhost:6060/v1/api/connections", formToSend);
      console.log(res.data.message);
      successfulPatchRequest.value = true;
      message.value = res.data.message;
      popUpStatus.value = "green";
      openPopUp.value = true;
    }
  } catch (err) {
    console.error(err);
    message.value = err.message;
    openPopUp.value = true;
    popUpStatus.value = "red";
    sending.value = false;
  }
};

const deleteConnection = async () => {
  try {
    if (!sending.value) {
      sending.value = true;
      let res = await fetch("http://localhost:6060/v1/api/connections", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarId: form.calendarId,
        }),
      });
      res = await res.json();

      console.log(res.message);
      successfulPatchRequest.value = true;
      message.value = res.message;
      popUpStatus.value = "green";
      openPopUp.value = true;
    }
  } catch (err) {
    console.error(err);
    message.value = err.message;
    openPopUp.value = true;
    popUpStatus.value = "red";
    sending.value = false;
  }
};

onMounted(async () => {
  try {
    await get_notion_data();
  } catch (err) {
    console.error(err);
  }
});
</script>
