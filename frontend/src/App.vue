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
    <div class="z-10 grid grid-cols-6 gap-2 mt-20 mx-4 mb-2">
        <Connection
            v-for="connection in connectionList"
            :key="connection.calendarId"
            :color="'orange'"
            :calendar_name="connection.calendarName"
            :database_name="connection.database.name"
        ></Connection>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { Cog8ToothIcon } from "@heroicons/vue/24/outline";
import Connection from "./components/Connection.vue";
import SyncStatus from "./components/SyncStatus.vue";
import SettingPanel from "./components/SettingPanel.vue";

const openSetting = ref(false);
const connectionList = ref([]);

onMounted(async () => {
    try {
        const res = await axios.get("http://localhost:6060/v1/api/connections");
        connectionList.value = JSON.parse(JSON.stringify(res.data));
    } catch (err) {
        console.error(err);
    }
});
</script>
