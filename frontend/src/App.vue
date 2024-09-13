<template>
  <nav
    class="flex flex-row-reverse fixed w-screen h-16 top-0 bg-[#202020] outline outline-1 outline-[#484848] items-center">
    <span
      @click="open_setting = !open_setting"
      class="material-symbols-outlined mr-4 text-slate-100 select-none cursor-pointer hover:text-slate-200 active:text-slate-400 transition-all duration-200"
      >settings</span
    >
  </nav>
  <div class="grid grid-cols-6 gap-2 mt-20 mx-4 mb-2">
    <Connection
      @click="
        connection_data_to_pass = JSON.parse(JSON.stringify(connection_data));
        open_tab = !open_tab;
      "
      class="h-32 col-span-1"
      v-for="(connection_data, index) in connections_data"
      :key="index"
      :connection_data="connection_data"
      :color="'orange'">
    </Connection>
  </div>
  <AddButton
    @click="
      connection_data_to_pass = empty_form;
      open_tab = !open_tab;
    "
    class="fixed bottom-8 right-8"></AddButton>
  <SettingPanel
    v-if="open_setting"
    @open_setting="(value) => (open_setting = value)"
    class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></SettingPanel>
  <div
    v-if="open_tab"
    class="fixed size-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#000000] opacity-20"></div>
  <ConfigurationTab
    v-if="open_tab"
    @open_tab="(value) => (open_tab = value)"
    :connection_data="connection_data_to_pass"
    class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></ConfigurationTab>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import Connection from "./components/Connection.vue";
import AddButton from "./components/AddButton.vue";
import SettingPanel from "./components/SettingPanel.vue";
import ConfigurationTab from "./components/ConfigurationTab.vue";
import axios from "axios";

const connections_data = ref({});
const connection_data_to_pass = ref(null);
const open_setting = ref(false);
const open_tab = ref(false);
const empty_form = ref({
  calendarName: "",
  calendarId: "",
  database: { name: "", value: "" },
  date: { name: "", value: "" },
  name: { name: "", value: "" },
  description: { name: "", value: "" },
  doneMethod: { name: "", value: "" },
  doneMethodOption: { name: "", value: "" },
});
const get_connection_data = async () => {
  try {
    const res = await axios.get("http://localhost:6060/v1/api/connections");
    connections_data.value = JSON.parse(JSON.stringify(res)).data;
  } catch (err) {
    console.error(err);
  }
};

//watch(connections_data, (data) => console.log(data));
//watch(config_data, (data) => console.log(data));

onMounted(() => {
  get_connection_data();
});
</script>
