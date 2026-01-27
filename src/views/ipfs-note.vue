<template>
  <!-- Loading State -->
  <div v-if="!isLoaded" class="flex items-center justify-center h-full">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-8">
    <div class="text-center max-w-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Shared note not found</h2>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <p class="text-xs text-gray-500 mb-6 break-all">CID: {{ cid }}</p>
      <router-link to="/dashboard" class="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
        Back to Dashboard
      </router-link>
    </div>
  </div>

  <div v-else class="h-full flex flex-col bg-white">
    <div class="flex-1 overflow-auto bg-gray-50">
      <div class="mx-auto p-6 md:p-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Tags & Metadata -->
          <div class="lg:col-span-1 space-y-4">
            <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Shared Note</div>
              <div class="text-sm font-semibold text-gray-900 truncate">{{ parsed?.title || 'Untitled Note' }}</div>
              <div class="mt-2 text-xs text-gray-500 break-all">IPFS: {{ cid }}</div>
            </div>

            <template v-for="(tag, index) in parsed?.allTags" :key="`${tag.key}-${index}`">
              <component :is="getSupertagComponent(tag.key)" v-if="getSupertagComponent(tag.key)" :value="tag.value" :parsed="parsed" />
            </template>

            <ParseReferences v-if="parsed?.references?.length" :references="parsed.references" />
          </div>

          <!-- Right Column - Content -->
          <div class="lg:col-span-2">
            <div class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-100">
              <div class="prose prose-lg max-w-none" v-html="renderedMarkdown"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Marked } from "marked";

import { parseNote } from "@/utils/noteParser";
import { fetchIpfsText, looksLikeIpfsCid } from "@/utils/ipfs";
import { getSupertagComponent } from "@/supertags";
import ParseReferences from "@/components/parsed/References.vue";

const route = useRoute();

const cid = ref(String(route.params.cid || "").trim());
const rawContent = ref("");
const isLoaded = ref(false);
const error = ref("");

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
    rawContent.value = await fetchIpfsText(cid.value);
  } catch (e) {
    error.value = e?.message || "Failed to load shared note";
  } finally {
    isLoaded.value = true;
  }
});
</script>

<style scoped>
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
