<template>
  <!-- Notes Grid View -->
  <div class="w-full mx-auto p-2 md:p-8 pt-8 md:pt-8">
    <!-- Search Bar -->
    <div class="mb-8 relative max-w-2xl mx-auto">
      <div class="relative group">
        <div
          class="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"
        ></div>
        <div
          class="relative flex items-center bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <Search class="absolute left-4 text-gray-400 w-5 h-5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search your notes..."
            class="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl focus:outline-none text-gray-700 placeholder-gray-400"
          />
          <div
            class="absolute right-4 hidden md:flex items-center gap-1 pointer-events-none"
          >
            <kbd
              class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded"
              >/</kbd
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Supertag Filters -->
    <div class="mb-8">
      <div class="flex items-center justify-center gap-2 flex-wrap">
        <button
          @click="selectedSupertag = null"
          :class="
            selectedSupertag === null
              ? 'bg-gray-900 text-white shadow-md transform scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
          "
          class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
        >
          All Notes
        </button>
        <button
          v-for="tag in availableSupertags"
          :key="tag.name"
          @click="selectedSupertag = tag.name"
          :class="
            selectedSupertag === tag.name
              ? 'bg-gray-900 text-white shadow-md transform scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
          "
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5"
        >
          <span>{{ tag.icon }}</span>
          <span>{{ tag.displayName }}</span>
        </button>
      </div>
    </div>

    <!-- Notes Grid -->
    <div
      v-if="!isLoading"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20"
    >
      <!-- New Note Card -->
      <div
        @click="startNewNote"
        class="group cursor-pointer rounded-2xl p-5 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center min-h-[260px] transition-all duration-300 bg-white/50"
      >
        <div
          class="w-14 h-14 rounded-full bg-blue-50 group-hover:bg-blue-100 group-hover:scale-110 flex items-center justify-center mb-3 transition-all duration-300 shadow-sm"
        >
          <span class="text-3xl text-blue-500 font-light">+</span>
        </div>
        <span
          class="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors"
          >Create New Note</span
        >
      </div>

      <!-- Note Cards -->
      <div
        v-for="note in filteredNotes"
        :key="note.id"
        @click="note.deletedAt ? undefined : openNote(note)"
        class="group cursor-pointer rounded-2xl p-5 transition-all duration-300 hover:shadow-xl border border-white/20 flex flex-col relative min-h-[260px] hover:-translate-y-1 shadow-sm"
        :class="[
          getCardColor(note),
          note.deletedAt
            ? 'opacity-60 grayscale hover:shadow-none hover:translate-y-0 bg-gray-50'
            : '',
        ]"
      >
        <!-- Pinned & Icon Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <span
              v-if="note.parsed.icon"
              class="text-2xl filter grayscale-[0.2] group-hover:grayscale-0 transition-all transform group-hover:scale-110 duration-300"
              >{{ note.parsed.icon }}</span
            >
          </div>
          <div class="flex items-center gap-1">
            <span
              v-if="note.parsed.pinned"
              class="text-amber-400 transform rotate-45 drop-shadow-sm text-lg"
              >📌</span
            >
          </div>
        </div>

        <!-- Supertags Badges -->
        <div
          class="flex flex-wrap gap-1.5 mb-3"
          v-if="getSupertags(note).length > 0"
        >
          <span
            v-for="supertag in getSupertags(note).slice(0, 3)"
            :key="supertag.name"
            :title="supertag.displayName"
            class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors"
          >
            <span class="mr-1">{{ supertag.icon }}</span>
          </span>
          <span
            v-if="getSupertags(note).length > 3"
            class="text-[10px] text-gray-400 self-center font-medium"
          >
            +{{ getSupertags(note).length - 3 }}
          </span>
        </div>

        <!-- Content -->
        <div class="flex-1 mb-4">
          <h3
            class="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors"
          >
            {{ note.parsed.title || "Untitled Note" }}
          </h3>
          <p
            class="text-sm text-gray-500 line-clamp-4 leading-relaxed font-normal"
          >
            {{ note.parsed.content || "No additional text..." }}
          </p>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50 group-hover:border-gray-100 transition-colors"
        >
          <div class="flex items-center gap-1.5 overflow-hidden">
            <span
              v-for="tag in (note.parsed.customTags || []).slice(0, 2)"
              :key="tag"
              class="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-medium whitespace-nowrap group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
            >
              #{{ tag }}
            </span>
            <span
              v-if="(note.parsed.customTags || []).length > 2"
              class="text-[10px] font-medium text-gray-400"
              >+{{ (note.parsed.customTags || []).length - 2 }}</span
            >
          </div>
          <span
            class="text-[10px] font-medium whitespace-nowrap ml-2 opacity-60 group-hover:opacity-100 transition-opacity"
            >{{ formatDate(note.updatedAt) }}</span
          >
        </div>

        <!-- Deleted note badge and countdown -->
        <div
          v-if="note.deletedAt"
          class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl z-10 backdrop-blur-sm transition-all"
        >
          <div class="text-sm font-bold text-red-600 mb-1">
            Pending Deletion
          </div>
          <div class="text-xs text-gray-500 mb-3">
            Deleting in {{ getPurgeCountdown(note.deletedAt) }}
          </div>
          <button
            @click.stop="restoreNote(note)"
            class="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Restore Note
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
      ></div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!isLoading && filteredNotes.length === 0"
      class="text-center py-20"
    >
      <div
        class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-sm"
      >
        <FileText class="w-10 h-10 text-gray-400" />
      </div>
      <h3 class="text-2xl font-semibold text-gray-900 mb-2">
        {{ searchQuery ? "No notes found" : "No notes yet" }}
      </h3>
      <p class="text-gray-600 mb-6">
        {{
          searchQuery
            ? "Try adjusting your search"
            : "Click the + button to create your first note"
        }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchNotes, db } from "@/db";
