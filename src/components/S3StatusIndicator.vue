<template>
  <router-link
    to="/s3"
    class="group relative flex items-center gap-2 rounded-2xl px-3 py-1.5 bg-linear-to-r from-emerald-50 via-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 dark:from-emerald-500/10 dark:via-emerald-500/10 dark:to-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
    :title="tooltip"
    aria-live="polite"
  >
    <span class="absolute inset-0 rounded-2xl bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-25 animate-shimmer-slide"></span>
    <div class="relative flex items-center justify-center">
      <span
        class="absolute inline-flex h-3 w-3 rounded-full opacity-60"
        :class="
          status.active
            ? 'bg-emerald-400 animate-ping'
            : status.lastError
              ? 'bg-red-400'
              : status.configured
                ? 'bg-emerald-400/60'
                : 'bg-gray-400'
        "
      ></span>
      <span
        class="relative inline-flex h-2.5 w-2.5 rounded-full"
        :class="
          status.active
            ? 'bg-emerald-500'
            : status.lastError
              ? 'bg-red-500'
              : status.configured
                ? 'bg-emerald-400'
                : 'bg-gray-400'
        "
      ></span>
    </div>

    <span class="text-xs font-medium">
      {{ label }}
    </span>

    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 15a4 4 0 004 4h10a4 4 0 100-8h-1.26A8 8 0 103 15z"
      />
    </svg>
  </router-link>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const status = ref({
  configured: false,
  active: false,
  lastSync: 0,
  lastError: "",
});

function readStatus() {
  status.value.configured = localStorage.getItem("s3_configured") === "true";
  status.value.active = localStorage.getItem("s3_active") === "true";
  status.value.lastSync = Number(localStorage.getItem("s3_last_sync") || 0);
  status.value.lastError = localStorage.getItem("s3_last_error") || "";
}

const label = computed(() => {
  if (!status.value.configured) return "S3 off";
  if (status.value.active) return "Syncing";
  if (status.value.lastError) return "S3 error";
  return "S3 on";
});

const tooltip = computed(() => {
  if (!status.value.configured) return "S3 not configured";
  if (status.value.lastError) return `Last error: ${status.value.lastError}`;
  if (status.value.active) return "Sync in progress";
  if (status.value.lastSync) {
    return `Last sync: ${new Date(status.value.lastSync).toLocaleString()}`;
  }
  return "S3 configured";
});

let intervalId = null;

function handleStorageEvent(event) {
  if (!event.key || !event.key.startsWith("s3_")) return;
  readStatus();
}

onMounted(() => {
  readStatus();
  intervalId = setInterval(readStatus, 3000);
  window.addEventListener("storage", handleStorageEvent);
});

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
  window.removeEventListener("storage", handleStorageEvent);
});
</script>
