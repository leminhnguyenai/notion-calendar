<template>
  <div
    :class="dynamic_class[color]"
    class="relative flex rounded-md select-none cursor-pointer transition-all duration-200">
    <p class="relative text-slate-100 text-lg mx-4 my-2">
      {{ calendarName }}
    </p>
    <p class="absolute bottom-3 right-3 text-slate-100 text-xs">
      {{ databaseName }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  connection_data: Object,
  color: String,
});

const calendarName = props.connection_data.calendarName;
const databaseName = props.connection_data.database.name;
const dynamic_class = ref({
  orange: `bg-[#FF8225] hover:bg-[#FF8225]/75 active:bg-[#FF8225]/50`,
});
</script>
