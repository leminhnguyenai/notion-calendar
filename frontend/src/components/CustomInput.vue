<template>
    <div ref="input" :class="textClass" class="flex flex-col">
        <input
            v-model="inputValue"
            :class="
                (canBeInvisible && !visibility
                    ? 'outline-0 bg-opacity-0'
                    : 'outline-1 bg-opacity-100') +
                ' ' +
                textClass
            "
            @click="visibility = true"
            type="text"
            :maxlength="wordLimit"
            :placeholder="placeholder"
            class="box-border items-center p-2 rounded-md bg-[#252525] outline outline-[#585858] text-xs text-slate-100 overflow-hidden overscroll-none"
        />
        <span v-if="canBeFlexible" class="opacity-0 h-0 w-1/3">
            {{ inputLength }}</span
        >
    </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
const emit = defineEmits(["update:modelValue"]);
const {
    modelValue,
    canBeInvisible,
    wordLimit,
    canBeFlexible,
    placeholder,
    textClass,
} = defineProps({
    modelValue: {
        type: String,
        required: true,
    },

    canBeInvisible: {
        type: Boolean,
        default: false,
    },
    canBeFlexible: {
        type: Boolean,
        default: false,
    },
    wordLimit: {
        type: Number,
        default: 100,
    },
    placeholder: {
        type: String,
        default: "",
    },
    textClass: {
        type: String,
        default: "",
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
const inputLength = computed(() => {
    const inputValueCopy = inputValue.value;
    inputValueCopy.slice(0, wordLimit);
    return inputValueCopy;
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
