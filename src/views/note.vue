<template>
  <!-- Loading State -->
  <div v-if="!isLoaded" class="flex items-center justify-center h-full">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>

  <!-- Note Not Found -->
  <div v-else-if="!note" class="flex flex-col items-center justify-center h-full p-8">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2 dark:text-slate-100">Note not found</h2>
      <p class="text-gray-600 mb-6 dark:text-slate-300">This note doesn't exist or has been deleted.</p>
      <router-link to="/dashboard" class="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
        Back to Dashboard
      </router-link>
    </div>
  </div>

  <div v-else class="h-full flex flex-col bg-white dark:bg-slate-950">
    <!-- Content -->
    <div class="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950">
      <div class="mx-auto p-6 md:p-12">
        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Tags & Metadata -->
          <div class="lg:col-span-1 space-y-4">
            <!-- Render all tags in order -->
            <template v-for="(tag, index) in parsed?.allTags" :key="`${tag.key}-${index}`">
              <!-- Dynamic supertag component rendering -->
              <component :is="getSupertagComponent(tag.key)" v-if="getSupertagComponent(tag.key)" :value="tag.value" :parsed="parsed" />
            </template>

            <!-- Attachments -->
            <ParseAttachments v-if="note.attachments?.length" :attachments="note.attachments" />

            <!-- References -->
            <ParseReferences v-if="parsed?.references?.length" :references="parsed.references" />
          </div>

          <!-- Right Column - Content -->
          <div class="lg:col-span-2">
            <div data-share-exclude class="flex items-center justify-between shrink-0 mb-6">
              <div class="text-sm text-gray-500 dark:text-slate-400">
                Updated {{ formatDate(note.updatedAt) }}
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="openShareModal"
                  :disabled="isSharing"
                  class="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                  title="Share (encrypted) via IPFS"
                >
                  <Share2 class="w-4 h-4" :class="isSharing ? 'animate-pulse' : ''" />
                  <span class="hidden md:inline">{{ isSharing ? "Sharing..." : "Share" }}</span>
                </button>
                <router-link
                  :to="`/notes/${noteId}/edit`"
                  class="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <Edit class="w-4 h-4" />
                  <span class="hidden md:inline">Edit Note</span>
                </router-link>
                <button
                  @click="handleDelete"
                  class="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md dark:text-red-300 dark:bg-red-950/30 dark:border-red-500/30 dark:hover:bg-red-500/20"
                  title="Delete Note"
                >
                  <Trash2 class="w-4 h-4" />
                  <span class="hidden md:inline">Delete</span>
                </button>
              </div>
            </div>

            <!-- Share Modal -->
            <div v-if="isShareModalOpen" data-share-exclude class="fixed inset-0 z-40">
              <div class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" @click="closeShareModal"></div>
              <div class="absolute inset-0 flex items-center justify-center p-4">
                <div class="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 dark:bg-slate-950 dark:border-slate-800">
                  <div class="p-6 border-b border-gray-200 bg-linear-to-br from-gray-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                    <div class="flex items-start justify-between gap-4">
                      <div class="min-w-0">
                        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-slate-400">Encrypted Share</div>
                        <div class="text-xl font-black text-gray-900 mt-1 truncate dark:text-slate-100">Share this note</div>
                        <div class="text-sm text-gray-600 mt-1 dark:text-slate-300">Uploads an encrypted blob to IPFS and generates a ZeroNote link.</div>
                      </div>
                      <button class="shrink-0 w-10 h-10 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900" @click="closeShareModal" title="Close">
                        ✕
                      </button>
                    </div>
                  </div>

                  <div class="p-6">
                    <!-- Stepper -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div class="p-4 rounded-2xl border" :class="shareStepClass('encrypt')">
                        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-slate-400">Step 1</div>
                        <div class="mt-1 text-sm font-bold text-gray-900 dark:text-slate-100">Encrypt</div>
                      </div>
                      <div class="p-4 rounded-2xl border" :class="shareStepClass('attachments')">
                        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-slate-400">Step 2</div>
                        <div class="mt-1 text-sm font-bold text-gray-900 dark:text-slate-100">Upload attachments</div>
                        <div v-if="shareProgress.totalAttachments" class="mt-1 text-xs text-gray-600 dark:text-slate-400">
                          {{ shareProgress.uploadedAttachments }}/{{ shareProgress.totalAttachments }} uploaded
                        </div>
                      </div>
                      <div class="p-4 rounded-2xl border" :class="shareStepClass('note')">
                        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-slate-400">Step 3</div>
                        <div class="mt-1 text-sm font-bold text-gray-900 dark:text-slate-100">Upload note</div>
                      </div>
                    </div>

                    <div v-if="isSharing" class="mt-5">
                      <div class="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
                        <div class="font-semibold">{{ shareProgressLabel }}</div>
                        <div v-if="shareProgress.currentFilename" class="truncate max-w-[60%]">{{ shareProgress.currentFilename }}</div>
                      </div>
                      <div class="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden dark:bg-slate-800">
                        <div class="h-full bg-gray-900 rounded-full transition-all duration-300" :style="{ width: `${sharePercent}%` }"></div>
                      </div>
                    </div>

                    <div v-if="shareError" class="mt-5 p-4 rounded-2xl border border-red-200 bg-red-50 animate-in fade-in duration-200 dark:bg-red-950/30 dark:border-red-500/30">
                      <div class="text-sm font-bold text-red-900 dark:text-red-100">Share failed</div>
                      <div class="text-xs text-red-800 mt-1 wrap-break-word dark:text-red-200">{{ shareError }}</div>
                    </div>

                    <div v-if="shareResult" class="mt-5 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 animate-in fade-in duration-200 dark:bg-emerald-950/30 dark:border-emerald-500/30">
                      <div class="text-xs font-semibold text-emerald-900 uppercase tracking-wide dark:text-emerald-100">Link ready</div>
                      <div class="mt-1 text-sm font-bold text-emerald-900 break-all dark:text-emerald-100">{{ shareResult.shareUrl }}</div>
                      <div class="mt-2 text-xs text-emerald-800 dark:text-emerald-200">Anyone with this link can decrypt. Treat it like a password.</div>
                    </div>

                    <!-- Actions -->
                    <div class="mt-6 flex flex-col md:flex-row gap-3">
                      <button
                        v-if="!isSharing && !shareResult"
                        @click="startShare"
                        class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-2xl transition-all duration-200 hover:shadow-lg"
                      >
                        <span class="animate-pulse">⤴</span>
                        Start share
                      </button>

                      <button
                        v-if="shareError && !isSharing"
                        @click="startShare"
                        class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all duration-200"
                      >
                        Retry
                      </button>

                      <button
                        v-if="shareResult"
                        @click="copyShareUrl"
                        class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl transition-all duration-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        <Copy class="w-4 h-4" />
                        Copy link
                      </button>

                      <button
                        v-if="shareResult"
                        @click="copyShareKey"
                        class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl transition-all duration-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        Copy key
                      </button>

                      <button
                        v-if="shareResult"
                        @click="copyShareCid"
                        class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl transition-all duration-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        Copy CID
                      </button>

                      <button
                        @click="closeShareModal"
                        class="w-full md:w-auto md:ml-auto inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200 dark:text-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bookmark content goes in the card on left, so show full markdown here -->
            <div v-if="parsed?.tags?.bookmark && parsed?.content" class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-100 dark:bg-slate-950 dark:border-slate-800">
              <div class="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide dark:text-slate-400">Description</div>
              <div class="prose prose-lg max-w-none dark:prose-invert" v-html="renderedMarkdown"></div>
            </div>

            <!-- Regular content display -->
            <div v-else-if="parsed?.content" class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-100 dark:bg-slate-950 dark:border-slate-800">
              <div class="prose prose-lg max-w-none dark:prose-invert" v-html="renderedMarkdown"></div>
            </div>

            <!-- Empty state -->
            <div v-else class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-100 flex items-center justify-center dark:bg-slate-950 dark:border-slate-800">
              <div class="text-gray-400 italic text-center dark:text-slate-500">No content</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchNoteById, softDeleteNote } from "@/db";
