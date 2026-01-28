<template>
  <!-- Notes Grid View -->
  <div class="w-full mx-auto p-2 md:p-8 pt-8 md:pt-8 relative min-h-screen">
    <!-- Ambient Background -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
    </div>
    <div class="w-full relative z-10">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Main Column -->
        <div class="flex-1 min-w-0">
          <!-- Command Bar (Sticky) -->
          <div class="sticky top-4 z-30 mb-6">
            <div class="relative group">
              <div class="absolute -inset-0.5 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500 bg-linear-to-r from-blue-900/20 via-indigo-900/20 to-slate-900/20 dark:from-blue-400/20 dark:via-indigo-400/20 dark:to-white/20"></div>
              <div class="relative bg-white/90 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-sm overflow-hidden dark:bg-slate-950/80 dark:border-slate-800">
                <div class="p-4 md:p-5">
                  <div class="flex flex-col md:flex-row md:items-center gap-3">
                    <!-- Search -->
                    <div class="relative flex-1">
                      <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 dark:text-slate-500" />
                      <input
                        ref="searchInputRef"
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search notes..."
                        class="w-full pl-12 pr-12 py-4 bg-white/60 rounded-2xl border border-blue-100/50 focus:bg-white focus:border-blue-950/20 focus:outline-none focus:ring-4 focus:ring-blue-900/5 text-slate-800 placeholder-slate-400 transition-all duration-300 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-blue-500/30 dark:focus:ring-blue-500/10 shadow-sm shadow-blue-900/5"
                      />
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 pointer-events-none">
                        <kbd class="px-1.5 py-0.5 text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 rounded dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500">/</kbd>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2">
                      <button
                        class="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-blue-950 text-white text-sm font-bold hover:bg-blue-900 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-blue-950/20 hover:shadow-blue-950/30 z-20"
                        @click="startNewNote"
                        title="New Note"
                      >
                        <Plus class="w-4 h-4 mr-2" />
                        New
                      </button>

                      <button
                        class="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-300 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900"
                        @click="isFiltersOpen = true"
                        title="Filters"
                      >
                        <SlidersHorizontal class="w-5 h-5 text-gray-600 dark:text-slate-300" />
                      </button>
                    </div>
                  </div>

                  <!-- Quick Chips -->
                  <div class="mt-4 flex flex-col md:flex-row md:items-center gap-3">
                    <div class="flex items-center gap-2 flex-wrap">
                      <button
                        class="px-3 py-1.5 rounded-full text-xs font-black transition-all duration-300"
                        :class="pinnedOnly ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'"
                        @click="pinnedOnly = !pinnedOnly"
                      >
                        📌 Pinned
                      </button>

                      <button
                        class="px-3 py-1.5 rounded-full text-xs font-black transition-all duration-300"
                        :class="hasAttachmentsOnly ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'"
                        @click="hasAttachmentsOnly = !hasAttachmentsOnly"
                      >
                        📎 Attachments
                      </button>

                      <button
                        class="px-3 py-1.5 rounded-full text-xs font-black transition-all duration-300"
                        :class="showDeleted ? 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800' : 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white'"
                        @click="showDeleted = !showDeleted"
                      >
                        {{ showDeleted ? '👁️ Deleted: ON' : '🙈 Deleted: OFF' }}
                      </button>

                      <button
                        v-if="hasAnyActiveFilters"
                        class="px-3 py-1.5 rounded-full text-xs font-black bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all duration-300 dark:bg-slate-950 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-900"
                        @click="clearAllFilters"
                      >
                        Clear all
                      </button>
                    </div>

                    <div class="md:ml-auto flex items-center gap-2">
                      <div class="text-xs font-black text-gray-500 uppercase tracking-wide dark:text-slate-400">Showing</div>
                      <div class="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-black shadow-lg shadow-gray-900/20">
                        {{ filteredNotes.length }}
                      </div>
                      <div class="text-xs text-gray-400 dark:text-slate-500">/ {{ notes.length }}</div>
                    </div>
                  </div>

                  <!-- Active Filter Summary -->
                  <div v-if="activeFilterChips.length" class="mt-3 flex items-center gap-2 flex-wrap">
                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest dark:text-slate-500">Active Filters</div>
                    <div
                      v-for="chip in activeFilterChips"
                      :key="chip.key"
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black bg-white border border-gray-200 text-gray-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
                    >
                      <span class="truncate max-w-55">{{ chip.label }}</span>
                      <button class="text-gray-400 hover:text-gray-900 transition-colors dark:hover:text-slate-100" @click="chip.onRemove" title="Remove">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                class="card-root group cursor-pointer relative min-h-70 w-full"
                :class="[
                  note.deletedAt ? 'opacity-60 grayscale card-deleted' : 'card-active',
                ]"
                :style="{ '--accent-color': getCardAccentColor(note) }"
              >
                <!-- Card Body -->
                <div class="card-body h-full flex flex-col relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 border border-slate-200/60 dark:bg-slate-950 dark:border-slate-800/60 group-hover:border-blue-500/30 dark:group-hover:border-blue-400/30 group-hover:shadow-2xl group-hover:shadow-blue-900/5">
                  
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
                        <div v-else class="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-(--accent-color) group-hover:bg-opacity-10 group-hover:text-(--accent-color) transition-all duration-300 dark:bg-slate-900 dark:text-slate-500">
                          <FileText class="w-5 h-5" />
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-2">
                        <div v-if="note.parsed.pinned" class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shadow-inner dark:bg-amber-500/10">
                          <span class="text-amber-400 text-sm transform rotate-45">📌</span>
                        </div>
                      </div>
                    </div>

                    <!-- Title -->
                    <h3 class="text-lg font-bold text-gray-800 mb-2 leading-snug group-hover:text-(--accent-color) transition-colors duration-300 line-clamp-2 dark:text-slate-200">
                      {{ note.parsed.title || "Untitled Note" }}
                    </h3>

                    <!-- Content Preview -->
                    <p class="text-[13px] text-gray-500 leading-relaxed line-clamp-3 mb-5 font-medium opacity-80 dark:text-slate-400 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors">
                      {{ note.parsed.content || "No additional text..." }}
                    </p>

                    <!-- Footer -->
                    <div class="mt-auto flex items-end justify-between">
                      <!-- Tags -->
                      <div class="flex flex-wrap gap-1.5 max-w-[70%]">
                        <span 
                          v-for="tag in (note.parsed.customTags || []).slice(0, 2)"
                          :key="tag"
                          class="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-bold group-hover:bg-(--accent-color) group-hover:text-white transition-colors duration-300 dark:bg-slate-900 dark:text-slate-400"
                        >
                          #{{ tag }}
                        </span>
                        <span v-if="(note.parsed.customTags || []).length > 2" class="text-[10px] text-gray-400 py-1 font-bold dark:text-slate-500">+{{ (note.parsed.customTags || []).length - 2 }}</span>
                      </div>
                      
                      <!-- Date -->
                      <span class="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-gray-400 transition-colors dark:text-slate-600 dark:group-hover:text-slate-500">
                        {{ formatShortDate(note.updatedAt) }}
                      </span>
                    </div>
                  </div>

                  <!-- Absolute Supertags (Bottom Left) -->
                  <div
                    v-if="getSupertags(note).length > 0"
                    class="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-white via-white to-transparent pointer-events-none z-0 dark:from-slate-950 dark:via-slate-950"
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
                  class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-3xl z-30 backdrop-blur-sm border-2 border-dashed border-red-100 dark:bg-slate-950/80 dark:border-red-500/30"
                >
                  <div class="text-sm font-black text-red-500 mb-1 uppercase tracking-wide">Pending Deletion</div>
                  <div class="text-xs text-gray-500 mb-4 font-medium dark:text-slate-400">Deleted {{ formatDate(note.updatedAt) }}</div>
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
              class="inline-flex items-center justify-center w-24 h-24 bg-linear-to-tr from-blue-50 to-slate-100 rounded-full mb-6 shadow-xl shadow-blue-900/5 animate-float dark:bg-slate-800/50 dark:shadow-slate-900/50 border border-white dark:border-slate-700/50"
            >
              <FileText class="w-10 h-10 text-gray-300/80 dark:text-slate-600" />
            </div>
            <h3 class="text-2xl font-bold text-gray-400 mb-2 dark:text-slate-500">
              {{ searchQuery ? "No matches found" : "No notes yet" }}
            </h3>
            <p class="text-gray-300 max-w-xs mx-auto text-sm dark:text-slate-600">
              {{
                searchQuery
                  ? "Try searching for something else..."
                  : "Your collection is waiting for its first story."
              }}
            </p>
          </div>
        </div>

        <!-- Right Sidebar (Desktop) -->
        <aside class="hidden lg:block w-full lg:w-80 xl:w-96 shrink-0">
          <div class="sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto pr-1">
            <div class="relative group">
              <div class="absolute -inset-0.5 rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-500 bg-linear-to-br from-blue-900/10 via-slate-900/10 to-transparent dark:from-blue-900/20 dark:via-slate-900/20 dark:to-transparent"></div>
              <div class="relative bg-white/50 backdrop-blur-md border border-white/40 rounded-3xl shadow-sm overflow-hidden dark:bg-slate-950/50 dark:border-slate-800/50">
                <div class="p-6 border-b border-gray-100 dark:border-slate-800">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-xs font-black text-gray-500 uppercase tracking-wide dark:text-slate-400">Supertag Filters</div>
                      <div class="text-sm font-bold text-gray-900 mt-1 dark:text-slate-100">Narrow your dashboard</div>
                      <div class="text-xs text-gray-500 mt-1 dark:text-slate-400">Search tags, toggle quick filters.</div>
                    </div>
                    <button
                      v-if="selectedSupertag"
                      @click="selectedSupertag = null"
                      class="shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div class="p-5">
                  <!-- Quick toggles -->
                  <div class="grid grid-cols-3 gap-2 mb-4">
                    <button
                      class="px-3 py-2 rounded-2xl text-xs font-black transition-all duration-300"
                      :class="pinnedOnly ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'"
                      @click="pinnedOnly = !pinnedOnly"
                    >
                      📌 Pinned
                    </button>
                    <button
                      class="px-3 py-2 rounded-2xl text-xs font-black transition-all duration-300"
                      :class="hasAttachmentsOnly ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'"
                      @click="hasAttachmentsOnly = !hasAttachmentsOnly"
                    >
                      📎 Files
                    </button>
                    <button
                      class="px-3 py-2 rounded-2xl text-xs font-black transition-all duration-300"
                      :class="showDeleted ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800' : 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white'"
                      @click="showDeleted = !showDeleted"
                    >
                      {{ showDeleted ? '👁️ Del' : '🙈 Del' }}
                    </button>
                  </div>

                  <!-- Tag search -->
                  <div class="relative mb-4">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input
                      v-model="tagSearchQuery"
                      type="text"
                      placeholder="Search supertags..."
                      class="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 text-sm dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-slate-600 dark:bg-slate-950"
                    />
                  </div>

                  <div class="space-y-2">
                    <button
                      @click="selectedSupertag = null"
                      class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300"
                      :class="
                        selectedSupertag === null
                          ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'
                      "
                    >
                      <span class="flex items-center gap-2">
                        <span class="text-base">✨</span>
                        <span>All Notes</span>
                      </span>
                      <span class="text-xs font-black" :class="selectedSupertag === null ? 'text-white/80' : 'text-gray-400'">{{ notes.length }}</span>
                    </button>

                    <button
                      v-for="tag in filteredAvailableSupertags"
                      :key="tag.name"
                      @click="selectedSupertag = tag.name"
                      class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300"
                      :class="
                        selectedSupertag === tag.name
                          ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'
                      "
                    >
                      <span class="flex items-center gap-2 min-w-0">
                        <span class="text-base">{{ tag.icon }}</span>
                        <span class="truncate">{{ tag.displayName }}</span>
                      </span>
                      <span class="text-xs font-black" :class="selectedSupertag === tag.name ? 'text-white/80' : 'text-gray-400'">
                        {{ supertagCounts[tag.name] || 0 }}
                      </span>
                    </button>

                    <div v-if="!filteredAvailableSupertags.length" class="px-4 py-6 text-center">
                      <div class="text-sm font-black text-gray-400 dark:text-slate-500">No tags found</div>
                      <div class="text-xs text-gray-400 mt-1 dark:text-slate-500">Try a different search.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Mobile Filters Drawer -->
    <div v-if="isFiltersOpen" class="fixed inset-0 z-40 lg:hidden">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="isFiltersOpen = false"></div>
      <div
        class="absolute right-0 top-0 h-full w-[92%] max-w-sm bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 dark:bg-slate-950 dark:border-slate-800"
      >
        <div class="p-5 border-b border-gray-100 flex items-center justify-between dark:border-slate-800">
          <div>
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide dark:text-slate-400">Supertag Filters</div>
            <div class="text-sm font-bold text-gray-900 mt-1 dark:text-slate-100">Filter notes</div>
          </div>
          <button
            class="w-10 h-10 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-100"
            @click="isFiltersOpen = false"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div class="p-4 overflow-auto h-[calc(100vh-72px)]">
          <div class="grid grid-cols-3 gap-2 mb-4">
            <button
              class="px-3 py-2 rounded-2xl text-xs font-black transition-all duration-300"
              :class="pinnedOnly ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'"
              @click="pinnedOnly = !pinnedOnly"
            >
              📌 Pinned
            </button>
            <button
              class="px-3 py-2 rounded-2xl text-xs font-black transition-all duration-300"
              :class="hasAttachmentsOnly ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'"
              @click="hasAttachmentsOnly = !hasAttachmentsOnly"
            >
              📎 Files
            </button>
            <button
              class="px-3 py-2 rounded-2xl text-xs font-black transition-all duration-300"
              :class="showDeleted ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800' : 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white'"
              @click="showDeleted = !showDeleted"
            >
              {{ showDeleted ? '👁️ Del' : '🙈 Del' }}
            </button>
          </div>

          <div class="relative mb-4">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              v-model="tagSearchQuery"
              type="text"
              placeholder="Search supertags..."
              class="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 text-sm dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-slate-600 dark:bg-slate-950"
            />
          </div>

          <div class="space-y-2">
            <button
              @click="selectedSupertag = null; isFiltersOpen = false"
              class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300"
              :class="
                selectedSupertag === null
                  ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'
              "
            >
              <span class="flex items-center gap-2">
                <span class="text-base">✨</span>
                <span>All Notes</span>
              </span>
              <span class="text-xs font-black" :class="selectedSupertag === null ? 'text-white/80' : 'text-gray-400'">{{ notes.length }}</span>
            </button>

            <button
              v-for="tag in filteredAvailableSupertags"
              :key="tag.name"
              @click="selectedSupertag = tag.name; isFiltersOpen = false"
              class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300"
              :class="
                selectedSupertag === tag.name
                  ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/25 dark:bg-blue-600 dark:text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:border-slate-800'
              "
            >
              <span class="flex items-center gap-2 min-w-0">
                <span class="text-base">{{ tag.icon }}</span>
                <span class="truncate">{{ tag.displayName }}</span>
              </span>
              <span class="text-xs font-black" :class="selectedSupertag === tag.name ? 'text-white/80' : 'text-gray-400'">
                {{ supertagCounts[tag.name] || 0 }}
              </span>
            </button>

            <div v-if="!filteredAvailableSupertags.length" class="px-4 py-6 text-center">
              <div class="text-sm font-black text-gray-400 dark:text-slate-500">No tags found</div>
              <div class="text-xs text-gray-400 mt-1 dark:text-slate-500">Try a different search.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { fetchNotes, db } from "@/db";
