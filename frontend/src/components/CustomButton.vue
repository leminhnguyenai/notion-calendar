<template>
    <button
        :class="theme.init()"
        class="flex items-center justify-center box-border h-8 w-24 px-4 py-2 bg-opacity-30 outline outline-1 text-sm select-none cursor-pointer rounded-md transition-all duration-200 hover:bg-opacity-20 active:brightness-75 active:duration-75"
    >
        {{ name }}
    </button>
</template>
<script setup>
import { ref } from "vue";

const { name, color } = defineProps({
    name: {
        type: String,
        default: "",
    },
    color: {
        type: String,
        default: "gray",
    },
});

const theme = ref({
    orange: "bg-orange-400 outline-orange-400 text-white",
    green: "bg-green-400 outline-green-400 text-white",
    gray: "bg-gray-500 outline-gray-500 text-white",
    init() {
        const theme = this[color];
        if (!theme) return "bg-gray-500 outline-gray-500";
        return theme;
    },
});
</script>