import { Search, FileText, Key, Bookmark } from "lucide-vue-next";
import { format } from "timeago.js";
import { supertagRegistry } from "@/supertags";

const router = useRouter();

// State
const searchQuery = ref("");
const selectedSupertag = ref(null);
const isLoading = ref(false);
const notes = ref([]);

// Get all available supertags
const availableSupertags = computed(() => supertagRegistry.getAllSupertags());

// Computed
// Show all notes, including deleted, but sort: pinned > not deleted > deleted, then by updatedAt
const filteredNotes = computed(() => {
  let filtered = notes.value;

  // Filter by supertag
  if (selectedSupertag.value) {
    filtered = filtered.filter((note) => {
      return note.parsed.tags && note.parsed.tags[selectedSupertag.value];
    });
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (note) =>
        note.parsed.title?.toLowerCase().includes(query) ||
        note.parsed.content?.toLowerCase().includes(query)
    );
  }

  return filtered.slice().sort((a, b) => {
    // Not deleted before deleted (most important - deleted notes always go to bottom)
    if (!a.deletedAt && b.deletedAt) return -1;
    if (a.deletedAt && !b.deletedAt) return 1;
    // Pinned notes come first (only among non-deleted notes)
    if (a.parsed.pinned && !b.parsed.pinned) return -1;
    if (!a.parsed.pinned && b.parsed.pinned) return 1;
    // Otherwise sort by updatedAt (newest first)
    return b.updatedAt - a.updatedAt;
  });
});

// Methods
const loadNotes = async () => {
  isLoading.value = true;
  try {
    const loadedNotes = await fetchNotes(1, "", "all");
    notes.value = loadedNotes;
  } catch (error) {
    console.error("Error loading notes:", error);
  } finally {
    isLoading.value = false;
  }
};

const startNewNote = () => {
  // Generate a random ID for new note
  const newNoteId =
    Date.now().toString(36) + Math.random().toString(36).substr(2);
  router.push(`/notes/${newNoteId}`);
};

// Expose startNewNote to parent via event
defineExpose({
  startNewNote,
});

const openNote = (note) => {
  router.push(`/notes/${note.id}`);
};

const formatDate = (timestamp) => {
  return format(timestamp);
};

// Color palette for note cards - vibrant modern colors
const cardColors = [
  "bg-gradient-to-br from-blue-50 to-blue-100",
  "bg-gradient-to-br from-purple-50 to-purple-100",
  "bg-gradient-to-br from-pink-50 to-pink-100",
  "bg-gradient-to-br from-green-50 to-green-100",
  "bg-gradient-to-br from-amber-50 to-amber-100",
  "bg-gradient-to-br from-cyan-50 to-cyan-100",
  "bg-gradient-to-br from-rose-50 to-rose-100",
  "bg-gradient-to-br from-indigo-50 to-indigo-100",
];

const getCardColor = (note) => {
  // Get sorted supertag names for consistent color assignment
  const supertags = getSupertags(note);
  const supertagNames = supertags
    .map((st) => st.name)
    .sort()
    .join(",");

  // If no supertags, use note ID as fallback
  const colorKey = supertagNames || note.id;

  // Use hash-based color for consistency
  const hash = colorKey.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colorIndex = Math.abs(hash) % cardColors.length;
  return cardColors[colorIndex];
};

// Get supertags with their metadata for a note
const getSupertags = (note) => {
  if (!note.parsed.tags) return [];

  const supertags = [];
  for (const [tagName, tagValue] of Object.entries(note.parsed.tags)) {
    const supertagDef = supertagRegistry.getSupertag(tagName);
    if (supertagDef && supertagDef.icon) {
      supertags.push({
        name: tagName,
        icon: supertagDef.icon,
        displayName: supertagDef.displayName,
        value: tagValue,
      });
    }
  }

  return supertags;
};

// Countdown for deleted notes
const getPurgeCountdown = (deletedAt) => {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const msLeft = Number(deletedAt) + SEVEN_DAYS - Date.now();
  if (msLeft <= 0) return "soon";
  const days = Math.floor(msLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  const mins = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
  return `${mins}m`;
};

// Restore deleted note
const restoreNote = async (note) => {
  await db.notes.update(note.id, { deletedAt: null, updatedAt: Date.now() });
  await loadNotes();
};

// Lifecycle
onMounted(() => {
  loadNotes();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