import { Search, FileText, SlidersHorizontal, Plus } from "lucide-vue-next";
import { format } from "timeago.js";
import { supertagRegistry } from "@/supertags";

const router = useRouter();

// State
const searchQuery = ref("");
const selectedSupertag = ref(null);
const isLoading = ref(false);
const notes = ref([]);
const isFiltersOpen = ref(false);
const pinnedOnly = ref(false);
const hasAttachmentsOnly = ref(false);
const showDeleted = ref(true);
const tagSearchQuery = ref("");
const searchInputRef = ref(null);

// Get all available supertags
const availableSupertags = computed(() => supertagRegistry.getAllSupertags());

const filteredAvailableSupertags = computed(() => {
  const q = tagSearchQuery.value.trim().toLowerCase();
  if (!q) return availableSupertags.value;
  return availableSupertags.value.filter((t) => {
    const name = String(t?.name || "").toLowerCase();
    const display = String(t?.displayName || "").toLowerCase();
    return name.includes(q) || display.includes(q);
  });
});

const hasAnyActiveFilters = computed(() => {
  return Boolean(
    searchQuery.value.trim() ||
      selectedSupertag.value ||
      pinnedOnly.value ||
      hasAttachmentsOnly.value ||
      !showDeleted.value
  );
});

const clearAllFilters = () => {
  searchQuery.value = "";
  selectedSupertag.value = null;
  pinnedOnly.value = false;
  hasAttachmentsOnly.value = false;
  showDeleted.value = true;
  tagSearchQuery.value = "";
};

