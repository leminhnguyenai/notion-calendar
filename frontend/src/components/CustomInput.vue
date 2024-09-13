<template>
  <input
    v-model="inputValue"
    type="text"
    :placeholder="props.placeholder"
    class="flex flex-col box-border justify-center h-8 pl-2 rounded-md bg-[#252525] outline outline-1 outline-[#585858] text-xs text-slate-100 overflow-hidden overscroll-none" />
</template>
<script setup>
import { ref, watch, toRef, computed } from "vue";
const emit = defineEmits(["update:modelValue"]);
const props = defineProps(["modelValue", "placeholder"]);

const inputValue = computed({
  get: () => {
    return props.modelValue;
  },
  set: (value) => {
    emit("update:modelValue", value);
  },
});
</script>
