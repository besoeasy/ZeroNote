<template>
  <!-- Loading State -->
  <div v-if="!isLoaded" class="flex items-center justify-center h-full">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-8">
    <div class="text-center max-w-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2 dark:text-slate-100">Shared note not found</h2>
      <p class="text-gray-600 mb-4 dark:text-slate-300">{{ error }}</p>
      <p class="text-xs text-gray-500 mb-6 break-all dark:text-slate-500">CID: {{ cid }}</p>
      <router-link to="/dashboard" class="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
        Back to Dashboard
      </router-link>
    </div>
  </div>

  <div v-else-if="isLocked" class="flex flex-col items-center justify-center h-full p-8 bg-gray-50 dark:bg-slate-950">
    <div class="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 dark:bg-slate-950 dark:border-slate-800">
      <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide dark:text-slate-400">Encrypted Share</div>
      <h2 class="text-xl font-bold text-gray-900 mb-2 dark:text-slate-100">This shared note is locked</h2>
      <p class="text-sm text-gray-600 mb-4 dark:text-slate-300">Enter the decryption key to view it.</p>

      <div class="flex flex-col gap-3">
        <input
          v-model="enteredKey"
          type="text"
          placeholder="Paste key..."
          class="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-slate-600"
        />
        <button
          @click="attemptDecrypt"
          :disabled="isDecrypting || !enteredKey.trim()"
          class="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-all duration-200"
        >
          {{ isDecrypting ? "Decrypting..." : "Decrypt" }}
        </button>
        <p v-if="lockError" class="text-sm text-red-600 dark:text-red-300">{{ lockError }}</p>
        <p class="text-xs text-gray-500 break-all dark:text-slate-500">CID: {{ cid }}</p>
      </div>
    </div>
  </div>

  <div v-else class="h-full flex flex-col bg-white dark:bg-slate-950">
    <div class="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950">
      <div class="mx-auto p-6 md:p-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Tags & Metadata -->
          <div class="lg:col-span-1 space-y-4">
            <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-slate-950 dark:border-slate-800">
              <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide dark:text-slate-400">Shared Note</div>
              <div class="text-sm font-semibold text-gray-900 truncate dark:text-slate-100">{{ parsed?.title || 'Untitled Note' }}</div>
              <div class="mt-2 text-xs text-gray-500 break-all dark:text-slate-500">IPFS: {{ cid }}</div>
            </div>

            <template v-for="(tag, index) in parsed?.allTags" :key="`${tag.key}-${index}`">
              <component :is="getSupertagComponent(tag.key)" v-if="getSupertagComponent(tag.key)" :value="tag.value" :parsed="parsed" />
            </template>

            <div v-if="sharedAttachments.length" class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-slate-950 dark:border-slate-800">
              <div class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide dark:text-slate-400">
                Attachments ({{ sharedAttachments.length }})
              </div>
              <div class="space-y-2">
                <button
                  v-for="att in sharedAttachments"
                  :key="att.cid"
                  @click="downloadSharedAttachment(att)"
                  :disabled="isDownloadingCid === att.cid"
                  class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:border-slate-800"
                >
                  <div class="shrink-0 w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center dark:bg-slate-950 dark:border-slate-800">
                    <span class="text-sm font-semibold text-gray-700 dark:text-slate-200">{{ isDownloadingCid === att.cid ? "…" : "⬇" }}</span>
                  </div>
                  <div class="flex-1 min-w-0 text-left">
                    <div class="text-xs font-semibold text-gray-900 truncate dark:text-slate-100">{{ att.name }}</div>
                    <div class="text-xs text-gray-500 truncate dark:text-slate-400">{{ formatBytes(att.size) }}</div>
                  </div>
                </button>
              </div>
              <p v-if="downloadError" class="mt-3 text-xs text-red-600 dark:text-red-300">{{ downloadError }}</p>
            </div>

            <ParseReferences v-if="parsed?.references?.length" :references="parsed.references" />
          </div>

          <!-- Right Column - Content -->
          <div class="lg:col-span-2">
            <div class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-100 dark:bg-slate-950 dark:border-slate-800">
              <div class="prose prose-lg max-w-none dark:prose-invert" v-html="renderedMarkdown"></div>
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
import { Marked } from "marked";

