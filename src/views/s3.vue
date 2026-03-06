<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8 md:py-12 transition-colors duration-300">
    <div class="max-w-5xl mx-auto space-y-8">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link
            to="/data"
            class="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200/70 text-gray-600 hover:bg-gray-100 transition-all duration-200 active:scale-95 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <div>
            <h1 class="text-2xl font-black text-gray-900 dark:text-gray-100">S3 Sync</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Connect S3-compatible object storage for auto-sync</p>
          </div>
        </div>
        <!-- Status badge -->
        <div class="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-300"
          :class="statusBadgeClass">
          <span class="inline-flex h-2 w-2 rounded-full" :class="dotClass"></span>
          {{ statusLabel }}
        </div>
      </div>

      <!-- Provider Presets -->
      <section>
        <h2 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Quick Setup — Choose a Provider</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <button
            v-for="p in providers"
            :key="p.id"
            @click="applyPreset(p)"
            :class="[
              'group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 text-center',
              activePreset === p.id
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/5'
            ]"
          >
            <span class="text-2xl">{{ p.icon }}</span>
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{{ p.name }}</span>
          </button>
        </div>
      </section>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <!-- Config Form (left, 3 cols) -->
        <div class="lg:col-span-3 space-y-4">
          <div class="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 class="text-base font-black text-gray-900 dark:text-gray-100 mb-5">Connection Settings</h2>

            <form @submit.prevent="saveConfig" class="space-y-4">
              <!-- Endpoint -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Endpoint URL</label>
                <input
                  v-model="config.endpoint"
                  placeholder="https://s3.amazonaws.com"
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-200 placeholder:text-gray-400"
                />
              </div>

              <!-- Access Key + Secret -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Access Key ID</label>
                  <input
                    v-model="config.accessKeyId"
                    autocomplete="off"
                    required
                    class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-200 font-mono"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Secret Access Key</label>
                  <div class="relative">
                    <input
                      v-model="config.secretAccessKey"
                      :type="showSecret ? 'text' : 'password'"
                      autocomplete="off"
                      required
                      class="w-full px-4 py-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-200 font-mono"
                    />
                    <button type="button" @click="showSecret = !showSecret" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                      <svg v-if="showSecret" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Bucket + Region -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Bucket Name</label>
                  <input
                    v-model="config.bucket"
                    required
                    class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Region</label>
                  <input
                    v-model="config.region"
                    placeholder="us-east-1"
                    required
                    class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-200 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <!-- SSL Toggle -->
              <label class="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200">
                <div class="relative flex items-center">
                  <input type="checkbox" v-model="config.useSSL" class="sr-only peer" />
                  <div class="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-emerald-500 transition-all duration-300"></div>
                  <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 peer-checked:translate-x-4"></div>
                </div>
                <div>
                  <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Use SSL / TLS</span>
                  <p class="text-xs text-gray-400 dark:text-gray-500">Required for all production endpoints</p>
                </div>
              </label>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-1">
                <button
                  type="button"
                  @click="testConnection"
                  :disabled="testing || !isFormFilled"
                  class="flex-1 px-4 py-2.5 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all duration-200 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg v-if="testing" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ testing ? 'Testing…' : 'Test Connection' }}
                </button>
                <button
                  type="submit"
                  :disabled="!isFormFilled"
                  class="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:brightness-110 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save & Connect
                </button>
              </div>

              <!-- Test Result -->
              <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
                <div v-if="testResult" :class="testResult.ok ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10' : 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'" class="rounded-xl border p-3 flex items-center gap-2">
                  <svg v-if="testResult.ok" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <svg v-else class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  <span :class="testResult.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'" class="text-xs font-medium">{{ testResult.message }}</span>
                </div>
              </transition>
            </form>
          </div>

          <!-- Danger Zone -->
          <div v-if="isSaved" class="bg-white dark:bg-gray-900 border border-red-200/60 dark:border-red-900/50 rounded-2xl p-5 shadow-sm">
            <h3 class="text-sm font-black text-red-600 dark:text-red-400 mb-1">Danger Zone</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Remove all stored S3 credentials from this device.</p>
            <button
              @click="clearConfig"
              class="px-4 py-2 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 active:scale-[0.98]"
            >
              Disconnect S3
            </button>
          </div>
        </div>

        <!-- Right column (2 cols) -->
        <div class="lg:col-span-2 space-y-4">

          <!-- Status Card -->
          <div class="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <h2 class="text-sm font-black text-gray-900 dark:text-gray-100 mb-4">Bucket Status</h2>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="rounded-xl bg-gray-50 dark:bg-gray-950/60 p-3">
                <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Notes Synced</div>
                <div class="text-2xl font-black text-gray-900 dark:text-gray-100">{{ s3Status.totalNotes ?? '—' }}</div>
              </div>
              <div class="rounded-xl bg-gray-50 dark:bg-gray-950/60 p-3">
                <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Oldest Entry</div>
                <div class="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {{ s3Status.oldestEntry ? new Date(s3Status.oldestEntry).toLocaleDateString() : '—' }}
                </div>
              </div>
            </div>
            <div v-if="lastSyncTime" class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Last sync: {{ new Date(lastSyncTime).toLocaleTimeString() }}
            </div>
          </div>

          <!-- Sync Controls -->
          <div class="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 class="text-sm font-black text-gray-900 dark:text-gray-100">Sync Controls</h2>
            <button
              @click="runSync"
              :disabled="syncing || !s3Connected"
              class="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:brightness-110 transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed dark:disabled:from-gray-700 dark:disabled:to-gray-700"
            >
              <svg v-if="syncing" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {{ syncing ? 'Syncing…' : 'Sync Now' }}
            </button>

            <!-- Progress -->
            <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100">
              <div v-if="syncing" class="rounded-xl bg-gray-50 dark:bg-gray-950/60 p-3 space-y-2">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 text-center truncate">{{ statusMessage || 'Syncing…' }}</div>
                <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300" :style="{ width: total > 0 ? (progress / total * 100) + '%' : '30%' }"></div>
                </div>
                <div class="text-xs text-center text-gray-500 dark:text-gray-400">{{ progress }} / {{ total }} notes</div>
              </div>
            </transition>

            <!-- Sync result -->
            <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
              <div v-if="syncResult" class="rounded-xl border border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-3 space-y-1">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300">Sync Complete</span>
                </div>
                <div class="text-xs text-emerald-600 dark:text-emerald-400">
                  ↑ {{ syncResult.uploaded.new + syncResult.uploaded.updated }} uploaded &nbsp;·&nbsp; ↓ {{ syncResult.downloaded.new + syncResult.downloaded.updated }} downloaded
                </div>
              </div>
            </transition>
          </div>

          <!-- Sync Logs -->
          <div v-if="syncLogs.length" class="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-black text-gray-900 dark:text-gray-100">Sync Logs</h2>
              <button @click="syncLogs = []" class="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">Clear</button>
            </div>
            <div class="bg-gray-50 dark:bg-gray-950/60 rounded-xl p-3 max-h-52 overflow-y-auto space-y-0.5">
              <div v-for="(log, i) in [...syncLogs].reverse()" :key="i" class="text-[11px] font-mono text-gray-600 dark:text-gray-400 py-0.5 leading-relaxed">{{ log }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { AwsClient } from "aws4fetch";
import { db, getAllNotes, getPurgedNotes, isNotePurged } from "@/db";

// ── State ───────────────────────────────────────────────────────────────
const showSecret = ref(false);
const testing = ref(false);
const syncing = ref(false);
const testResult = ref(null);
const syncResult = ref(null);
const syncLogs = ref([]);
const s3Connected = ref(false);
const lastSyncTime = ref(parseInt(localStorage.getItem("s3_last_sync") || "0") || null);
const s3Status = ref({ totalNotes: null, oldestEntry: null });
const progress = ref(0);
const total = ref(0);
const statusMessage = ref("");
const activePreset = ref(null);

const config = reactive({
  endpoint:        localStorage.getItem("s3_endpoint") || "",
  accessKeyId:     localStorage.getItem("s3_accessKeyId") || "",
  secretAccessKey: localStorage.getItem("s3_secretAccessKey") || "",
  bucket:          localStorage.getItem("s3_bucket") || "notes",
  region:          localStorage.getItem("s3_region") || "us-east-1",
  useSSL:          localStorage.getItem("s3_useSSL") === "true",
});

const isSaved = computed(() => Boolean(localStorage.getItem("s3_endpoint")));
const isFormFilled = computed(() =>
  config.endpoint && config.accessKeyId && config.secretAccessKey && config.bucket && config.region
);

const userID = db.name;

// ── Provider Presets ────────────────────────────────────────────────────
const providers = [
  { id: "aws",    name: "AWS S3",           icon: "🟡", endpoint: "https://s3.amazonaws.com",                          region: "us-east-1", useSSL: true  },
  { id: "r2",     name: "Cloudflare R2",    icon: "🟠", endpoint: "https://<account>.r2.cloudflarestorage.com",        region: "auto",      useSSL: true  },
  { id: "b2",     name: "Backblaze B2",     icon: "🔴", endpoint: "https://s3.us-west-004.backblazeb2.com",            region: "us-west-004", useSSL: true },
  { id: "minio",  name: "MinIO",            icon: "⚪", endpoint: "http://localhost:9000",                             region: "us-east-1", useSSL: false },
  { id: "do",     name: "DigitalOcean",     icon: "🔵", endpoint: "https://nyc3.digitaloceanspaces.com",               region: "nyc3",      useSSL: true  },
];

function applyPreset(p) {
  activePreset.value = p.id;
  config.endpoint = p.endpoint;
  config.region = p.region;
  config.useSSL = p.useSSL;
  testResult.value = null;
}

// ── Status Labels ───────────────────────────────────────────────────────
const statusLabel = computed(() => {
  if (!isFormFilled.value) return "Not configured";
  if (syncing.value) return "Syncing…";
  return s3Connected.value ? "Connected" : "Disconnected";
});

const statusBadgeClass = computed(() => {
  if (!isFormFilled.value) return "border-gray-200 text-gray-500 bg-white dark:border-gray-800 dark:text-gray-400 dark:bg-gray-900";
  if (syncing.value) return "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:bg-emerald-500/10";
  return s3Connected.value
    ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:bg-emerald-500/10"
    : "border-red-200 text-red-600 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-500/10";
});

const dotClass = computed(() => {
  if (!isFormFilled.value) return "bg-gray-400";
  if (syncing.value) return "bg-emerald-400 animate-pulse";
  return s3Connected.value ? "bg-emerald-500" : "bg-red-400";
});

// ── S3 Helpers ──────────────────────────────────────────────────────────
function makeClient() {
  return new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region || "us-east-1",
    service: "s3",
  });
}

