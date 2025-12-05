<template>
  <!-- Notes Grid View -->
  <div class="w-full mx-auto p-2 md:p-8 pt-8 md:pt-8">
    <!-- Search Bar -->
    <div class="mb-8 relative max-w-2xl mx-auto z-20">
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
    <div class="mb-8 z-10 relative">
      <div class="flex items-center justify-center gap-2 flex-wrap">
        <button
          @click="selectedSupertag = null"
          :class="
            selectedSupertag === null
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm border border-gray-100'
          "
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap"
        >
          All Notes
        </button>
        <button
          v-for="tag in availableSupertags"
          :key="tag.name"
          @click="selectedSupertag = tag.name"
          :class="
            selectedSupertag === tag.name
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm border border-gray-100'
          "
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-1.5"
        >
          <span>{{ tag.icon }}</span>
          <span>{{ tag.displayName }}</span>
        </button>
      </div>
    </div>

    <!-- Notes Grid -->
    <div v-if="!isLoading" class="pb-20">
      <TransitionGroup
        name="staggered-list"
        tag="div"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
      >
        <!-- Note Cards -->
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          @click="note.deletedAt ? undefined : openNote(note)"
          class="card-root group cursor-pointer relative min-h-[280px] w-full"
          :class="[
            note.deletedAt ? 'opacity-60 grayscale card-deleted' : 'card-active',
          ]"
          :style="{ '--accent-color': getCardAccentColor(note) }"
        >
          <!-- Card Body -->
          <div class="card-body h-full flex flex-col relative bg-white rounded-3xl overflow-hidden transition-all duration-500 border border-gray-100">
            
            <!-- Top Gradient Accent -->
            <div 
              class="h-1.5 w-full absolute top-0 left-0 right-0 z-10 opacity-80"
              :style="{ background: `linear-gradient(90deg, ${getCardAccentColor(note)}, ${getCardAccentColor(note)}88)` }"
            ></div>

            <!-- Content Container -->
            <div class="p-6 flex flex-col h-full relative z-10">
              
              <!-- Header: Icon & Toolbar -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span
                    v-if="note.parsed.icon"
                    class="text-4xl filter drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                   >
                    {{ note.parsed.icon }}
                  </span>
                  <!-- Fallback Icon if no user icon -->
                  <div v-else class="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[var(--accent-color)] group-hover:bg-opacity-10 group-hover:text-[var(--accent-color)] transition-all duration-300">
                     <FileText class="w-5 h-5" />
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                   <div v-if="note.parsed.pinned" class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shadow-inner">
                      <span class="text-amber-400 text-sm transform rotate-45">📌</span>
                   </div>
                </div>
              </div>

              <!-- Title -->
              <h3 class="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[var(--accent-color)] transition-colors duration-300 line-clamp-2">
                {{ note.parsed.title || "Untitled Note" }}
              </h3>

              <!-- Content Preview -->
              <p class="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6 font-medium opacity-90">
                {{ note.parsed.content || "No additional text..." }}
              </p>

              <!-- Footer -->
              <div class="mt-auto flex items-end justify-between">
                <!-- Tags -->
                <div class="flex flex-wrap gap-1.5 max-w-[70%]">
                   <span 
                      v-for="tag in (note.parsed.customTags || []).slice(0, 2)"
                      :key="tag"
                      class="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-bold group-hover:bg-[var(--accent-color)] group-hover:text-white transition-colors duration-300"
                   >
                      #{{ tag }}
                   </span>
                   <span v-if="(note.parsed.customTags || []).length > 2" class="text-[10px] text-gray-400 py-1 font-bold">+{{ (note.parsed.customTags || []).length - 2 }}</span>
                </div>
                
                <!-- Date -->
                <span class="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                  {{ formatShortDate(note.updatedAt) }}
                </span>
              </div>
            </div>

            <!-- Absolute Supertags (Bottom Left) -->
             <div
                v-if="getSupertags(note).length > 0"
                class="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-0"
             ></div>
          </div>
          
          <!-- Hover Glow/Shadow Effect -->
          <div 
            class="absolute -inset-0.5 rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
            :style="{ background: `linear-gradient(135deg, ${getCardAccentColor(note)}66, transparent 60%)` }"
          ></div>
          
           <!-- Deleted Overlay -->
           <div
            v-if="note.deletedAt"
            class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-3xl z-30 backdrop-blur-sm border-2 border-dashed border-red-100"
          >
            <div class="text-sm font-black text-red-500 mb-1 uppercase tracking-wide">Pending Deletion</div>
            <div class="text-xs text-gray-500 mb-4 font-medium">Deleted {{ formatDate(note.updatedAt) }}</div>
            <button
              @click.stop="restoreNote(note)"
              class="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/20"
            >
              Restore Note
            </button>
          </div>

        </div>
      </TransitionGroup>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-32">
       <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          <div class="absolute inset-0 rounded-full border-4 border-gray-900 border-t-transparent animate-spin"></div>
       </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!isLoading && filteredNotes.length === 0"
      class="text-center py-32 animate-fade-in"
    >
      <div
        class="inline-flex items-center justify-center w-24 h-24 bg-gray-50/50 rounded-full mb-6 shadow-lg shadow-gray-100 animate-float"
      >
        <FileText class="w-10 h-10 text-gray-300/80" />
      </div>
      <h3 class="text-2xl font-bold text-gray-400 mb-2">
        {{ searchQuery ? "No matches found" : "No notes yet" }}
      </h3>
      <p class="text-gray-300 max-w-xs mx-auto text-sm">
        {{
          searchQuery
            ? "Try searching for something else..."
            : "Your collection is waiting for its first story."
        }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchNotes, db } from "@/db";
