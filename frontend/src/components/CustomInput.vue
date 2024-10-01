<template>
    <input
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        class="flex flex-col box-border justify-center h-8 pl-2 rounded-md bg-[#252525] outline outline-1 outline-[#585858] text-xs text-slate-100 overflow-hidden overscroll-none"
    />
</template>
<script setup>
import { computed } from "vue";
const emit = defineEmits(["update:modelValue"]);
const { modelValue, placeholder } = defineProps(["modelValue", "placeholder"]);

const inputValue = computed({
    get: () => {
        return modelValue;
    },
    set: (value) => {
        emit("update:modelValue", value);
    },
});
</script>
