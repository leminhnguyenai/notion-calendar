<template>
    <div
        class="z-30 fixed size-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#000000] opacity-20"
    ></div>
    <div
        class="flex flex-col z-40 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full xl:w-2/3 xl:h-4/5 bg-[#252525] outline outline-1 outline-[#484848] rounded-md shadow-md overflow-y-auto"
    >
        <XMarkIcon
            @click="emit('close', true)"
            class="absolute top-4 right-4 size-6 text-[#484848] select-none cursor-pointer transition-all duration-100 hover:text-[#606060] active:text-[#252525] active:duration-0"
        ></XMarkIcon>
        <p class="mt-4 mx-4 text-md text-slate-100 font-semibold">Database</p>
        <CustomSelect
            v-model="form.database"
            class="relative mt-4 mx-4"
            :size="'full'"
            :options="getOptions.database(notionData)"
        ></CustomSelect>
        <div
            :class="{ 'opacity-100': !loading && form.database.value != '' }"
            class="w-auto m-4 grid grid-cols-3 gap-4 opacity-0 transition-all duration-500"
        >
            <div class="flex flex-col col-span-1">
                <p class="my-4 text-sm text-slate-100 font-medium">
                    Calendar name
                </p>
                <CustomInput
                    v-model="form.calendarName"
                    :placeholder="form.database.name"
                    class="mb-4 mr-4 h-8 w-auto"
                ></CustomInput>
            </div>
            <div class="flex flex-col col-span-1">
                <p class="my-4 text-sm text-slate-100 font-medium">Date</p>
                <CustomSelect
                    v-model="form.date"
                    :options="getOptions.date(notionData, form)"
                    class="mb-4 mr-4"
                ></CustomSelect>
                <p class="my-4 text-sm text-slate-100 font-medium">Name</p>
                <CustomSelect
                    v-model="form.name"
                    :options="getOptions.name(notionData, form)"
                    class="mb-4 mr-4"
                ></CustomSelect>
                <p class="my-4 text-sm text-slate-100 font-medium">
                    Description
                </p>
                <CustomSelect
                    v-model="form.description"
                    :options="getOptions.description(notionData, form)"
                    class="mb-4 mr-4"
                ></CustomSelect>
            </div>
            <div class="flex flex-col col-span-1">
                <p class="my-4 text-sm text-slate-100 font-medium">
                    Mark as done
                </p>
                <CustomSelect
                    v-model="form.doneMethod"
                    :options="getOptions.doneMethod(notionData, form)"
                    class="mb-4 mr-4"
                ></CustomSelect>
                <p
                    :class="{ 'opacity-100': form.doneMethod.value != '' }"
                    class="my-4 text-sm text-slate-100 font-medium opacity-0 transition-all duration-500"
                >
                    Done option
                </p>
                <CustomSelect
                    :class="{ 'opacity-100': form.doneMethod.value != '' }"
                    v-model="form.doneMethodOption"
                    :options="getOptions.doneMethodOption(notionData, form)"
                    class="mb-4 mr-4 opacity-0 transition-all duration-500"
                ></CustomSelect>
            </div>
        </div>
        <div class="sticky buttom-0 flex grow w-full">
            <div class="flex flex-row absolute bottom-4 right-4 items-center">
                <CopyBlock
                    v-if="successfulRequest"
                    class="mx-4"
                    :text_to_copy="calendarId"
                ></CopyBlock>
                <div
                    v-if="!successfulRequest"
                    :class="{ 'animate-ping opacity-100': sending }"
                    class="mx-4 size-3 rounded-full bg-green-500 opacity-0"
                ></div>
                <CustomButton
                    @click="createConnection()"
                    :name="'Submit'"
                    :color="'green'"
                ></CustomButton>
            </div>
        </div>
    </div>
    <PopUp
        v-if="openPopUp"
        :color="popUpStatus"
        :message="message"
        @close="(close) => (openPopUp = !close)"
        class="fixed z-50 top-4 right-4"
    ></PopUp>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/solid";
import axios from "axios";
import getOptions from "../utils/getOptions.js";
import CustomButton from "./CustomButton.vue";
import CustomSelect from "./CustomSelect.vue";
import CustomInput from "./CustomInput.vue";
import PopUp from "./PopUp.vue";
import CopyBlock from "./CopyBlock.vue";

const emit = defineEmits(["close"]);
const form = ref({
    calendarName: "",
    calendarId: "",
    database: { name: "Choose an option", value: "" },
    date: { name: "Choose an option", value: "" },
    name: { name: "Choose an option", value: "" },
    description: { name: "Choose an option", value: "" },
    doneMethod: { name: "Choose an option", value: "" },
    doneMethodOption: { name: "Choose an option", value: "" },
});
const loading = ref(true);
const sending = ref(false);
const successfulRequest = ref(false);
const notionData = ref([]);
const calendarId = ref("");
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

watch(
    () => form.value.database.value,
    () => {
        form.value.date = { name: "Choose an option", value: "" };
        form.value.name = { name: "Choose an option", value: "" };
        form.value.description = { name: "Choose an option", value: "" };
        form.value.doneMethod = { name: "Choose an option", value: "" };
        form.value.doneMethodOption = { name: "Choose an option", value: "" };
    },
);

const createConnection = async () => {
    try {
        if (!sending.value) {
            sending.value = true;
            // Check if the form is valid
            const formToCheck = [
                form.value.calendarName,
                form.value.date.value,
                form.value.name.value,
                form.value.description.value,
                form.value.doneMethod.value,
                form.value.doneMethodOption.value,
            ];
            if (
                !formToCheck
                    .toSpliced(0, 1)
                    .toSpliced(2, 3)
                    .every((parameter) => parameter != "")
            )
                throw new Error("Missing fields");
            if (formToCheck[4] != "" && formToCheck[5] == "")
                throw new Error("Missing fields");
            // Modify the form before sending
            let formToSend = JSON.parse(JSON.stringify(form.value));
            if (formToSend.description.name == "Choose an option")
                formToSend.description.name = "";
            if (formToSend.doneMethod.name == "Choose an option")
                formToSend.doneMethod.name = "";
            if (formToSend.calendarName == "")
                formToSend.calendarName = formToSend.database.name;
            const res = await axios.post(
                "http://localhost:6060/v1/api/connections",
                formToSend,
            );
            console.log(res.data.message);
            calendarId.value = res.data.responseData.calendarId;
            successfulRequest.value = true;
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

onMounted(async () => {
    try {
        await get_notion_data();
    } catch (err) {
        console.error(err);
    }
});
</script>