import { Search, FileText } from "lucide-vue-next";
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
const filteredNotes = computed(() => {
  let filtered = notes.value;

  if (selectedSupertag.value) {
    filtered = filtered.filter((note) => {
      return note.parsed.tags && note.parsed.tags[selectedSupertag.value];
    });
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (note) =>
        note.parsed.title?.toLowerCase().includes(query) ||
        note.parsed.content?.toLowerCase().includes(query)
    );
  }

  return filtered.slice().sort((a, b) => {
    if (!a.deletedAt && b.deletedAt) return -1;
    if (a.deletedAt && !b.deletedAt) return 1;
    if (a.parsed.pinned && !b.parsed.pinned) return -1;
    if (!a.parsed.pinned && b.parsed.pinned) return 1;
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
  const newNoteId =
    Date.now().toString(36) + Math.random().toString(36).substr(2);
  router.push(`/notes/${newNoteId}`);
};

defineExpose({
  startNewNote,
});

const openNote = (note) => {
  router.push(`/notes/${note.id}`);
};

const formatDate = (timestamp) => {
  return format(timestamp);
};

const formatShortDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Modern vibrant palette
const accentColors = [
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#06b6d4", // cyan-500
  "#d946ef", // fuchsia-500
  "#f43f5e", // rose-500
];

const getCardAccentColor = (note) => {
  const supertags = getSupertags(note);
  const colorKey = supertags.map((st) => st.name).sort().join(",") || note.id;
  
  let hash = 0;
  for (let i = 0; i < colorKey.length; i++) {
    hash = colorKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % accentColors.length;
  return accentColors[colorIndex];
};

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

const restoreNote = async (note) => {
  await db.notes.update(note.id, { deletedAt: null, updatedAt: Date.now() });
  await loadNotes();
};

onMounted(() => {
  loadNotes();
});
</script>

<style scoped>
/* Staggered List Transitions */
.staggered-list-enter-active,
.staggered-list-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.staggered-list-enter-from,
.staggered-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.staggered-list-leave-active {
  position: absolute;
}

/* Card Root Interactions */
.card-root {
  perspective: 1000px;
}

.card-body {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 2px 4px -1px rgba(0, 0, 0, 0.02);
  will-change: transform, box-shadow;
}

/* Hover State */
@media (hover: hover) {
  .card-active:hover .card-body {
    transform: translateY(-8px);
    box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.05), 
        0 10px 10px -5px rgba(0, 0, 0, 0.01);
  }
  
  .card-active:active .card-body {
    transform: translateY(-4px) scale(0.99);
  }
}

/* Typography Line Clamps */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Fade In Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

/* Float Animation */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
