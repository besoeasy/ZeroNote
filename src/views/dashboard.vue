<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300 dark:bg-slate-950 dark:text-slate-200">
    <!-- Ambient Glow effects -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-900/10"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-900/10"></div>
    </div>

    <!-- Main Container -->
    <div class="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col min-h-screen">
      
      <!-- Header / Command Center -->
      <header class="flex flex-col gap-8 mb-12">
        <!-- Top Bar -->
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
            ZERONOTE<span class="text-blue-500">.</span>
          </h1>
          <div class="flex items-center gap-4">
             <button 
                class="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all border border-transparent hover:border-slate-300 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 dark:hover:border-slate-800"
                @click="pinnedOnly = !pinnedOnly"
                :class="{'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/50': pinnedOnly}"
                title="Toggle Pinned"
             >
                <span class="font-bold">📌</span>
             </button>
             <button 
                class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
                @click="startNewNote"
             >
                <Plus class="w-4 h-4" />
                <span>Create</span>
             </button>
          </div>
        </div>

        <!-- Big Search Input -->
        <div class="relative group">
          <div class="absolute inset-0 bg-blue-500/10 rounded-2xl blur-lg transition-opacity opacity-0 group-focus-within:opacity-100 dark:bg-blue-500/20"></div>
          <div class="relative bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl flex items-center p-2 transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
             <Search class="w-6 h-6 text-slate-400 ml-4 mr-4 dark:text-slate-500" />
             <input 
                ref="searchInputRef"
                v-model="searchQuery"
                type="text" 
                placeholder="Search your mind..." 
                class="w-full bg-transparent border-none outline-none text-xl md:text-2xl font-medium placeholder-slate-400 py-3 text-slate-800 dark:text-white dark:placeholder-slate-600"
             />
             <div class="hidden md:flex items-center gap-3 pr-4">
                <span v-if="filteredNotes.length > 0" class="text-xs font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">
                   {{ filteredNotes.length }} RESULTS
                </span>
                <kbd class="hidden md:inline-block px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-400 dark:bg-slate-800 dark:border-slate-700">
                   /
                </kbd>
             </div>
          </div>
        </div>
      </header>

      <!-- Content Stream -->
      <main class="flex-1">
        <!-- Filters Row -->
        <div class="flex items-center gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
           <button 
              v-for="filter in quickFilters" 
              :key="filter.id"
               class="px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap"
               :class="filter.isActive() 
                  ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-500 dark:hover:border-slate-700 dark:hover:text-slate-300'"
               @click="filter.action"
            >
               {{ filter.label }}
            </button>
        </div>
        
        <!-- Supertag Cloud ("Channels") -->
        <div class="mb-8" v-if="filteredAvailableSupertags.length > 0">
           <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1 dark:text-slate-500">Channels</div>
           <div class="flex flex-wrap gap-2">
              <button
                 v-for="tag in filteredAvailableSupertags"
                 :key="tag.name"
                 @click="selectedSupertag = selectedSupertag === tag.name ? null : tag.name"
                  class="group px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2"
                  :class="selectedSupertag === tag.name
                     ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                     : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'"
               >
                 <span class="opacity-70 group-hover:opacity-100 transition-opacity">{{ tag.icon }}</span>
                 <span>{{ tag.displayName }}</span>
                 <span v-if="supertagCounts[tag.name]" class="ml-1 px-1.5 py-0.5 rounded bg-black/20 text-[10px]">
                    {{ supertagCounts[tag.name] }}
                 </span>
              </button>
           </div>
        </div>

        <!-- Notes List -->
        <div v-if="!isLoading && filteredNotes.length > 0" class="flex flex-col gap-4">
           <TransitionGroup name="list">
             <div 
               v-for="note in filteredNotes" 
               :key="note.id" 
               @click="openNote(note)"
                class="group relative flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer overflow-hidden dark:bg-slate-900/40 dark:border-slate-800/50 dark:hover:bg-slate-900/80 dark:hover:border-slate-700 dark:hover:shadow-noner"
                :class="{'opacity-70 grayscale hover:grayscale-0': note.deletedAt}"
              >
                 <!-- Selection Indicator -->
                 <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                      :class="{'bg-red-500': note.deletedAt}"
                 ></div>

                 <!-- Icon / Graphic -->
                 <div class="shrink-0">
                    <div 
                       class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-colors duration-500 dark:shadow-inner"
                       :style="{ backgroundColor: getCardAccentColor(note) + '15', color: getCardAccentColor(note) }"
                    >
                       {{ note.parsed.icon || '📄' }}
                    </div>
                 </div>

                 <!-- Content -->
                 <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <div class="flex items-center gap-3 mb-2">
                       <h3 class="text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors truncate dark:text-white dark:group-hover:text-blue-400">
                          {{ note.parsed.title || 'Untitled Draft' }}
                       </h3>
                       <span v-if="note.parsed.pinned" class="text-xs transform rotate-45">📌</span>
                    </div>
                    
                    <p class="text-slate-500 text-sm leading-relaxed line-clamp-2 md:line-clamp-1 mb-3 dark:text-slate-400">
                       {{ note.parsed.content || 'No content preview available...' }}
                    </p>

                    <!-- Metadata Footer -->
                    <div class="flex items-center gap-4 text-xs font-medium text-slate-400 group-hover:text-slate-500 transition-colors dark:text-slate-600 dark:group-hover:text-slate-500">
                       <span class="uppercase tracking-wider">{{ formatShortDate(note.updatedAt) }}</span>
                       
                       <div class="flex gap-2">
                          <span v-for="tag in (note.parsed.customTags || []).slice(0, 3)" :key="tag" class="text-blue-500/80 dark:text-blue-500/60">
                             #{{ tag }}
                          </span>
                       </div>
                    </div>
                    </div>


                 <!-- Deleted Indicator -->
                 <div v-if="note.deletedAt" class="absolute top-6 right-6 z-20">
                    <span class="px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-400">
                       Deleted
                    </span>
                 </div>

                 <!-- Action Arrow (Visible on Hover) -->
                 <div class="hidden md:flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 dark:text-slate-700">
                    <ArrowRight class="w-6 h-6" />
                 </div>
              </div>
           </TransitionGroup>
        </div>

        <!-- Empty State -->
         <div v-else-if="!isLoading" class="py-24 text-center">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 border border-slate-200 mb-6 animate-pulse dark:bg-slate-900/50 dark:border-slate-800">
               <Search class="w-8 h-8 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 class="text-xl font-bold text-slate-700 mb-2 dark:text-slate-300">Void.</h3>
            <p class="text-slate-500 max-w-xs mx-auto mb-8">No signals found matching your query.</p>
            <button @click="clearAllFilters" class="text-blue-500 text-sm font-bold hover:underline dark:text-blue-400">Reset Sensors</button>
         </div>

        <!-- Loading -->
        <div v-if="isLoading" class="py-32 flex justify-center">
           <div class="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { fetchNotes, db } from "@/db";
