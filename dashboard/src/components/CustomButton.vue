<template>
    <button
        :class="dynamic_class[color]"
        class="flex items-center justify-center box-border px-4 py-2 text-sm select-none cursor-pointer rounded-md transition-all duration-200"
    >
        {{ props.name }}
    </button>
</template>
<script setup>
const props = defineProps({
    name: String,
    color: String,
});
import { ref } from "vue";

const dynamic_class = ref({
    red: `text-slate-100 bg-red-600 hover:bg-red-600/75 active:bg-red-600/50`,
    green: `text-slate-100 bg-[#52b038] hover:bg-[#52b038]/75 active:bg-[#52b038]/50`,
});
</script>
