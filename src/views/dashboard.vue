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
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 pb-20"
    >
      <!-- Note Cards -->
      <div
        v-for="note in filteredNotes"
        :key="note.id"
        @click="note.deletedAt ? undefined : openNote(note)"
        class="card-interactive group cursor-pointer rounded-2xl p-5 flex flex-col relative min-h-[260px] bg-white overflow-hidden"
        :class="[
          note.deletedAt ? 'opacity-60 grayscale card-deleted' : 'card-active',
        ]"
        :style="
          note.deletedAt ? '' : { '--accent-color': getCardAccentColor(note) }
        "
      >
        <!-- Glow Effect on Hover -->
        <div
          v-if="!note.deletedAt"
          class="card-glow absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          :style="{
            background: `linear-gradient(135deg, ${getCardAccentColor(
              note
            )}40, ${getCardAccentColor(note)}10)`,
          }"
        ></div>

        <!-- Card Border -->
        <div
          v-if="!note.deletedAt"
          class="absolute inset-0 rounded-2xl border-2 border-gray-100 group-hover:border-gray-200 transition-colors duration-300 pointer-events-none"
          :style="{
            borderLeftColor: getCardAccentColor(note),
            borderLeftWidth: '4px',
          }"
        ></div>

        <!-- Content Container -->
        <div class="relative z-10 flex flex-col h-full">
          <!-- Pinned & Icon Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <span
                v-if="note.parsed.icon"
                class="icon-bounce text-2xl md:text-3xl filter grayscale-[0.3] group-hover:grayscale-0 transition-all duration-300"
                >{{ note.parsed.icon }}</span
              >
            </div>
            <div class="flex items-center gap-1">
              <span
                v-if="note.parsed.pinned"
                class="pin-wiggle text-amber-400 transform rotate-45 drop-shadow-sm text-lg md:text-xl"
                >📌</span
              >
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 mb-4">
            <h3
              class="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-300"
            >
              {{ note.parsed.title || "Untitled Note" }}
            </h3>
            <p
              class="text-sm text-gray-500 line-clamp-3 md:line-clamp-4 leading-relaxed font-normal"
            >
              {{ note.parsed.content || "No additional text..." }}
            </p>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 gap-2"
            :class="{ 'pl-20 sm:pl-24': getSupertags(note).length > 0 }"
          >
            <div
              class="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0"
            >
              <span
                v-for="tag in (note.parsed.customTags || []).slice(0, 2)"
                :key="tag"
                class="tag-pill px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-medium whitespace-nowrap"
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
              class="text-[10px] font-medium whitespace-nowrap text-gray-600 flex-shrink-0"
              >{{ formatDate(note.updatedAt) }}</span
            >
          </div>

          <!-- Supertags Badges - Bottom Left Corner -->
          <div
            v-if="getSupertags(note).length > 0"
            class="supertag-badge absolute bottom-0 left-0 flex flex-wrap gap-1 p-2 rounded-tr-xl rounded-bl-2xl shadow-sm max-w-[65%] sm:max-w-[70%]"
            :style="{ backgroundColor: `${getCardAccentColor(note)}15` }"
          >
            <span
              v-for="supertag in getSupertags(note).slice(0, 4)"
              :key="supertag.name"
              :title="supertag.displayName"
              class="inline-flex items-center text-sm md:text-base transform group-hover:scale-110 transition-transform duration-200"
            >
              {{ supertag.icon }}
            </span>
            <span
              v-if="getSupertags(note).length > 4"
              class="text-[10px] self-center font-semibold"
              :style="{ color: getCardAccentColor(note) }"
            >
              +{{ getSupertags(note).length - 4 }}
            </span>
          </div>
        </div>

        <!-- Deleted note badge and countdown -->
        <div
          v-if="note.deletedAt"
          class="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl z-20 backdrop-blur-sm transition-all"
        >
          <div class="text-sm font-bold text-red-600 mb-1">
            Pending Deletion
          </div>
          <div class="text-xs text-gray-500 mb-3">
            Deleting in {{ getPurgeCountdown(note.deletedAt) }}
          </div>
          <button
            @click.stop="restoreNote(note)"
            class="restore-button px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all shadow-lg"
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

// Color palette for note cards - vibrant accent colors
const accentColors = [
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#10b981", // emerald
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#d946ef", // fuchsia
  "#14b8a6", // teal
  "#a855f7", // purple
  "#84cc16", // lime
  "#f43f5e", // rose
  "#6366f1", // indigo
];

const getCardAccentColor = (note) => {
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

  const colorIndex = Math.abs(hash) % accentColors.length;
  return accentColors[colorIndex];
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
/* Line Clamp Utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
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

/* Card Micro-Interactions */
.card-interactive {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  will-change: transform, box-shadow;
}

.card-active {
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
}

/* Desktop Hover Effects */
@media (hover: hover) and (pointer: fine) {
  .card-active:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02),
      0 0 30px var(--accent-color, #3b82f6) 20;
  }

  .card-active:active {
    transform: translateY(-4px) scale(1.01);
    transition-duration: 0.1s;
  }
}

/* Mobile Touch Effects */
@media (hover: none) and (pointer: coarse) {
  .card-active:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition-duration: 0.1s;
  }
}

/* Deleted Card State */
.card-deleted {
  background: #f9fafb;
  cursor: not-allowed;
}

.card-deleted:hover {
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Glow Effect */
.card-glow {
  filter: blur(20px);
  z-index: 0;
}

/* Icon Bounce Animation */
@media (hover: hover) and (pointer: fine) {
  .icon-bounce {
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .card-active:hover .icon-bounce {
    transform: scale(1.2) rotate(5deg);
    filter: grayscale(0) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
}

/* Pin Wiggle Animation */
@media (hover: hover) and (pointer: fine) {
  .pin-wiggle {
    transition: all 0.3s ease;
  }

  .card-active:hover .pin-wiggle {
    animation: wiggle 0.5s ease-in-out;
  }
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(45deg);
  }
  25% {
    transform: rotate(50deg);
  }
  75% {
    transform: rotate(40deg);
  }
}

/* Tag Pills with Hover Effect */
.tag-pill {
  transition: all 0.2s ease;
}

@media (hover: hover) and (pointer: fine) {
  .card-active:hover .tag-pill {
    background: #dbeafe;
    color: #2563eb;
    transform: translateY(-1px);
  }
}

/* Supertag Badge Animations */
.supertag-badge {
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

@media (hover: hover) and (pointer: fine) {
  .card-active:hover .supertag-badge {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

/* Restore Button */
.restore-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (hover: hover) and (pointer: fine) {
  .restore-button:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  .restore-button:active {
    transform: translateY(0) scale(1);
  }
}

@media (hover: none) and (pointer: coarse) {
  .restore-button:active {
    transform: scale(0.95);
  }
}

/* Smooth Scrolling */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}

/* Reduce Motion for Accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Mobile Optimizations */
@media (max-width: 640px) {
  .card-interactive {
    min-height: 240px;
  }

  /* Improve touch targets */
  .tag-pill {
    min-height: 24px;
    display: inline-flex;
    align-items: center;
  }
}

/* Tablet Optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  .card-interactive {
    min-height: 250px;
  }
}

/* Performance Optimization - GPU Acceleration */
.card-interactive,
.card-glow,
.icon-bounce,
.pin-wiggle,
.tag-pill,
.supertag-badge {
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
}
</style>
