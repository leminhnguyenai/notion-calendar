<template>
    <div
        :class="{
            'hover:w-48': active && timeSinceLastSync == 0,
            'hover:w-56':
                active && timeSinceLastSync > 0 && timeSinceLastSync < 10,
            'hover:w-60': active && timeSinceLastSync >= 10,
        }"
        class="flex h-9 w-9 items-center rounded-3xl bg-[#484848]/30 outline outline-1 outline-[#484848] transition-all duration-600 delay-75 ease-in-out overflow-hidden"
    >
        <div
            :class="active ? 'bg-green-500' : 'bg-red-600'"
            class="relative h-4 w-4 ml-2.5 rounded-2xl flex-shrink-0"
        ></div>
        <p class="ml-3 text-xs text-slate-100 whitespace-nowrap">
            {{ message }}
        </p>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const active = ref(false);
const message = ref("");
const timeSinceLastSync = ref(0);

const getTimeSinceLastSync = async () => {
    try {
        const res = await axios.get("http://localhost:6061/status");
        active.value = true;
        timeSinceLastSync.value = res.data.timeSinceLastSync;
        if (timeSinceLastSync.value < 1) message.value = "Last sync: Just now";
        else if (timeSinceLastSync.value == 1)
            message.value = `Last sync: 1 minute ago`;
        else
            message.value = `Last sync: ${timeSinceLastSync.value} minutes ago`;
    } catch (err) {
        active.value = false;
        console.log(err.response);
    }
};
onMounted(async () => {
    await getTimeSinceLastSync();
    setInterval(getTimeSinceLastSync, 30000);
});
</script>