function addLog(...args) {
  const msg = args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
  syncLogs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (syncLogs.value.length > 150) syncLogs.value.shift();
}

// ── Test Connection ─────────────────────────────────────────────────────
async function testConnection() {
  testing.value = true;
  testResult.value = null;
  try {
    const client = makeClient();
    const url = `${config.endpoint}/${config.bucket}`;
    const resp = await client.fetch(url, { method: "HEAD" });
    if (resp.status === 200 || resp.status === 301 || resp.status === 404) {
      testResult.value = { ok: true, message: "Connection successful! Bucket is reachable." };
      s3Connected.value = true;
    } else {
      testResult.value = { ok: false, message: `Unexpected status ${resp.status}. Check credentials.` };
      s3Connected.value = false;
    }
  } catch (e) {
    testResult.value = { ok: false, message: e?.message || "Connection failed. Check endpoint and credentials." };
    s3Connected.value = false;
  } finally {
    testing.value = false;
  }
}

// ── Save Config ─────────────────────────────────────────────────────────
function saveConfig() {
  localStorage.setItem("s3_endpoint",        config.endpoint);
  localStorage.setItem("s3_accessKeyId",     config.accessKeyId);
  localStorage.setItem("s3_secretAccessKey", config.secretAccessKey);
  localStorage.setItem("s3_bucket",          config.bucket);
  localStorage.setItem("s3_region",          config.region);
  localStorage.setItem("s3_useSSL",          config.useSSL ? "true" : "false");

  // Notify App.vue to re-init S3 client
  window.dispatchEvent(new CustomEvent("s3-config-updated"));

  checkStatus();
}

