<template>
  <div
    class="min-h-screen w-full p-4 md:p-8 max-w-5xl mx-auto flex flex-col items-center justify-center"
  >
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex flex-col justify-center items-center py-32 space-y-4"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-blue-600"
      ></div>
      <p class="text-gray-400 font-medium animate-pulse dark:text-slate-500">
        Crunching the numbers...
      </p>
    </div>

    <!-- Stats Grid -->
    <div v-else class="space-y-8 animate-fade-in-up">
      <!-- Primary Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Notes Card -->
        <div
          class="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:bg-slate-950 dark:border-slate-800"
        >
          <div
            class="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity dark:bg-blue-500/20"
          ></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div
                class="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors dark:bg-blue-500/10 dark:group-hover:bg-blue-500/20"
              >
                <FileText class="w-6 h-6 text-blue-600" />
              </div>
              <span
                class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-lg dark:bg-blue-500/10 dark:text-blue-300"
                >Active</span
              >
            </div>
            <h3 class="text-gray-500 font-medium text-sm mb-1 dark:text-slate-400">Total Notes</h3>
            <p class="text-5xl font-black text-gray-900 tracking-tight dark:text-slate-100">
              {{ stats.totalNotes }}
            </p>
          </div>
        </div>

        <!-- Deleted Notes Card -->
        <div
          class="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:bg-slate-950 dark:border-slate-800"
        >
          <div
            class="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity dark:bg-red-500/20"
          ></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div
                class="p-3 bg-red-50 rounded-2xl group-hover:bg-red-100 transition-colors dark:bg-red-500/10 dark:group-hover:bg-red-500/20"
              >
                <Trash2 class="w-6 h-6 text-red-600" />
              </div>
              <span
                v-if="stats.deletedNotes > 0"
                class="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded-lg dark:bg-red-500/10 dark:text-red-300"
                >Purging Soon</span
              >
            </div>
            <h3 class="text-gray-500 font-medium text-sm mb-1 dark:text-slate-400">Trash</h3>
            <p class="text-5xl font-black text-gray-900 tracking-tight dark:text-slate-100">
              {{ stats.deletedNotes }}
            </p>
          </div>
        </div>

        <!-- First Note Card -->
        <div
          class="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:bg-slate-950 dark:border-slate-800"
        >
          <div
            class="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity dark:bg-amber-500/20"
          ></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div
                class="p-3 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors dark:bg-amber-500/10 dark:group-hover:bg-amber-500/20"
              >
                <Calendar class="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 class="text-gray-500 font-medium text-sm mb-1 dark:text-slate-400">First Idea</h3>
            <p class="text-xl font-bold text-gray-900 leading-tight dark:text-slate-100">
              {{ stats.oldestNoteDate }}
            </p>
          </div>
        </div>
      </div>

      <!-- System Info Section -->
      <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 dark:bg-slate-900/40 dark:border-slate-800">
        <div class="flex items-center gap-3 mb-8">
          <HardDrive class="w-6 h-6 text-gray-700 dark:text-slate-300" />
          <h3 class="text-xl font-bold text-gray-900 dark:text-slate-100">System Status</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- DB Info -->
          <div class="space-y-2">
            <span
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-slate-500"
              >Database</span
            >
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full bg-green-500 animate-pulse"
              ></div>
              <p class="font-mono text-sm font-medium text-gray-700 break-all dark:text-slate-200">
                {{ stats.dbName }}
              </p>
            </div>
          </div>

          <!-- Version Info -->
          <div class="space-y-2">
            <span
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-slate-500"
              >Version</span
            >
            <p class="font-mono text-sm font-medium text-gray-700 dark:text-slate-200">
              v{{ stats.appVersion }}
            </p>
          </div>

          <!-- Security Info -->
          <div class="space-y-2">
            <span
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-slate-500"
              >Security</span
            >
            <div
              class="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full w-fit dark:text-green-300 dark:bg-green-500/10"
            >
              <Shield class="w-3 h-3" />
              <span class="text-xs font-bold">Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/db.js";
import { version } from "@/../package.json";
import { FileText, Calendar, HardDrive, Shield, Trash2 } from "lucide-vue-next";

const isLoading = ref(true);
const stats = ref({
  totalNotes: 0,
  deletedNotes: 0,
  oldestNoteDate: "No notes yet",
  dbName: "",
  appVersion: version,
});

const loadStats = async () => {
  isLoading.value = true;
  try {
    // Get active notes
    const notes = await db.notes
      .filter((note) => note.deletedAt === null || note.deletedAt === undefined)
      .toArray();
    stats.value.totalNotes = notes.length;

    // Get deleted notes
    const deletedNotes = await db.notes
      .filter((note) => note.deletedAt !== null && note.deletedAt !== undefined)
      .toArray();
    stats.value.deletedNotes = deletedNotes.length;

    // Find oldest note date
    if (notes.length > 0) {
      const sortedByDate = [...notes].sort((a, b) => a.updatedAt - b.updatedAt);
      const oldestNote = sortedByDate[0];
      stats.value.oldestNoteDate = formatFullDate(oldestNote.updatedAt);
    }

    // Get DB name
    stats.value.dbName = db.name;
  } catch (error) {
    console.error("Error loading stats:", error);
  } finally {
    // Add a small delay for smoother transition
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
};

const formatFullDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
