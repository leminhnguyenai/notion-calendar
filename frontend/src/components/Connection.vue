<template>
    <div
        :class="theme.init()"
        class="relative flex h-32 col-span-1 rounded-md outline outline-1 bg-opacity-30 select-none cursor-pointer transition-all duration-200"
    >
        <p class="absolute top-2 left-2 text-md text-slate-100 font-semibold">
            {{ calendar_name }}
        </p>
        <p class="absolute bottom-2 right-2 text-xs text-slate-100">
            {{ database_name }}
        </p>
    </div>
</template>
<script setup>
import { ref } from "vue";

const { color, calendar_name, database_name } = defineProps({
    color: {
        type: String,
        default: "gray",
    },
    calendar_name: {
        type: String,
        default: "",
    },
    database_name: {
        type: String,
        default: "",
    },
});

const theme = ref({
    orange: "bg-orange-400 outline-orange-400",
    green: "bg-green-400 outline-green-400",
    gray: "bg-gray-500 outline-gray-500",
    init() {
        const theme = this[color];
        if (!theme) return "bg-gray-500 outline-gray-500";
        return theme;
    },
});
</script>
