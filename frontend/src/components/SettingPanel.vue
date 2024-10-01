<template>
    <div
        class="z-30 fixed size-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#000000] opacity-20"
    ></div>
    <div
        class="flex flex-col z-40 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-3/5 bg-[#252525] outline outline-1 outline-[#484848] rounded-md shadow-md overflow-y-auto"
    >
        <p class="relative m-4 h-8 text-2xl font-semibold text-slate-100">
            Settings
        </p>
        <div class="relative w-1/2 flex m-4 justify-between">
            <p class="relative text-slate-100 text-md font-normal">
                Refresh rate
            </p>
            <CustomSelect
                class="relative"
                :options="options"
                :size="'small'"
                v-model="refreshRateObj"
            ></CustomSelect>
        </div>
        <CustomButton
            class="absolute right-4 bottom-4"
            @click="sendNewRefreshRate()"
            :color="'green'"
            :name="'Submit'"
        ></CustomButton>
        <XMarkIcon
            @click="emit('close', true)"
            class="absolute top-4 right-4 size-6 text-[#484848] select-none cursor-pointer transition-all duration-100 hover:text-[#606060] active:text-[#252525] active:duration-0"
        ></XMarkIcon>
    </div>
    <PopUp
        v-if="open"
        :color="popUpStatus"
        :message="message"
        @close="(close) => (open = !close)"
        class="fixed z-50 bottom-4 right-4"
    ></PopUp>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/solid";
import axios from "axios";
import CustomButton from "./CustomButton.vue";
import CustomSelect from "./CustomSelect.vue";
import PopUp from "./PopUp.vue";

const emit = defineEmits(["close"]);

const options = ref([
    {
        name: "3 minutes",
        value: 180000,
    },
    {
        name: "5 minutes",
        value: 300000,
    },
    {
        name: "15 minutes",
        value: 900000,
    },
    {
        name: "30 minutes",
        value: 1800000,
    },
]);
const refreshRateObj = reactive({
    name: "",
    value: "",
});
const initialRefreshRateObj = reactive({
    name: "",
    value: "",
});
const message = ref("");
const open = ref(false);
const popUpStatus = ref("gray");

const sendNewRefreshRate = async () => {
    try {
        if (
            JSON.stringify(refreshRateObj) ==
            JSON.stringify(initialRefreshRateObj)
        )
            return;
        const res = await axios.patch("http://localhost:6060/v1/api/config", {
            refreshRate: refreshRateObj.value,
        });
        console.log(res.data);
        message.value = res.data;
        popUpStatus.value = "green";
        open.value = true;
    } catch (err) {
        message.value = "Error sending request";
        popUpStatus.value = "red";
        open.value = true;
        console.error(err);
    }
};

onMounted(async () => {
    try {
        const res = await axios.get("http://localhost:6060/v1/api/config");
        const refreshRateValue = res.data.refreshRate;
        if (typeof refreshRateValue != "number")
            throw new Error("Not a number");
        initialRefreshRateObj.name = `${refreshRateValue / 60000} minutes`;
        initialRefreshRateObj.value = refreshRateValue;
        refreshRateObj.name = `${refreshRateValue / 60000} minutes`;
        refreshRateObj.value = refreshRateValue;
    } catch (err) {
        Object.assign(refreshRateObj, { ...options.value[1] });
        console.error(err);
    }
});
</script>
