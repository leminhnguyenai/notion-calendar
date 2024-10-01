<template>
    <div
        :class="theme.init() + ' ' + (isVisible ? 'opacity-100' : 'opacity-0')"
        class="flex h-24 w-64 rounded-md outline outline-1 bg-opacity-20 transition-opacity duration-500 ease-in-out"
    >
        <XMarkIcon
            @click="closePopUp"
            class="absolute top-2 right-2 size-5 text-inherit select-none cursor-pointer transition-all duration-100 hover:brightness-125 active:brightness-75 active:duration-0"
        ></XMarkIcon>
        <p class="relative m-2 w-4/5 text-slate-100 text-xs">{{ message }}</p>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/solid";

const { message, color } = defineProps({
    message: {
        type: String,
        default: "",
    },
    color: {
        type: String,
        default: "gray",
    },
});
const emit = defineEmits(["close"]);

const isVisible = ref(false); // Tracks visibility for opacity transition
const theme = ref({
    red: "bg-red-400 outline-red-400 text-red-400",
    green: "bg-green-400 outline-green-400 text-green-400",
    gray: "bg-gray-500 outline-gray-500 text-gray-500",
    init() {
        const theme = this[color];
        if (!theme) return "bg-gray-500 outline-gray-500 text-gray-500";
        return theme;
    },
});

const closePopUp = () => {
    isVisible.value = false;
    setTimeout(() => {
        emit("close", true);
    }, 500);
};

onMounted(() => {
    // Trigger opacity transition after mount
    setTimeout(() => {
        isVisible.value = true;
    }, 100);

    // Automatically close the component after 5 seconds
    setTimeout(() => {
        isVisible.value = false;
    }, 4500);
    setTimeout(() => {
        emit("close", true);
    }, 5000);
});
</script>
