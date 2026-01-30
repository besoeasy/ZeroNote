<template>
  <div class="min-h-screen w-full flex flex-col bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
    <RouterView v-if="isPublicShareRoute" />

    <LockScreen v-else-if="!isUnlocked" @unlock="handleUnlock" />

    <div v-else class="min-h-screen bg-white flex flex-col transition-colors duration-300 dark:bg-gray-950">
      <header
        class="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-gray-200 transition-colors duration-300 dark:bg-gray-950/75 dark:border-gray-800"
        :class="s3PanelOpen ? 'lg:pl-80' : ''"
      >
        <div class="w-full px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4">
          <router-link
            to="/dashboard"
            class="group flex items-center gap-2 rounded-2xl px-2 py-1.5 hover:bg-gray-100 transition-all duration-300 dark:hover:bg-gray-900/60"
            title="ZeroNote"
          >
            <div class="relative w-10 h-10 rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 overflow-hidden">
              <div class="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-shimmer-slide"></div>
              <span class="text-sm font-semibold relative">ZN</span>
            </div>
            <div class="hidden sm:flex flex-col leading-tight">
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">ZeroNote</span>
              <span class="text-[11px] text-gray-500 dark:text-gray-400">Private notes</span>
            </div>
          </router-link>

          <div class="flex-1"></div>

          <div class="flex items-center gap-2">
            <button
              v-if="isDashboard"
              @click="handleNewNote"
              class="group relative h-10 px-3.5 rounded-xl bg-linear-to-r from-gray-900 to-gray-800 text-white flex items-center gap-2 hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.98] overflow-hidden dark:from-white dark:to-gray-100 dark:text-gray-900 dark:hover:from-white dark:hover:to-gray-200"
              title="New Note"
            >
              <span class="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-shimmer-slide"></span>
              <Plus class="w-5 h-5" />
              <span class="hidden sm:inline text-sm font-medium">New</span>
            </button>

            <router-link
              v-else
              to="/dashboard"
              class="h-10 px-3 rounded-xl bg-gray-100 text-gray-900 flex items-center gap-2 hover:bg-gray-200 transition-all duration-300 active:scale-[0.98] dark:bg-gray-900/70 dark:text-gray-100 dark:hover:bg-gray-900"
              title="Back to Notes"
            >
              <ArrowLeft class="w-5 h-5" />
              <span class="hidden sm:inline text-sm font-medium">Back</span>
            </router-link>

            <button
              @click="theme.toggle"
              class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
              :title="theme.resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
              aria-label="Toggle theme"
            >
              <component :is="theme.resolvedTheme === 'dark' ? Sun : Moon" class="w-5 h-5" />
            </button>

            <div class="flex items-center gap-1.5 rounded-2xl bg-gray-50 p-1.5 shadow-inner border border-gray-100 dark:bg-gray-900/60 dark:border-gray-800">
              <router-link
                to="/data"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
                title="Data Hub"
                aria-label="Data Hub"
              >
                <Database class="w-5 h-5" />
              </router-link>

              <router-link
                to="/stats"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
                title="Statistics"
                aria-label="Statistics"
              >
                <BarChart3 class="w-5 h-5" />
              </router-link>

              <router-link
                to="/about"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
                title="About ZeroNote"
                aria-label="About ZeroNote"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </router-link>

              <button
                @click="handleLogout"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
                title="Lock App"
                aria-label="Lock app"
              >
                <Lock class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 w-full overflow-auto" :class="s3PanelOpen ? 'lg:pl-80' : ''">
        <RouterView />
      </main>
    </div>

    <button
      v-if="!s3PanelOpen && isUnlocked && !isPublicShareRoute"
      @click="toggleS3Panel(true)"
      class="fixed left-2 top-1/2 -translate-y-1/2 z-50 group flex items-center gap-2 rounded-2xl px-3 py-2 bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      title="Show S3 Sync"
      aria-label="Show S3 Sync"
    >
      <span class="absolute inset-0 rounded-2xl bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-25 animate-shimmer-slide"></span>
      <span class="relative inline-flex h-2.5 w-2.5 rounded-full" :class="s3IndicatorDotClass"></span>
      <span class="relative text-xs font-semibold">S3</span>
    </button>

    <aside
      v-if="isUnlocked && !isPublicShareRoute"
      class="fixed left-0 top-16 bottom-0 w-80 max-w-[90vw] z-40 border-r border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl transition-all duration-300 dark:bg-gray-950/90 dark:border-gray-800"
      :class="s3PanelOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-2.5 w-2.5 rounded-full" :class="s3IndicatorDotClass"></span>
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">S3 Sync</div>
            </div>
            <button
              @click="toggleS3Panel(false)"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all duration-300 dark:text-gray-300 dark:hover:bg-gray-900"
              aria-label="Hide S3 Sync"
              title="Hide S3 Sync"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs">
            <span class="text-gray-500 dark:text-gray-400">{{ s3IndicatorLabel }}</span>
            <span v-if="s3LastSync" class="text-gray-400 dark:text-gray-500">{{ new Date(s3LastSync).toLocaleTimeString() }}</span>
          </div>
        </div>

        <div class="p-4 space-y-4 overflow-y-auto">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            Configure your S3-compatible storage. Auto-sync runs on changes and every 15 minutes.
          </div>

          <form @submit.prevent="applyConfig" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Endpoint</label>
              <input
                v-model="config.endpoint"
                placeholder="e.g. http://localhost:9000"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs"
              />
            </div>
            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Access Key</label>
                <input
                  v-model="config.accessKeyId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Secret Key</label>
                <input
                  v-model="config.secretAccessKey"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Bucket</label>
                <input
                  v-model="config.bucket"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Region</label>
                <input
                  v-model="config.region"
                  placeholder="e.g. us-east-1"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs"
                />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="config.useSSL" id="useSSL" class="rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-400" />
              <label for="useSSL" class="text-xs text-gray-600 dark:text-gray-300">Use SSL</label>
            </div>
            <button type="submit" class="w-full px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold text-xs">
              Connect to S3
            </button>
          </form>

          <div v-if="s3Status" class="rounded-xl border border-gray-200 bg-white p-3 text-xs dark:border-gray-800 dark:bg-gray-900">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-gray-800 dark:text-gray-100">Status</span>
              <span
                :class="
                  s3Status.connected
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                "
                class="px-2 py-1 rounded-full text-[10px] font-semibold"
              >
                {{ s3Status.connected ? "Connected" : "Disconnected" }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-950">
                <div class="text-[10px] text-gray-500">Total Notes</div>
                <div class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ s3Status.totalNotes || 0 }}</div>
              </div>
              <div v-if="s3Status.oldestEntry" class="rounded-lg bg-gray-50 p-2 dark:bg-gray-950">
                <div class="text-[10px] text-gray-500">Oldest</div>
                <div class="text-[11px] font-semibold text-gray-900 dark:text-gray-100">{{ new Date(s3Status.oldestEntry).toLocaleDateString() }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <button
              @click="fullSync"
              :disabled="syncing || !s3Connected"
              class="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-slate-700 dark:disabled:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2"
            >
              <svg v-if="syncing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ syncing ? 'Syncing...' : 'Sync Now' }}
            </button>

            <div v-if="syncing" class="rounded-lg bg-gray-50 p-2 text-[10px] text-gray-600 dark:bg-gray-950 dark:text-gray-300">
              <div class="font-semibold mb-1 text-center">{{ statusMessage }}</div>
              <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-1">
                <div class="bg-emerald-500 h-1.5 rounded-full transition-all" :style="{ width: total > 0 ? (progress / total * 100) + '%' : '0%' }"></div>
              </div>
              <div class="text-center">{{ progress }} / {{ total }} notes</div>
            </div>

            <div v-if="syncResult" class="rounded-lg border border-emerald-200 bg-emerald-50/80 p-2 text-[10px] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              Uploaded {{ syncResult.uploaded.new + syncResult.uploaded.updated }}, Downloaded {{ syncResult.downloaded.new + syncResult.downloaded.updated }}
            </div>
          </div>

          <div v-if="syncLogs.length" class="rounded-xl border border-gray-200 bg-white p-3 text-[10px] dark:border-gray-800 dark:bg-gray-900">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-gray-700 dark:text-gray-100">Sync Logs</span>
              <button @click="syncLogs = []" class="text-[10px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Clear</button>
            </div>
            <div class="bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2 max-h-40 overflow-y-auto font-mono">
              <div v-for="(log, i) in syncLogs" :key="i" class="text-gray-700 dark:text-gray-300 py-0.5">{{ log }}</div>
            </div>
          </div>

          <div v-if="error" class="rounded-lg border border-red-200 bg-red-50/80 p-2 text-[10px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {{ error }}
          </div>
        </div>
      </div>
    </aside>

    <ToastHost />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import LockScreen from "@/components/LockScreen.vue";
import ToastHost from "@/components/ToastHost.vue";
import { Plus, Lock, Database, BarChart3, ArrowLeft, Sun, Moon } from "lucide-vue-next";
import { useThemeStore } from "@/stores/theme.js";
import { db, getAllNotes } from "@/db";
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const isUnlocked = ref(false);
const route = useRoute();
const router = useRouter();
const theme = useThemeStore();

const s3PanelOpen = ref(localStorage.getItem("s3_panel_open") !== "false");
const syncing = ref(false);
const pendingSync = ref(false);
const suppressDbHook = ref(false);
const syncLogs = ref([]);
const syncResult = ref(null);
const error = ref("");
const progress = ref(0);
const total = ref(0);
const statusMessage = ref("");
const s3Status = ref({ connected: false, totalNotes: 0, oldestEntry: null });
const s3Connected = ref(false);
const s3LastSync = ref(0);

const config = reactive({
  endpoint: localStorage.getItem("s3_endpoint") || "http://localhost:9000",
  accessKeyId: localStorage.getItem("s3_accessKeyId") || "",
  secretAccessKey: localStorage.getItem("s3_secretAccessKey") || "",
  bucket: localStorage.getItem("s3_bucket") || "notes",
  region: localStorage.getItem("s3_region") || "us-east-1",
  useSSL: localStorage.getItem("s3_useSSL") === "true" || false,
});

let s3Client = null;
let BUCKET_NAME = config.bucket;
let debounceTimer = null;
let intervalId = null;
let cleanupHooks = [];

const userID = db.name;

const isPublicShareRoute = computed(() => {
  return route.name === "ipfs-note" || route.name === "ipfs-note-key";
});

const isDashboard = computed(() => route.path === "/dashboard" || route.path === "/");

const s3IndicatorLabel = computed(() => {
  if (!isS3Configured()) return "S3 off";
  if (syncing.value) return "Syncing";
  if (error.value) return "S3 error";
  return s3Connected.value ? "S3 on" : "S3 idle";
});

const s3IndicatorDotClass = computed(() => {
  if (!isS3Configured()) return "bg-gray-400";
  if (error.value) return "bg-red-500";
  if (syncing.value) return "bg-emerald-400 animate-pulse";
  return s3Connected.value ? "bg-emerald-500" : "bg-emerald-300";
});

const handleUnlock = () => {
  location.reload();
};

const generateRandomId = () => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

const handleNewNote = () => {
  router.push(`/notes/${generateRandomId()}/edit`);
};

const handleLogout = () => {
  if (confirm("Are you sure you want to lock the app?")) {
    sessionStorage.clear();
    location.reload();
  }
};

function toggleS3Panel(open) {
  s3PanelOpen.value = open;
  localStorage.setItem("s3_panel_open", open ? "true" : "false");
}

function addSyncLog(...args) {
  const msg = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
  syncLogs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (syncLogs.value.length > 100) syncLogs.value.shift();
}

function streamToString(stream) {
  const reader = stream.getReader();
  let result = "";
  return (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += new TextDecoder().decode(value);
    }
    return result;
  })();
}

