<template>
    <input
        ref="input"
        v-model="inputValue"
        :class="{ 'outline-0 bg-opacity-0': canBeInvisible && !visibility }"
        @click="visibility = true"
        type="text"
        :maxlength="wordLimit"
        class="flex flex-col box-border justify-center pl-2 rounded-md bg-[#252525] outline outline-1 outline-[#585858] text-xs text-slate-100 overflow-hidden overscroll-none"
    />
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
const emit = defineEmits(["update:modelValue"]);
const { modelValue, canBeInvisible, wordLimit } = defineProps({
    modelValue: {
        type: String,
        required: true,
    },

    canBeInvisible: {
        type: Boolean,
        default: false,
    },
    wordLimit: {
        type: Number,
        default: 100,
    },
});

const inputValue = computed({
    get: () => {
        return modelValue;
    },
    set: (value) => {
        emit("update:modelValue", value);
    },
});
const inputValueLength = computed(() => {
    return inputValue.value.length;
});
const visibility = ref(true);
const input = ref(null);

const handleClickOutside = (event) => {
    if (input.value && !input.value.contains(event.target)) {
        visibility.value = false;
    }
};

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>
