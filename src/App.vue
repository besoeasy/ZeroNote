<template>
  <div class="min-h-screen w-full flex flex-col bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
    <RouterView v-if="isPublicShareRoute" />

    <LockScreen v-else-if="!isUnlocked" @unlock="handleUnlock" />

    <div v-else class="min-h-screen bg-white flex flex-col transition-colors duration-300 dark:bg-gray-950">
      <header class="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-gray-200 transition-colors duration-300 dark:bg-gray-950/75 dark:border-gray-800">
        <div class="w-full px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4">
          <router-link
            to="/dashboard"
            class="group flex items-center gap-2 rounded-2xl px-2 py-1.5 hover:bg-gray-100 transition-all duration-300 dark:hover:bg-gray-900/60"
            title="ZeroNote"
          >
            <div class="relative w-10 h-10 rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 overflow-hidden">
              <div class="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-shimmer-slide"></div>
              <span class="text-sm font-semibold relative">ZN</span>
            </div>
            <div class="hidden sm:flex flex-col leading-tight">
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">ZeroNote</span>
              <span class="text-[11px] text-gray-500 dark:text-gray-400">Private notes</span>
            </div>
          </router-link>

          <div class="flex-1"></div>

          <div class="flex items-center gap-2">
            <button
              v-if="isDashboard"
              @click="handleNewNote"
              class="group relative h-10 px-3.5 rounded-xl bg-linear-to-r from-gray-900 to-gray-800 text-white flex items-center gap-2 hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.98] overflow-hidden dark:from-white dark:to-gray-100 dark:text-gray-900 dark:hover:from-white dark:hover:to-gray-200"
              title="New Note"
            >
              <span class="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-shimmer-slide"></span>
              <Plus class="w-5 h-5" />
              <span class="hidden sm:inline text-sm font-medium">New</span>
            </button>

            <router-link
              v-else
              to="/dashboard"
              class="h-10 px-3 rounded-xl bg-gray-100 text-gray-900 flex items-center gap-2 hover:bg-gray-200 transition-all duration-300 active:scale-[0.98] dark:bg-gray-900/70 dark:text-gray-100 dark:hover:bg-gray-900"
              title="Back to Notes"
            >
              <ArrowLeft class="w-5 h-5" />
              <span class="hidden sm:inline text-sm font-medium">Back</span>
            </router-link>

            <button
              @click="theme.toggle"
              class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
              :title="theme.resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
              aria-label="Toggle theme"
            >
              <component :is="theme.resolvedTheme === 'dark' ? Sun : Moon" class="w-5 h-5" />
            </button>

            <S3StatusIndicator />

            <div class="flex items-center gap-1.5 rounded-2xl bg-gray-50 p-1.5 shadow-inner border border-gray-100 dark:bg-gray-900/60 dark:border-gray-800">
              <router-link
                to="/data"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
                title="Data Hub"
                aria-label="Data Hub"
              >
                <Database class="w-5 h-5" />
              </router-link>

              <router-link
                to="/stats"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
                title="Statistics"
                aria-label="Statistics"
              >
                <BarChart3 class="w-5 h-5" />
              </router-link>

              <router-link
                to="/about"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
                title="About ZeroNote"
                aria-label="About ZeroNote"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </router-link>

              <button
                @click="handleLogout"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
                title="Lock App"
                aria-label="Lock app"
              >
                <Lock class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 w-full overflow-auto">
        <RouterView />
      </main>
    </div>

    <S3AutoSync />
    <ToastHost />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import LockScreen from "@/components/LockScreen.vue";
import ToastHost from "@/components/ToastHost.vue";
import S3AutoSync from "@/components/S3AutoSync.vue";
import S3StatusIndicator from "@/components/S3StatusIndicator.vue";
import { Plus, Lock, Database, BarChart3, ArrowLeft, Sun, Moon } from "lucide-vue-next";
import { useThemeStore } from "@/stores/theme.js";

const isUnlocked = ref(false);
const route = useRoute();
const router = useRouter();
const theme = useThemeStore();

const isPublicShareRoute = computed(() => {
  return route.name === "ipfs-note" || route.name === "ipfs-note-key";
});

const isDashboard = computed(() => route.path === "/dashboard" || route.path === "/");

const handleUnlock = () => {
  location.reload();
};

const generateRandomId = () => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

const handleNewNote = () => {
  router.push(`/notes/${generateRandomId()}/edit`);
};

const handleLogout = () => {
  if (confirm("Are you sure you want to lock the app?")) {
    sessionStorage.clear();
    location.reload();
  }
};

onMounted(() => {
  if (sessionStorage.getItem("ENCRYPTION_KEY")) {
    isUnlocked.value = true;
  }
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
}

.dark body {
  background-color: #030712;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dark ::-webkit-scrollbar-track {
  background: #0b1220;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #334155;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Focus states for accessibility */
button:focus,
a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
