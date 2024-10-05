<template>
    <div
        ref="dropdown"
        :class="{ 'z-20': visibility }"
        class="flex flex-col select-none cursor-pointer"
    >
        <div
            @click="changeVisibility()"
            :class="background + ' ' + theme.init()"
            class="relative flex flex-col box-border justify-center h-8 mb-1 rounded-md outline outline-1 outline-[#585858] overflow-hidden overscroll-none"
        >
            <p
                :class="background"
                class="relative pl-2 py-2 text-xs text-slate-100 hover:brightness-90 active:brightness-75"
            >
                {{ selected.name }}
            </p>
            <ChevronDownIcon
                :class="{ 'rotate-180': visibility }"
                class="absolute size-4 right-2 text-slate-100 transition-all duration-200"
            ></ChevronDownIcon>
        </div>
        <div
            v-if="visibility && options.length > 0"
            :class="background + ' ' + theme.init()"
            class="absolute translate-y-9 flex flex-col box-border max-h-32 rounded-md shadow-md outline outline-1 outline-[#585858] overflow-y-auto"
        >
            <p
                v-for="(option, index) in options"
                @click="updateSelected(option)"
                :key="index"
                :class="background"
                class="relative pl-2 py-2 text-xs text-slate-100 hover:brightness-90 active:brightness-75"
            >
                {{ option.name }}
            </p>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/solid";

const { size, options, modelValue } = defineProps({
    size: {
        type: String,
        default: "normal",
    },
    options: {
        type: Array,
        default: [],
    },
    modelValue: {
        type: Object,
        default: () => ({
            name: "",
            value: "",
        }),
        required: true,
    },
});
const emit = defineEmits(["update:modelValue"]);

const dropdown = ref(null);
const visibility = ref(false);
const background = computed(() => {
    return visibility.value ? "bg-[#454545]" : `bg-[#373737]`;
});
const selected = computed({
    get: () => modelValue,
    set: (newOption) => {
        emit("update:modelValue", { ...newOption });
    },
});
const theme = ref({
    small: "w-40",
    normal: "w-64",
    large: "w-80",
    full: "w-full",
    init() {
        const selectSize = this[size] || this.normal;
        return selectSize;
    },
});

const changeVisibility = () => {
    visibility.value = !visibility.value;
};
const handleClickOutside = (event) => {
    if (dropdown.value && !dropdown.value.contains(event.target)) {
        visibility.value = false;
    }
};
const updateSelected = (option) => {
    if (JSON.stringify(option) != JSON.stringify(selected.value)) {
        selected.value.name = option.name;
        selected.value.value = option.value;
        //console.log(selected.value);
    }
    changeVisibility();
};

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    if (modelValue.value == "" && modelValue.name == "")
        modelValue.name = "Choose an option";
});
onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>
