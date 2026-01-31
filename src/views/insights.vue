<template>
  <div
    class="min-h-screen w-full p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-10"
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
    <div v-else class="space-y-12 animate-fade-in-up">
      <!-- Page Header -->
      <div class="text-center space-y-3">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-slate-100">
          Insights
        </h1>
        <p class="text-base sm:text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
          Your workspace analytics and app information
        </p>
      </div>
      <!-- Stats Section -->
      <div class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-800"></div>
          <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Statistics</h2>
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-800"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      </div>

      <!-- System Info Section -->
      <div class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-800"></div>
          <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">System</h2>
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-800"></div>
        </div>
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 dark:bg-slate-950 dark:border-slate-800">

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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

      <!-- About Section -->
      <div class="space-y-8">
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-800"></div>
          <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">About</h2>
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-800"></div>
        </div>

        <div class="text-center space-y-4">
          <h3 class="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight dark:text-slate-100">
            ZERO NOTE
          </h3>
          <p class="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto dark:text-slate-300">
            A privacy-focused, local-first note-taking application. All your data stays on your device with optional encrypted sync.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div class="group relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 dark:bg-slate-950 dark:border-slate-800">
            <div class="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gray-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity dark:bg-slate-800/40"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4">
                <svg class="w-8 h-8 text-gray-900 dark:text-slate-100" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                </svg>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Open Source</h2>
              </div>
              <p class="text-gray-600 mb-6 leading-relaxed dark:text-slate-300">
                ZeroNote is open source and welcomes contributions. Fork the repository, use AI tools to make improvements, and submit pull requests.
              </p>
              <a href="https://github.com/besoeasy/ZeroNote" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>

          <div class="group relative overflow-hidden bg-orange-600 rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 dark:bg-orange-700">
            <div class="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h2 class="text-2xl font-bold text-white">Support Us</h2>
              </div>
              <p class="text-orange-50 mb-6 leading-relaxed">
                ZeroNote is free and ad-free. Support ongoing development with a donation.
              </p>
              <a href="https://sponsor.besoeasy.com/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl hover:bg-orange-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm dark:bg-white/90 dark:text-orange-700 dark:hover:bg-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Donate/Sponsor
              </a>
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