import { Search, Plus, ArrowRight } from "lucide-vue-next";
import { format } from "timeago.js";
import { supertagRegistry } from "@/supertags";

const router = useRouter();

// State
const searchQuery = ref("");
const selectedSupertag = ref(null);
const isLoading = ref(false);
const notes = ref([]);
const pinnedOnly = ref(false);
const filesOnly = ref(false); // Renamed from hasAttachmentsOnly for brevity in this view
const trashOnly = ref(false); 
const searchInputRef = ref(null);

// Reuse core logic
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
  const newNoteId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  router.push(`/notes/${newNoteId}/edit`);
};

const openNote = (note) => {
   router.push(`/notes/${note.id}`);
};

const formatShortDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Computed Filtering Logic
const filteredNotes = computed(() => {
  let filtered = notes.value;

  // By default we show everything, but filter if specific toggles are on
  if (trashOnly.value) {
     filtered = filtered.filter((note) => note.deletedAt);
  } else {
     // If not in trash mode, we still show deleted notes but we might want to hide them if "Pinned" or "Files" are selected? 
     // For now, let's keep them unless specifically filtered out by Pinned/Files logic which usually applies to active notes? 
     // Actually, let's just keep them in the stream as requested, but filtered down by other criteria.
  }

  if (pinnedOnly.value) filtered = filtered.filter((note) => !!note?.parsed?.pinned);
  if (filesOnly.value) filtered = filtered.filter((note) => (note?.attachments?.length || 0) > 0);
  
  if (selectedSupertag.value) {
    filtered = filtered.filter((note) => note.parsed.tags && note.parsed.tags[selectedSupertag.value]);
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
    // 1. Sort by Deleted status (Active first, Deleted last)
    if (a.deletedAt && !b.deletedAt) return 1;
    if (!a.deletedAt && b.deletedAt) return -1;
    
    // 2. Sort by Pinned (Pinned first)
    if (a.parsed.pinned && !b.parsed.pinned) return -1;
    if (!a.parsed.pinned && b.parsed.pinned) return 1;
    
    // 3. Sort by Date (Newest first)
    return b.updatedAt - a.updatedAt;
  });
});

const quickFilters = computed(() => [
   { id: 'all', label: 'All', isActive: () => !pinnedOnly.value && !filesOnly.value && !trashOnly.value, action: clearAllFilters },
   { id: 'files', label: 'Files', isActive: () => filesOnly.value, action: () => filesOnly.value = !filesOnly.value },
   { id: 'deleted', label: 'Trash Only', isActive: () => trashOnly.value, action: () => trashOnly.value = !trashOnly.value }
]);

const clearAllFilters = () => {
    searchQuery.value = "";
    pinnedOnly.value = false;
    filesOnly.value = false;
    trashOnly.value = false;
    selectedSupertag.value = null;
}

const accentColors = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"
];

const getCardAccentColor = (note) => {
  return accentColors[note.id.charCodeAt(0) % accentColors.length];
};

onMounted(() => {
  loadNotes();
  window.addEventListener("keydown", onGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKeydown);
});

const onGlobalKeydown = (e) => {
  if (e.key !== "/") return;
  const target = e.target;
  const tag = String(target?.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
  e.preventDefault();
  searchInputRef.value?.focus?.();
};
const availableSupertags = computed(() => supertagRegistry.getAllSupertags());

const supertagCounts = computed(() => {
  const counts = {};
  const base = notes.value;
  
  for (const note of base) {
    const tags = note?.parsed?.tags;
    if (!tags) continue;
    for (const tagName of Object.keys(tags)) {
      counts[tagName] = (counts[tagName] || 0) + 1;
    }
  }
  return counts;
});

const filteredAvailableSupertags = computed(() => {
  const counts = supertagCounts.value;
  return availableSupertags.value.filter((t) => (counts[t.name] || 0) > 0);
});

</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-active {
  position: absolute;
}
</style>