import { parseNote } from "@/utils/noteParser";
import { ArrowLeft, Edit, Trash2, Share2, Copy } from "lucide-vue-next";
import { format } from "timeago.js";
import { Marked } from "marked";

import { getSupertagComponent } from "@/supertags";

import ParseReferences from "@/components/parsed/References.vue";
import ParseAttachments from "@/components/parsed/Attachments.vue";
import { uploadNoteTextToFileDrop, uploadToFileDrop, copyToClipboard } from "@/utils/fileDrop";
import { encryptJsonPayload, encryptOpaqueBinary, generateShareKey } from "@/utils/secureShare";
import { useToastStore } from "@/stores/toast";

const route = useRoute();
const router = useRouter();

const note = ref(null);
const noteId = ref(null);
const isLoaded = ref(false);
const isSharing = ref(false);
const shareResult = ref(null);
const isShareModalOpen = ref(false);
const shareError = ref("");
const shareProgress = ref({
  phase: "idle",
  totalAttachments: 0,
  uploadedAttachments: 0,
  currentFilename: "",
});
const shareKeyRef = ref("");

const toast = useToastStore();

// Initialize marked
const markedInstance = new Marked({
  breaks: true,
  gfm: true,
});

const parsed = computed(() => {
  if (!note.value?.content) return null;
  return parseNote(note.value.content);
});

