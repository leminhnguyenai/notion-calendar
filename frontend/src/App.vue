<template>
    <nav
        class="flex fixed z-30 w-screen h-16 top-0 bg-[#202020]/70 backdrop-filter backdrop-blur-lg outline outline-1 outline-[#484848] items-center"
    >
        <Cog8ToothIcon
            @click="openSetting = true"
            class="absolute right-6 h-6 text-[#606060] select-none cursor-pointer hover:text-[#d4d4d4] active:text-[#585858] active:duration-75 transition-all duration-200"
        ></Cog8ToothIcon>
        <SyncStatus class="absolute left-6"></SyncStatus>
    </nav>
    <SettingPanel
        v-if="openSetting"
        @close="(close) => (openSetting = !close)"
    ></SettingPanel>
    <div
        class="z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mt-20 mx-4 mb-2"
    >
        <Connection
            v-for="connection in connectionList"
            :key="connection.calendarId"
            :color="getTheme(connection.calendarId)"
            :calendar_name="connection.calendarName"
            :database_name="connection.database.name"
        ></Connection>
    </div>
    <div
        @click="openNewConfigTab = true"
        class="fixed bottom-4 right-4 bg-slate-100 rounded-3xl outline outline-1 outline-[#484848] transition-all duration-200 hover:bg-opacity-60 active:brightness-75 active:duration-75 select-none cursor-pointer"
    >
        <PlusIcon class="size-5 m-3"></PlusIcon>
    </div>
    <ConfigurationTab
        v-if="openNewConfigTab"
        @close="
            (close) => {
                openNewConfigTab = !close;
                getConnections();
            }
        "
    ></ConfigurationTab>
</template>
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { Cog8ToothIcon, PlusIcon } from "@heroicons/vue/24/outline";
import Connection from "./components/Connection.vue";
import SyncStatus from "./components/SyncStatus.vue";
import SettingPanel from "./components/SettingPanel.vue";
import ConfigurationTab from "./components/ConfigurationTab.vue";
import StringToNum from "./utils/StringToNum.js";
import getRandomColor from "./utils/getRandomColor.js";

const openSetting = ref(false);
const openNewConfigTab = ref(false);
const connectionList = ref([]);

const getTheme = (calendarId) => {
    const number = StringToNum(calendarId.slice(0, 4));
    const remainder = number % 23;
    return getRandomColor(remainder);
};

const getConnections = async () => {
    try {
        const res = await axios.get("http://localhost:6060/v1/api/connections");
        connectionList.value = JSON.parse(JSON.stringify(res.data));
    } catch (err) {
        console.error(err);
    }
};

onMounted(getConnections);
</script>