const supertagCounts = computed(() => {
  const counts = {};
  const base = notes.value
    .filter((n) => (showDeleted.value ? true : !n.deletedAt))
    .filter((n) => (pinnedOnly.value ? !!n?.parsed?.pinned : true))
    .filter((n) => (hasAttachmentsOnly.value ? (n?.attachments?.length || 0) > 0 : true));

  for (const note of base) {
    const tags = note?.parsed?.tags;
    if (!tags) continue;
    for (const tagName of Object.keys(tags)) {
      counts[tagName] = (counts[tagName] || 0) + 1;
    }
  }
  return counts;
});

// Computed
const filteredNotes = computed(() => {
  let filtered = notes.value;

  if (!showDeleted.value) {
    filtered = filtered.filter((note) => !note.deletedAt);
  }

  if (pinnedOnly.value) {
    filtered = filtered.filter((note) => !!note?.parsed?.pinned);
  }

  if (hasAttachmentsOnly.value) {
    filtered = filtered.filter((note) => (note?.attachments?.length || 0) > 0);
  }

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

const activeFilterChips = computed(() => {
  const chips = [];

  if (selectedSupertag.value) {
    const tag = availableSupertags.value.find((t) => t.name === selectedSupertag.value);
    chips.push({
      key: "supertag",
      label: tag ? `${tag.icon} ${tag.displayName}` : `#@${selectedSupertag.value}`,
      onRemove: () => (selectedSupertag.value = null),
    });
  }

  if (searchQuery.value.trim()) {
    chips.push({
      key: "search",
      label: `Search: ${searchQuery.value.trim()}`,
      onRemove: () => (searchQuery.value = ""),
    });
  }

  if (pinnedOnly.value) {
    chips.push({ key: "pinned", label: "📌 Pinned only", onRemove: () => (pinnedOnly.value = false) });
  }

  if (hasAttachmentsOnly.value) {
    chips.push({ key: "att", label: "📎 Has attachments", onRemove: () => (hasAttachmentsOnly.value = false) });
  }

  if (!showDeleted.value) {
    chips.push({ key: "deleted", label: "🙈 Deleted hidden", onRemove: () => (showDeleted.value = true) });
  }

  return chips;
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
  router.push(`/notes/${newNoteId}/edit`);
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

const onGlobalKeydown = (e) => {
  if (e.key !== "/") return;
  const target = e.target;
  const tag = String(target?.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
  e.preventDefault();
  searchInputRef.value?.focus?.();
};

onMounted(() => {
  window.addEventListener("keydown", onGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKeydown);
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
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  line-clamp: 3;
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
