<template>
  <div
    ref="dropdown"
    :class="{ 'scale-105 z-20': visibility }"
    class="flex flex-col select-none cursor-pointer">
    <div
      @click="changeVisibility()"
      :class="background"
      class="relative flex flex-col box-border justify-center h-8 w-64 mb-1 rounded-md outline outline-1 outline-[#585858] overflow-hidden overscroll-none">
      <p
        :class="background"
        class="relative pl-2 py-2 text-xs text-slate-100 hover:brightness-90 active:brightness-75">
        {{ selected.name }}
      </p>
      <span
        :class="{ 'rotate-180': visibility }"
        class="absolute right-0 text-slate-100 transition-all duration-200 material-symbols-outlined">
        arrow_drop_down
      </span>
    </div>
    <div
      v-if="visibility && options.length > 0"
      :class="background"
      class="absolute translate-y-9 flex flex-col box-border w-64 max-h-32 rounded-md shadow-md outline outline-1 outline-[#585858] overflow-y-auto">
      <p
        v-for="(option, index) in options"
        @click="
          chooseOption(option);
          changeVisibility();
        "
        :key="index"
        :class="background"
        class="relative pl-2 py-2 text-xs text-slate-100 hover:brightness-90 active:brightness-75">
        {{ option.name }}
      </p>
    </div>
  </div>
</template>
<script setup>
import { ref, toRefs, onMounted, onBeforeUnmount, watch, computed } from "vue";

const { options, default_option } = defineProps({
  options: {
    type: Array,
    default: [],
  },
  default_option: Object,
});
const emit = defineEmits(["selected"]);

const visibility = ref(false);
const selected = ref(default_option);
const background = computed(() => {
  return visibility.value ? "bg-[#454545]" : `bg-[#373737]`;
});

const changeVisibility = () => {
  visibility.value = !visibility.value;
};
const chooseOption = (option) => {
  selected.value = option;
  emit("selected", option);
};
const displayNullOption = () => {
  if (selected.value.value == "") selected.value.name = "Choose an option";
};
// TODO: Modify the props so that the selected value become "Choose an option" for new database
watch(
  () => default_option,
  (data) => {
    selected.value = data;
    displayNullOption();
  }
);
onMounted(() => displayNullOption());
</script>