const renderedMarkdown = computed(() => {
  if (!parsed.value?.content) return "";
  try {
    return markedInstance.parse(parsed.value.content);
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return parsed.value.content;
  }
});

onMounted(async () => {
  noteId.value = route.params.id;

  try {
    const loadedNote = await fetchNoteById(noteId.value);
    note.value = loadedNote;
  } catch (error) {
    console.error("Error loading note:", error);
  } finally {
    isLoaded.value = true;
  }
});

const formatDate = (timestamp) => {
  return format(timestamp);
};

const handleDelete = async () => {
  if (confirm("Are you sure you want to delete this note?")) {
    try {
      await softDeleteNote(noteId.value);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note. Please try again.");
    }
  }
};

const openShareModal = () => {
  isShareModalOpen.value = true;
  shareError.value = "";
  // Start immediately for a one-click share feel
  if (!shareResult.value && !isSharing.value) {
    startShare();
  }
};

const closeShareModal = () => {
  if (isSharing.value) return;
  isShareModalOpen.value = false;
};

const startShare = async () => {
  if (!note.value?.content || isSharing.value) return;

  isSharing.value = true;
  shareResult.value = null;
  shareError.value = "";
  shareProgress.value = { phase: "encrypt", totalAttachments: 0, uploadedAttachments: 0, currentFilename: "" };
  shareKeyRef.value = "";

  try {
    const baseName = noteId.value ? String(noteId.value) : "note";
    const filename = `zeronote-${baseName}.json`;

    const shareKey = generateShareKey();
    shareKeyRef.value = shareKey;
    const localAttachments = Array.isArray(note.value?.attachments) ? note.value.attachments : [];
    shareProgress.value.totalAttachments = localAttachments.length;
    const sharedAttachments = [];

    shareProgress.value.phase = "attachments";

    for (const att of localAttachments) {
      if (!att?.data) continue;

      shareProgress.value.currentFilename = att.name;

      const plainBytes = new Uint8Array(att.data);
      const encryptedBytes = await encryptOpaqueBinary(plainBytes, shareKey);

      const encryptedBlob = new Blob([encryptedBytes], { type: "application/octet-stream" });
      const encryptedFile = new File([encryptedBlob], `${att.name}.znenc`, { type: "application/octet-stream" });

      const uploaded = await uploadToFileDrop(encryptedFile);
      sharedAttachments.push({
        cid: uploaded.cid,
        name: att.name,
        type: att.type || "application/octet-stream",
        size: att.size || plainBytes.byteLength,
        enc: "iv+ct",
      });

      shareProgress.value.uploadedAttachments += 1;
    }

    shareProgress.value.phase = "note";
    shareProgress.value.currentFilename = filename;

    const payload = await encryptJsonPayload(
      {
        content: note.value.content,
        attachments: sharedAttachments,
      },
      shareKey
    );
    const encryptedJson = JSON.stringify(payload);

    const res = await uploadNoteTextToFileDrop(encryptedJson, {
      filename,
      mimeType: "application/json",
    });

    const publicBase = (import.meta?.env?.VITE_PUBLIC_ZERONOTE_BASE || "https://zeronote.js.org").replace(/\/$/, "");
    const shareUrl = `${publicBase}/#/ok/${res.cid}/${shareKey}`;

    shareResult.value = { ...res, shareUrl };
    await copyToClipboard(shareUrl);
    toast.success("Share link copied to clipboard.");
  } catch (error) {
    console.error("Temp share failed:", error);
    shareError.value = error?.message || "Failed to share note";
    toast.error(shareError.value);
  } finally {
    isSharing.value = false;
    shareProgress.value.currentFilename = "";
  }
};

