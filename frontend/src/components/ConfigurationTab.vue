<template>
    <div
        class="z-30 fixed size-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#000000] opacity-20"
    ></div>
    <div
        class="flex flex-col z-40 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-full xl:size-4/5 bg-[#252525] outline outline-1 outline-[#484848] rounded-md shadow-md overflow-y-auto"
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
            :class="{ 'opacity-100': !reloading && form.database.value != '' }"
            class="w-auto m-4 grid grid-cols-3 gap-4 opacity-0 transition-all duration-500"
        >
            <div class="flex flex-col col-span-1">
                <p class="my-4 text-sm text-slate-100 font-medium">
                    Calendar name
                </p>
                <CustomInput
                    v-model="form.calendarName"
                    class="mb-4 mr-4 h-8 w-auto"
                ></CustomInput>
                <p class="mx-4 w-auto text-slate-100 text-xs">
                    {{ form }}
                </p>
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
                <p class="my-4 text-sm text-slate-100 font-medium">
                    Done option
                </p>
                <CustomSelect
                    v-model="form.doneMethodOption"
                    class="mb-4 mr-4"
                ></CustomSelect>
            </div>
        </div>
    </div>
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
const reloading = ref(true);
const notionData = ref([]);

const get_notion_data = async () => {
    reloading.value = true;
    try {
        const res = await axios.get("http://localhost:6060/v1/api/data");
        notionData.value = JSON.parse(JSON.stringify(res)).data;
        reloading.value = false;
    } catch (err) {
        console.error(err);
        reloading.value = false;
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

onMounted(async () => {
    await get_notion_data();
});
</script>
