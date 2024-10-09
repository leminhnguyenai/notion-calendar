<template>
  <div>
    <div
      class="relative flex flex-nowrap box-border items-center h-8 w-80 rounded-md bg-[#373737] outline outline-1 outline-[#585858] overflow-hidden overscroll-none">
      <p class="absolute mx-2 my-4 text-slate-100 text-xs whitespace-nowrap">
        {{ text_to_copy }}
      </p>
      <div
        class="absolute flex items-center justify-center right-0 h-8 w-8 text-slate-100 bg-[#373737] select-none cursor-pointer">
        <ClipboardIcon
          @click="copy_text()"
          v-if="!copied"
          class="scale-75 hover:text-slate-200 active:text-slate-400 transition-all duration-200 size-4"></ClipboardIcon>
        <CheckIcon
          v-if="copied"
          class="scale-75 hover:text-slate-200 active:text-slate-400 transition-all duration-200 size-4"
          >check</CheckIcon
        >
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { ClipboardIcon, CheckIcon } from "@heroicons/vue/24/outline";

// From Vue 3.5 and onward, defineProps will automatically make the props reactive
const { text_to_copy } = defineProps({
  text_to_copy: String,
});

const copied = ref(false);

const copy_text = () => {
  navigator.clipboard
    .writeText(text_to_copy)
    .then(() => {
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 3000);
    })
    .catch((err) => {
      console.error(err);
    });
};
</script>