const copyShareUrl = async () => {
  if (!shareResult.value?.shareUrl) return;
  try {
    await copyToClipboard(shareResult.value.shareUrl);
    toast.success("Copied share link.");
  } catch {
    toast.error("Failed to copy link.");
  }
};

const copyShareKey = async () => {
  if (!shareKeyRef.value) return;
  try {
    await copyToClipboard(shareKeyRef.value);
    toast.success("Copied key.");
  } catch {
    toast.error("Failed to copy key.");
  }
};

const copyShareCid = async () => {
  if (!shareResult.value?.cid) return;
  try {
    await copyToClipboard(String(shareResult.value.cid));
    toast.success("Copied CID.");
  } catch {
    toast.error("Failed to copy CID.");
  }
};

const sharePercent = computed(() => {
  const phase = shareProgress.value.phase;
  if (phase === "idle") return 0;
  if (phase === "encrypt") return 10;
  if (phase === "attachments") {
    const total = shareProgress.value.totalAttachments || 0;
    if (!total) return 50;
    const done = Math.min(shareProgress.value.uploadedAttachments || 0, total);
    return Math.round(10 + (done / total) * 70);
  }
  if (phase === "note") return 90;
  return 100;
});

const shareProgressLabel = computed(() => {
  const phase = shareProgress.value.phase;
  if (phase === "encrypt") return "Encrypting...";
  if (phase === "attachments") return "Uploading encrypted attachments...";
  if (phase === "note") return "Uploading encrypted note...";
  return "";
});

const shareStepClass = (step) => {
  const phase = shareProgress.value.phase;
  const done = "border-emerald-200 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-900/30";
  const active = "border-gray-900 bg-white shadow-sm dark:border-slate-400 dark:bg-slate-900";
  const idle = "border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950";

  if (shareResult.value) return done;
  if (isSharing.value) {
    if (step === "encrypt") return phase === "encrypt" ? active : done;
    if (step === "attachments") {
      if (phase === "encrypt") return idle;
      if (phase === "attachments") return active;
      return done;
    }
    if (step === "note") return phase === "note" ? active : idle;
  }
  return idle;
};
</script>

<style scoped>
/* Prose styling for rendered markdown */
.prose {
  color: #1f2937;
}

:global(.dark) .prose {
  color: #e2e8f0;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.prose p {
  margin-bottom: 1em;
  line-height: 1.75;
}

.prose a {
  color: #2563eb;
  text-decoration: none;
}

:global(.dark) .prose a {
  color: #60a5fa;
}

.prose a:hover {
  text-decoration: underline;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

:global(.dark) .prose code {
  background-color: #0f172a;
  color: #e2e8f0;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.prose ul,
.prose ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-bottom: 0.5rem;
}
</style>
