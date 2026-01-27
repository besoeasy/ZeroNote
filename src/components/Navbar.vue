<template>
  <div class="min-h-screen bg-white flex flex-col">
    <header class="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-gray-200">
      <div class="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
        <router-link
          to="/dashboard"
          class="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 transition-all duration-300"
          title="ZeroNote"
        >
          <div class="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm transition-all duration-300 hover:shadow-md">
            <span class="text-sm font-semibold">ZN</span>
          </div>
          <div class="hidden sm:flex flex-col leading-tight">
            <span class="text-sm font-semibold text-gray-900">ZeroNote</span>
            <span class="text-[11px] text-gray-500">Private notes</span>
          </div>
        </router-link>

        <div class="flex-1"></div>

        <div class="flex items-center gap-1.5 sm:gap-2">
          <button
            v-if="isDashboard"
            @click="handleNewNote"
            class="h-10 px-3 rounded-xl bg-gray-900 text-white flex items-center gap-2 hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
            title="New Note"
          >
            <Plus class="w-5 h-5" />
            <span class="hidden sm:inline text-sm font-medium">New</span>
          </button>

          <router-link
            v-else
            to="/dashboard"
            class="h-10 px-3 rounded-xl bg-gray-100 text-gray-900 flex items-center gap-2 hover:bg-gray-200 transition-all duration-300 active:scale-[0.98]"
            title="Back to Notes"
          >
            <ArrowLeft class="w-5 h-5" />
            <span class="hidden sm:inline text-sm font-medium">Back</span>
          </router-link>

          <router-link
            to="/data"
            class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-300 active:scale-[0.98]"
            title="Data Hub"
          >
            <Database class="w-5 h-5" />
          </router-link>

          <router-link
            to="/import"
            class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-300 active:scale-[0.98]"
            title="Import Data"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </router-link>

          <router-link
            to="/stats"
            class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-300 active:scale-[0.98]"
            title="Statistics"
          >
            <BarChart3 class="w-5 h-5" />
          </router-link>

          <router-link
            to="/about"
            class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-300 active:scale-[0.98]"
            title="About ZeroNote"
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
            class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-300 active:scale-[0.98]"
            title="Lock App"
          >
            <Lock class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 w-full overflow-auto">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Lock, Database, BarChart3, ArrowLeft } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const isDashboard = computed(() => route.path === "/dashboard" || route.path === "/");

const emit = defineEmits(["newNote"]);

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
</script>
