<template>
  <!-- Loading State -->
  <div v-if="!isLoaded" class="flex items-center justify-center h-full">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>

  <!-- Note Not Found -->
  <div v-else-if="!note" class="flex flex-col items-center justify-center h-full p-8">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Note not found</h2>
      <p class="text-gray-600 mb-6">This note doesn't exist or has been deleted.</p>
      <router-link to="/dashboard" class="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
        Back to Dashboard
      </router-link>
    </div>
  </div>

  <div v-else class="h-full flex flex-col bg-white">
    <!-- Content -->
    <div class="flex-1 overflow-auto bg-gray-50">
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
              <div class="text-sm text-gray-500">
                Updated {{ formatDate(note.updatedAt) }}
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="handleTempShare"
                  :disabled="isSharing"
                  class="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  title="Upload this note to FileDrop and copy the link"
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
                  class="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                  title="Delete Note"
                >
                  <Trash2 class="w-4 h-4" />
                  <span class="hidden md:inline">Delete</span>
                </button>
              </div>
            </div>

            <div
              v-if="shareResult"
              data-share-exclude
              class="mb-6 flex items-center justify-between gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div class="min-w-0">
                <div class="text-xs font-semibold text-emerald-900">Temporary link ready</div>
                <div class="text-xs text-emerald-800 truncate">{{ shareResult.shareUrl }}</div>
              </div>
              <button
                @click="copyShareUrl"
                class="shrink-0 inline-flex items-center px-3 py-2 text-xs font-semibold text-emerald-900 bg-white border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Copy link"
              >
                <Copy class="w-4 h-4 mr-1.5" />
                Copy
              </button>
            </div>

            <!-- Bookmark content goes in the card on left, so show full markdown here -->
            <div v-if="parsed?.tags?.bookmark && parsed?.content" class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-100">
              <div class="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Description</div>
              <div class="prose prose-lg max-w-none" v-html="renderedMarkdown"></div>
            </div>

            <!-- Regular content display -->
            <div v-else-if="parsed?.content" class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-100">
              <div class="prose prose-lg max-w-none" v-html="renderedMarkdown"></div>
            </div>

            <!-- Empty state -->
            <div v-else class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-100 flex items-center justify-center">
              <div class="text-gray-400 italic text-center">No content</div>
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

const route = useRoute();
const router = useRouter();

const note = ref(null);
const noteId = ref(null);
const isLoaded = ref(false);
const isSharing = ref(false);
const shareResult = ref(null);

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
      alert("Failed to delete note. Please try again.");
    }
  }
};

const handleTempShare = async () => {
  if (!note.value?.content || isSharing.value) return;

  isSharing.value = true;
  shareResult.value = null;

  try {
    const baseName = noteId.value ? String(noteId.value) : "note";
    const filename = `zeronote-${baseName}.json`;

    const shareKey = generateShareKey();
    const localAttachments = Array.isArray(note.value?.attachments) ? note.value.attachments : [];
    const sharedAttachments = [];

    for (const att of localAttachments) {
      if (!att?.data) continue;

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
    }

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
  } catch (error) {
    console.error("Temp share failed:", error);
    alert(error?.message || "Failed to share note");
  } finally {
    isSharing.value = false;
  }
};

const buildSharedNoteHtml = ({ title, updatedAt, body }) => {
  const safeTitle = String(title || "ZeroNote Shared Note")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const updated = updatedAt ? `Updated ${format(updatedAt)}` : "";

  // Important: don't include literal closing-tag sequences in strings/comments in this SFC.
  return [
    "<!doctype html>",
    '<html lang="en">',
    "  <head>",
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `    <title>${safeTitle}</title>`,
    '    <script src="https://cdn.tailwindcss.com"></scr' + "ipt>",
    "    <style>",
    "      /* Match ZeroNote's markdown styling used in note view */",
    "      .prose { color: #1f2937; }",
    "      .prose h1, .prose h2, .prose h3, .prose h4 { font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }",
    "      .prose p { margin-bottom: 1em; line-height: 1.75; }",
    "      .prose a { color: #2563eb; text-decoration: none; }",
    "      .prose a:hover { text-decoration: underline; }",
    "      .prose code { background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875em; }",
    "      .prose pre { background-color: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }",
    "      .prose pre code { background-color: transparent; padding: 0; color: inherit; }",
    "      .prose ul, .prose ol { margin-left: 1.5rem; margin-bottom: 1rem; }",
    "      .prose li { margin-bottom: 0.5rem; }",
    "    </st" + "yle>",
    "  </head>",
    '  <body class="bg-gray-50">',
    '    <main class="mx-auto max-w-6xl p-6 md:p-12">',
    '      <header class="mb-6">',
    `        <h1 class="text-2xl font-bold text-gray-900">${safeTitle}</h1>`,
    updated ? `        <div class="text-sm text-gray-500 mt-1">${updated}</div>` : "",
    "      </header>",
    body,
    '      <footer class="mt-10 text-xs text-gray-400">Shared from ZeroNote</footer>',
    "    </main>",
    "  </body>",
    "</html>",
  ]
    .filter(Boolean)
    .join("\n");
};

const copyShareUrl = async () => {
  if (!shareResult.value?.shareUrl) return;
  try {
    await copyToClipboard(shareResult.value.shareUrl);
  } catch {
    alert("Failed to copy link");
  }
};
</script>

<style scoped>
/* Prose styling for rendered markdown */
.prose {
  color: #1f2937;
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

.prose a:hover {
  text-decoration: underline;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
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