// ── Clear Config ────────────────────────────────────────────────────────
function clearConfig() {
  if (!confirm("Remove S3 credentials from this device?")) return;
  ["s3_endpoint","s3_accessKeyId","s3_secretAccessKey","s3_bucket","s3_region","s3_useSSL"].forEach(k => localStorage.removeItem(k));
  config.endpoint = "";
  config.accessKeyId = "";
  config.secretAccessKey = "";
  config.bucket = "notes";
  config.region = "us-east-1";
  config.useSSL = false;
  activePreset.value = null;
  s3Connected.value = false;
  s3Status.value = { totalNotes: null, oldestEntry: null };
  testResult.value = null;
  window.dispatchEvent(new CustomEvent("s3-config-updated"));
}

// ── Check Status ────────────────────────────────────────────────────────
async function checkStatus() {
  if (!isFormFilled.value) return;
  try {
    const client = makeClient();
    const bucket = config.bucket;
    const bucketUrl = `${config.endpoint}/${bucket}`;
    let resp = await client.fetch(bucketUrl, { method: "HEAD" });
    if (resp.status === 404) {
      await client.fetch(bucketUrl, { method: "PUT" });
    }
    s3Connected.value = true;

    const listUrl = `${config.endpoint}/${bucket}?list-type=2&prefix=${encodeURIComponent(userID + "/")}`;
    const listResp = await client.fetch(listUrl);
    const xml = await listResp.text();
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const contents = doc.getElementsByTagName("Contents");
    const notes = new Set();
    let oldest = null;

    for (let i = 0; i < contents.length; i++) {
      const key = contents[i].getElementsByTagName("Key")[0]?.textContent || "";
      const lm  = contents[i].getElementsByTagName("LastModified")[0]?.textContent;
      const fn  = key.split("/").pop();
      const m   = fn.match(/^(.+)-(\d+)\.json$/);
      if (m) {
        notes.add(m[1]);
        if (lm) {
          const d = new Date(lm);
          if (!oldest || d < oldest) oldest = d;
        }
      }
    }
    s3Status.value = { totalNotes: notes.size, oldestEntry: oldest };
  } catch {
    s3Connected.value = false;
  }
}

