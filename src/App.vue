<template>
  <div class="min-h-screen w-full flex flex-col bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
    <RouterView v-if="isPublicShareRoute" />

    <LockScreen v-else-if="!isUnlocked" @unlock="handleUnlock" />

    <Navbar v-else class="w-full" @newNote="handleNewNote">
      <RouterView />
    </Navbar>

    <ToastHost />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import LockScreen from "@/components/LockScreen.vue";
import Navbar from "@/components/Navbar.vue";
import ToastHost from "@/components/ToastHost.vue";

const isUnlocked = ref(false);
const route = useRoute();

const isPublicShareRoute = computed(() => {
  return route.name === "ipfs-note" || route.name === "ipfs-note-key";
});

const handleUnlock = () => {
  location.reload();
};

const handleNewNote = () => {
  // This will be forwarded to the dashboard component
  // For now, we'll just emit it and let child components handle it
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