function arrayBufferToBase64(buffer) {
  if (!buffer || buffer.byteLength === 0) return null;
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  if (!base64 || typeof base64 !== "string") return null;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function isS3Configured() {
  return Boolean(
    config.endpoint &&
      config.accessKeyId &&
      config.secretAccessKey &&
      config.bucket &&
      config.region
  );
}

function createS3Client() {
  const endpoint = config.endpoint.replace(/\/$/, "");
  return new S3Client({
    region: config.region || "us-east-1",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function ensureClient() {
  if (!isUnlocked.value) return false;
  if (!isS3Configured()) return false;
  if (!s3Client || BUCKET_NAME !== config.bucket) {
    s3Client = createS3Client();
    BUCKET_NAME = config.bucket;
  }
  return true;
}

async function ensureBucket() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (err) {
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
  }
}

function applyConfig() {
  localStorage.setItem("s3_endpoint", config.endpoint);
  localStorage.setItem("s3_accessKeyId", config.accessKeyId);
  localStorage.setItem("s3_secretAccessKey", config.secretAccessKey);
  localStorage.setItem("s3_bucket", config.bucket);
  localStorage.setItem("s3_region", config.region);
  localStorage.setItem("s3_useSSL", config.useSSL ? "true" : "false");
  s3Client = createS3Client();
  BUCKET_NAME = config.bucket;
  checkS3Status();
  scheduleSync("config-update");
}

async function checkS3Status() {
  if (!ensureClient()) return;
  try {
    let bucketExists = true;
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    } catch (err) {
      bucketExists = false;
    }
    if (!bucketExists) {
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    }
    s3Status.value.connected = true;
    s3Connected.value = true;

    let totalNotes = 0;
    let oldestEntry = null;
    const listRes = await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${userID}/` }));
    if (listRes.Contents) {
      const uniqueNotes = new Set();
      for (const obj of listRes.Contents) {
        const filename = obj.Key.split("/").pop();
        const match = filename.match(/^(.+)-(\d+)\.json$/);
        if (match) {
          const [, noteID] = match;
          uniqueNotes.add(noteID);
          const lastModified = new Date(obj.LastModified);
          if (!oldestEntry || lastModified < oldestEntry) {
            oldestEntry = lastModified;
          }
        }
      }
      totalNotes = uniqueNotes.size;
    }
    s3Status.value = { connected: true, totalNotes, oldestEntry };
  } catch (e) {
    s3Status.value.connected = false;
    s3Connected.value = false;
    error.value = "Failed to connect to S3";
  }
}

async function fullSync() {
  if (!ensureClient()) return;

  syncing.value = true;
  syncResult.value = null;
  error.value = "";
  progress.value = 0;

  suppressDbHook.value = true;
  try {
    addSyncLog("🔄 Starting full sync...");
    await ensureBucket();
    const localNotes = await getAllNotes();
    const listRes = await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${userID}/` }));

    const cloudObjects = listRes.Contents || [];
    const cloudNotes = {};
    const filesToDelete = [];

    for (const obj of cloudObjects) {
      const filename = obj.Key.split("/").pop();
      const match = filename.match(/^(.+)-(\d+)\.json$/);

      if (match) {
        const [, noteID, timestampStr] = match;
        const timestamp = parseInt(timestampStr, 10);

        if (!cloudNotes[noteID] || timestamp > cloudNotes[noteID].timestamp) {
          if (cloudNotes[noteID]) {
            filesToDelete.push(cloudNotes[noteID].key);
          }

          cloudNotes[noteID] = {
            key: obj.Key,
            noteID,
            timestamp,
          };
        } else {
          filesToDelete.push(obj.Key);
        }
      } else {
        filesToDelete.push(obj.Key);
      }
    }

    const uploaded = { new: 0, updated: 0 };
    const downloaded = { new: 0, updated: 0 };

    total.value = localNotes.length;
    for (let i = 0; i < localNotes.length; i++) {
      const localNote = localNotes[i];
      progress.value = i + 1;
      statusMessage.value = `Processing ${localNote.id}...`;

      const localTimestamp = new Date(localNote.updatedAt).getTime();
      const cloudNote = cloudNotes[localNote.id];
      const needsUpload = !cloudNote || localTimestamp > cloudNote.timestamp;

      if (needsUpload) {
        if (cloudNote) {
          try {
            await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: cloudNote.key }));
          } catch (e) {
            addSyncLog("⚠️ Failed to delete old version:", e?.message || e);
          }
        }

        const s3Key = `${userID}/${localNote.id}-${localTimestamp}.json`;
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: JSON.stringify({
              noteID: localNote.id,
              userID,
              content: localNote.content,
              updatedAt: localNote.updatedAt,
              deletedAt: localNote.deletedAt || null,
              attachments: (localNote.attachments || []).map((att) => ({
                ...att,
                data: att.data ? arrayBufferToBase64(att.data) : null,
              })),
            }),
            ContentType: "application/json",
          })
        );

        if (cloudNote) uploaded.updated++;
        else uploaded.new++;
      }
    }

    for (const noteID in cloudNotes) {
      const cloudNote = cloudNotes[noteID];
      const existsLocal = await db.notes.get(noteID);

      if (!existsLocal || new Date(existsLocal.updatedAt).getTime() < cloudNote.timestamp) {
        const getObjRes = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: cloudNote.key }));
        const data = await streamToString(getObjRes.Body);
        const noteData = JSON.parse(data);

        if (existsLocal) {
          await db.notes.delete(noteID);
        }

        const attachments = (noteData.attachments || []).map((att) => ({
          ...att,
          data: att.data ? base64ToArrayBuffer(att.data) : null,
        }));

        await db.notes.add({
          id: noteData.noteID,
          content: noteData.content,
          updatedAt: noteData.updatedAt,
          deletedAt: noteData.deletedAt || null,
          attachments,
        });

        if (existsLocal) downloaded.updated++;
        else downloaded.new++;
      }
    }

    if (filesToDelete.length > 0) {
      for (const key of filesToDelete) {
        try {
          await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        } catch (e) {
          addSyncLog("⚠️ Failed to delete:", e?.message || e);
        }
      }
    }

    syncResult.value = { uploaded, downloaded };
    statusMessage.value = "Sync complete!";
    s3LastSync.value = Date.now();
    await checkS3Status();
  } catch (e) {
    addSyncLog("❌ Sync failed:", e?.message || e);
    error.value = e?.message || "Failed to complete sync";
  } finally {
    syncing.value = false;
    suppressDbHook.value = false;
  }
}