// ── Full Sync (mirrored from App.vue) ───────────────────────────────────
function arrayBufferToBase64(buffer) {
  if (!buffer || buffer.byteLength === 0) return null;
  let b = "";
  new Uint8Array(buffer).forEach(v => b += String.fromCharCode(v));
  return btoa(b);
}
function base64ToArrayBuffer(b64) {
  if (!b64) return null;
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function runSync() {
  if (!isFormFilled.value || syncing.value) return;
  syncing.value = true;
  syncResult.value = null;
  progress.value = 0;
  total.value = 0;
  statusMessage.value = "";

  try {
    const client = makeClient();
    const bucket = config.bucket;

    addLog("🔄 Starting full sync…");
    // Ensure bucket exists
    const bUrl = `${config.endpoint}/${bucket}`;
    const bResp = await client.fetch(bUrl, { method: "HEAD" });
    if (bResp.status === 404) await client.fetch(bUrl, { method: "PUT" });

    const localNotes = await getAllNotes();
    const listUrl = `${config.endpoint}/${bucket}?list-type=2&prefix=${encodeURIComponent(userID + "/")}`;
    const listResp = await client.fetch(listUrl);
    const xml = await listResp.text();
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const contents = doc.getElementsByTagName("Contents");

    const cloudNotes = {};
    const filesToDelete = [];

    for (let i = 0; i < contents.length; i++) {
      const key = contents[i].getElementsByTagName("Key")[0]?.textContent;
      if (!key) continue;
      const fn = key.split("/").pop();
      const m  = fn.match(/^(.+)-(\d+)\.json$/);
      if (m) {
        const [, noteID, ts] = m;
        const timestamp = parseInt(ts, 10);
        if (!cloudNotes[noteID] || timestamp > cloudNotes[noteID].timestamp) {
          if (cloudNotes[noteID]) filesToDelete.push(cloudNotes[noteID].key);
          cloudNotes[noteID] = { key, noteID, timestamp };
        } else {
          filesToDelete.push(key);
        }
      } else {
        filesToDelete.push(key);
      }
    }

    const uploaded = { new: 0, updated: 0, deleted: 0 };
    const downloaded = { new: 0, updated: 0, skipped: 0 };
    total.value = localNotes.length;

    for (let i = 0; i < localNotes.length; i++) {
      const note = localNotes[i];
      progress.value = i + 1;
      statusMessage.value = `Uploading ${note.id}…`;
      const localTs = new Date(note.updatedAt).getTime();
      const cloud   = cloudNotes[note.id];
      if (!cloud || localTs > cloud.timestamp) {
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (note.deletedAt && Date.now() - note.deletedAt > sevenDays) { addLog(`⏭️ Skipping expired: ${note.id}`); continue; }
        if (cloud) {
          try { await client.fetch(`${config.endpoint}/${bucket}/${cloud.key}`, { method: "DELETE" }); } catch {}
        }
        const s3Key  = `${userID}/${note.id}-${localTs}.json`;
        const body   = JSON.stringify({
          noteID: note.id, userID,
          content: note.content, updatedAt: note.updatedAt, deletedAt: note.deletedAt || null,
          attachments: (note.attachments || []).map(a => ({ ...a, data: a.data ? arrayBufferToBase64(a.data) : null })),
        });
        await client.fetch(`${config.endpoint}/${bucket}/${s3Key}`, { method: "PUT", body, headers: { "Content-Type": "application/json" } });
        cloud ? uploaded.updated++ : uploaded.new++;
      }
    }

    const purged = getPurgedNotes();
    for (const noteID of Object.keys(purged)) {
      if (cloudNotes[noteID]) {
        try { await client.fetch(`${config.endpoint}/${bucket}/${cloudNotes[noteID].key}`, { method: "DELETE" }); uploaded.deleted++; delete cloudNotes[noteID]; } catch {}
      }
    }

    for (const noteID in cloudNotes) {
      if (isNotePurged(noteID)) { downloaded.skipped++; continue; }
      const cloud  = cloudNotes[noteID];
      const exists = await db.notes.get(noteID);
      if (!exists || new Date(exists.updatedAt).getTime() < cloud.timestamp) {
        const resp = await client.fetch(`${config.endpoint}/${bucket}/${cloud.key}`);
        const data = JSON.parse(await resp.text());
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (data.deletedAt && Date.now() - data.deletedAt > sevenDays) { downloaded.skipped++; continue; }
        if (exists) await db.notes.delete(noteID);
        await db.notes.add({
          id: data.noteID, content: data.content, updatedAt: data.updatedAt, deletedAt: data.deletedAt || null,
          attachments: (data.attachments || []).map(a => ({ ...a, data: a.data ? base64ToArrayBuffer(a.data) : null })),
        });
        exists ? downloaded.updated++ : downloaded.new++;
      }
    }

    for (const key of filesToDelete) {
      try { await client.fetch(`${config.endpoint}/${bucket}/${key}`, { method: "DELETE" }); } catch {}
    }

    syncResult.value = { uploaded, downloaded };
    statusMessage.value = "Sync complete!";
    lastSyncTime.value = Date.now();
    localStorage.setItem("s3_last_sync", String(lastSyncTime.value));
    addLog(`✅ Done — ↑${uploaded.new + uploaded.updated} ↓${downloaded.new + downloaded.updated}`);
    await checkStatus();
  } catch (e) {
    addLog("❌ Sync failed:", e?.message || e);
  } finally {
    syncing.value = false;
  }
}

// ── Init ────────────────────────────────────────────────────────────────
onMounted(() => {
  if (isFormFilled.value) checkStatus();
});
</script>
