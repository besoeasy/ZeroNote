<template>
  <div class="fixed bottom-4 right-4 z-50 w-full max-w-sm px-4 sm:px-0">
    <TransitionGroup
      name="toast"
      tag="div"
      class="flex flex-col gap-3"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="w-full rounded-2xl border shadow-lg backdrop-blur bg-white/90 overflow-hidden transition-colors duration-300 dark:bg-slate-900/85 dark:border-slate-700"
        :class="toastBorderClass(t.type)"
      >
        <div class="flex items-start gap-3 p-4">
          <div
            class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            :class="toastIconWrapClass(t.type)"
          >
            <span class="text-base font-black" :class="toastIconClass(t.type)">{{ toastIcon(t.type) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm font-bold text-gray-900 truncate dark:text-slate-100">{{ t.title }}</div>
              <button
                class="shrink-0 text-gray-400 hover:text-gray-700 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
                @click="remove(t.id)"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
            <div class="mt-1 text-xs text-gray-600 leading-relaxed break-words dark:text-slate-300">{{ t.message }}</div>
          </div>
        </div>
        <div class="h-1 w-full" :class="toastBarClass(t.type)"></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useToastStore } from "@/stores/toast";

const toastStore = useToastStore();
const toasts = computed(() => toastStore.toasts);

const remove = (id) => toastStore.remove(id);

const toastIcon = (type) => {
  if (type === "success") return "✓";
  if (type === "error") return "!";
  return "i";
};

const toastBorderClass = (type) => {
  if (type === "success") return "border-emerald-200 dark:border-emerald-500/40";
  if (type === "error") return "border-red-200 dark:border-red-500/40";
  return "border-blue-200 dark:border-blue-500/40";
};

const toastIconWrapClass = (type) => {
  if (type === "success") return "bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30";
  if (type === "error") return "bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30";
  return "bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30";
};

const toastIconClass = (type) => {
  if (type === "success") return "text-emerald-700 dark:text-emerald-300";
  if (type === "error") return "text-red-700 dark:text-red-300";
  return "text-blue-700 dark:text-blue-300";
};

const toastBarClass = (type) => {
  if (type === "success") return "bg-emerald-500/70 dark:bg-emerald-400/70";
  if (type === "error") return "bg-red-500/70 dark:bg-red-400/70";
  return "bg-blue-500/70 dark:bg-blue-400/70";
};
</script>