import { parseNote } from "@/utils/noteParser";
import { fetchIpfsText, looksLikeIpfsCid, ipfsUrl } from "@/utils/ipfs";
import { decryptNotePayload, decryptOpaqueBinary } from "@/utils/secureShare";
import { getSupertagComponent } from "@/supertags";
import ParseReferences from "@/components/parsed/References.vue";

const route = useRoute();
const router = useRouter();

const cid = ref(String(route.params.cid || "").trim());
const rawContent = ref("");
const isLoaded = ref(false);
const error = ref("");

const isLocked = ref(false);
const encryptedPayload = ref(null);
const enteredKey = ref(String(route.params.key || "").trim());
const isDecrypting = ref(false);
const lockError = ref("");

const sharedAttachments = ref([]);
const isDownloadingCid = ref("");
const downloadError = ref("");

const markedInstance = new Marked({
  breaks: true,
  gfm: true,
});

const parsed = computed(() => {
  if (!rawContent.value) return null;
  return parseNote(rawContent.value);
});

const renderedMarkdown = computed(() => {
  if (!parsed.value?.content) return "";
  try {
    return markedInstance.parse(parsed.value.content);
  } catch {
    return parsed.value.content;
  }
});

onMounted(async () => {
  try {
    if (!looksLikeIpfsCid(cid.value)) {
      throw new Error("Invalid IPFS CID");
    }

    const text = await fetchIpfsText(cid.value);

    // If the IPFS content is an encrypted JSON payload, require the key.
    try {
      const maybeJson = JSON.parse(text);
      if (maybeJson && maybeJson.zn === "enc-v1") {
        encryptedPayload.value = maybeJson;
        if (enteredKey.value) {
          const decryptedText = await decryptNotePayload(maybeJson, enteredKey.value);
          try {
            const decryptedJson = JSON.parse(decryptedText);
            rawContent.value = String(decryptedJson?.content || "");
            sharedAttachments.value = Array.isArray(decryptedJson?.attachments) ? decryptedJson.attachments : [];
          } catch {
            rawContent.value = decryptedText;
            sharedAttachments.value = [];
          }
          isLocked.value = false;
        } else {
          isLocked.value = true;
        }
        return;
      }
    } catch {
      // Not JSON, treat as plaintext markdown.
    }

    rawContent.value = text;
  } catch (e) {
    error.value = e?.message || "Failed to load shared note";
  } finally {
    isLoaded.value = true;
  }
});

const attemptDecrypt = async () => {
  if (!encryptedPayload.value || !enteredKey.value.trim() || isDecrypting.value) return;
  lockError.value = "";
  isDecrypting.value = true;

  try {
    const decryptedText = await decryptNotePayload(encryptedPayload.value, enteredKey.value.trim());
    try {
      const decryptedJson = JSON.parse(decryptedText);
      rawContent.value = String(decryptedJson?.content || "");
      sharedAttachments.value = Array.isArray(decryptedJson?.attachments) ? decryptedJson.attachments : [];
    } catch {
      rawContent.value = decryptedText;
      sharedAttachments.value = [];
    }
    isLocked.value = false;
    await router.replace({ name: "ipfs-note-key", params: { cid: cid.value, key: enteredKey.value.trim() } });
  } catch (e) {
    lockError.value = e?.message || "Failed to decrypt";
  } finally {
    isDecrypting.value = false;
  }
};

const formatBytes = (bytes) => {
  const num = Number(bytes || 0);
  if (!num) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${Math.round((num / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

const downloadSharedAttachment = async (att) => {
  if (!att?.cid) return;
  if (!enteredKey.value?.trim()) {
    lockError.value = "Missing decryption key";
    isLocked.value = true;
    return;
  }

  isDownloadingCid.value = att.cid;
  downloadError.value = "";

  try {
    const res = await fetch(ipfsUrl(att.cid));
    if (!res.ok) {
      throw new Error(`Failed to fetch attachment (${res.status})`);
    }
    const encrypted = new Uint8Array(await res.arrayBuffer());
    const plainBytes = await decryptOpaqueBinary(encrypted, enteredKey.value.trim());

    const blob = new Blob([plainBytes], { type: att.type || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = att.name || `attachment-${att.cid}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    downloadError.value = e?.message || "Failed to download attachment";
  } finally {
    isDownloadingCid.value = "";
  }
};
</script>

<style scoped>
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