async function triggerSync(reason = "manual") {
  if (!ensureClient()) return;
  if (syncing.value) {
    pendingSync.value = true;
    return;
  }

  addSyncLog("🔄 Auto sync:", reason);
  await fullSync();
  if (pendingSync.value) {
    pendingSync.value = false;
    triggerSync("queued");
  }
}

function scheduleSync(reason = "db-change") {
  if (!ensureClient()) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => triggerSync(reason), 1500);
}

function registerDbHooks() {
  const onChange = () => {
    if (suppressDbHook.value) return;
    scheduleSync("db-change");
  };

  cleanupHooks = [
    db.notes.hook("creating", onChange),
    db.notes.hook("updating", onChange),
    db.notes.hook("deleting", onChange),
  ];
}

function cleanupDbHooks() {
  for (const hook of cleanupHooks) {
    if (hook && typeof hook.unsubscribe === "function") {
      hook.unsubscribe();
    }
  }
  cleanupHooks = [];
}

onMounted(() => {
  if (sessionStorage.getItem("ENCRYPTION_KEY")) {
    isUnlocked.value = true;
  }

  registerDbHooks();
  if (isS3Configured()) {
    s3Client = createS3Client();
    BUCKET_NAME = config.bucket;
    checkS3Status();
    triggerSync("startup");
  }

  intervalId = setInterval(() => {
    triggerSync("interval-15m");
  }, 15 * 60 * 1000);
});

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (intervalId) clearInterval(intervalId);
  cleanupDbHooks();
});

watch(
  () => config.bucket,
  (val) => {
    BUCKET_NAME = val;
  }
);
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
}

.dark body {
  background-color: #030712;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dark ::-webkit-scrollbar-track {
  background: #0b1220;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #334155;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Focus states for accessibility */
button:focus,
a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
