<template>
    <div
        :class="theme.init()"
        class="relative flex h-32 col-span-1 rounded-md outline outline-1 bg-opacity-30 select-none cursor-pointer transition-all duration-200 hover:bg-opacity-20 active:brightness-50"
    >
        <p class="absolute top-2 left-2 text-md text-slate-100 font-semibold">
            {{ calendar_name }}
        </p>
        <p class="absolute bottom-2 right-2 text-xs text-slate-100">
            {{ database_name }}
        </p>
    </div>
</template>
<script setup>
import { ref } from "vue";

const { color, calendar_name, database_name } = defineProps({
    color: {
        type: String,
        default: "gray",
    },
    calendar_name: {
        type: String,
        default: "",
    },
    database_name: {
        type: String,
        default: "",
    },
});

const theme = ref({
    // Tailwind CSS colors
    red: "bg-red-500 outline-red-500",
    orange: "bg-orange-400 outline-orange-400",
    amber: "bg-amber-400 outline-amber-400",
    yellow: "bg-yellow-400 outline-yellow-400",
    lime: "bg-lime-400 outline-lime-400",
    green: "bg-green-400 outline-green-400",
    emerald: "bg-emerald-500 outline-emerald-500",
    teal: "bg-teal-500 outline-teal-500",
    cyan: "bg-cyan-500 outline-cyan-500",
    sky: "bg-sky-500 outline-sky-500",
    blue: "bg-blue-500 outline-blue-500",
    indigo: "bg-indigo-500 outline-indigo-500",
    violet: "bg-violet-500 outline-violet-500",
    purple: "bg-purple-500 outline-purple-500",
    fuchsia: "bg-fuchsia-500 outline-fuchsia-500",
    pink: "bg-pink-500 outline-pink-500",
    rose: "bg-rose-500 outline-rose-500",

    // Custom colors
    turquoise: "bg-[#40E0D0] outline-[#40E0D0]",
    coral: "bg-[#FF7F50] outline-[#FF7F50]",
    lavender: "bg-[#E6E6FA] outline-[#E6E6FA]",
    crimson: "bg-[#DC143C] outline-[#DC143C]",

    // Neutral colors
    gray: "bg-gray-500 outline-gray-500",
    slate: "bg-slate-500 outline-slate-500",
    zinc: "bg-zinc-500 outline-zinc-500",
    neutral: "bg-neutral-500 outline-neutral-500",
    stone: "bg-stone-500 outline-stone-500",

    init() {
        const theme = this[color];
        if (!theme) return "bg-indigo-500 outline-indigo-500";
        return theme;
    },
});
</script>
