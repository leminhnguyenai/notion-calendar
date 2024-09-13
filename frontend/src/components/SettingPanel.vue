<template>
  <div class="flex flex-col size-2/5 bg-[#313131] rounded-md shadow-md overflow-y-auto">
    <span
      @click="emit('open_setting', false)"
      class="material-symbols-outlined absolute top-2 right-2 text-slate-100 text-xl hover:text-slate-200 active:text-slate-300 transition-all duration-200 select-none cursor-pointer">
      close
    </span>
    <div v-if="config_loaded" class="flex justify-between mx-8 my-10">
      <p class="relative text-sm text-slate-100">Refresh rate</p>
      <CustomInput
        @output_value="(value) => (new_refresh_rate = value)"
        :input_value="old_refresh_rate"
        class="w-24" />
    </div>
    <div class="sticky buttom-0 flex grow w-full">
      <div class="flex flex-row absolute bottom-4 right-4">
        <p class="flex items-center justify-center relative mx-2 text-xs text-yellow-300">
          {{ warning_message }}
        </p>
        <CustomButton
          @click="submit_config()"
          :color="'green'"
          :name="'Save'"
          class="relative h-8 w-24"></CustomButton>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import CustomInput from "./CustomInput.vue";
import CustomButton from "./CustomButton.vue";
import axios from "axios";

const emit = defineEmits(["open_setting"]);

const old_refresh_rate = ref("");
const new_refresh_rate = ref("");
const warning_message = ref("");
const config_loaded = ref(false);

const get_config_data = async () => {
  try {
    const res = await axios.get("http://localhost:6060/v1/api/config");
    old_refresh_rate.value = JSON.parse(JSON.stringify(res)).data.refreshRate / 1000;
    config_loaded.value = true;
  } catch (err) {
    console.error(err);
  }
};
const submit_config = async () => {
  if (typeof new_refresh_rate.value != "number") {
    warning_message.value = "Invalid input";
    setTimeout(() => {
      warning_message.value = "";
    }, 5000);
  }
  if (new_refresh_rate.value < 30) {
    warning_message.value = "Refresh rate can't be lower than 30 seconds";
    warning_message.value = "Invalid input";
    setTimeout(() => {
      warning_message.value = "";
    }, 5000);
  }
  try {
    await axios.patch("http://localhost:6060/api/config", {
      refreshRate: new_refresh_rate.value * 1000,
    });
    emit("open_setting", false);
  } catch (err) {
    console.error(err);
  }
};

onMounted(get_config_data);
</script>
