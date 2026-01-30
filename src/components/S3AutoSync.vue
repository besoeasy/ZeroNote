<template>
  <div class="hidden" aria-hidden="true"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, reactive, ref } from "vue";
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

const syncLogs = ref([]);
const syncing = ref(false);
const pendingSync = ref(false);
const suppressDbHook = ref(false);

const config = reactive({
  endpoint: "",
  accessKeyId: "",
  secretAccessKey: "",
  bucket: "",
  region: "",
  useSSL: false,
});

let s3Client = null;
let BUCKET_NAME = "";
let debounceTimer = null;
let intervalId = null;
let cleanupHooks = [];

const userID = db.name;

function addSyncLog(...args) {
  const msg = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
  syncLogs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (syncLogs.value.length > 100) syncLogs.value.shift();
}

function loadConfig() {
  config.endpoint = localStorage.getItem("s3_endpoint") || "";
  config.accessKeyId = localStorage.getItem("s3_accessKeyId") || "";
  config.secretAccessKey = localStorage.getItem("s3_secretAccessKey") || "";
  config.bucket = localStorage.getItem("s3_bucket") || "";
  config.region = localStorage.getItem("s3_region") || "";
  config.useSSL = localStorage.getItem("s3_useSSL") === "true" || false;
}

function isUnlocked() {
  return Boolean(sessionStorage.getItem("ENCRYPTION_KEY"));
}

function isConfigured() {
  return Boolean(
    config.endpoint &&
      config.accessKeyId &&
      config.secretAccessKey &&
      config.bucket &&
      config.region
  );
}

function updateStatus(partial) {
  const updates = partial || {};
  if (typeof updates.configured === "boolean") {
    localStorage.setItem("s3_configured", updates.configured ? "true" : "false");
  }
  if (typeof updates.active === "boolean") {
    localStorage.setItem("s3_active", updates.active ? "true" : "false");
  }
  if (typeof updates.lastSync === "number") {
    localStorage.setItem("s3_last_sync", String(updates.lastSync));
  }
  if (typeof updates.lastError === "string") {
    if (updates.lastError) {
      localStorage.setItem("s3_last_error", updates.lastError);
    } else {
      localStorage.removeItem("s3_last_error");
    }
  }
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
  loadConfig();
  updateStatus({ configured: isConfigured() });
  if (!isUnlocked()) return false;
  if (!isConfigured()) return false;
  if (!s3Client || BUCKET_NAME !== config.bucket) {
    s3Client = createS3Client();
    BUCKET_NAME = config.bucket;
  }
  return true;
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

async function ensureBucket() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (err) {
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
  }
}

async function streamToString(stream) {
  const reader = stream.getReader();
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += new TextDecoder().decode(value);
  }
  return result;
}

async function fullSync() {
  if (!ensureClient()) return;

  suppressDbHook.value = true;
  try {
    updateStatus({ active: true, lastError: "" });
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

    for (const localNote of localNotes) {
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
  } catch (e) {
    addSyncLog("❌ Sync failed:", e?.message || e);
    updateStatus({ lastError: e?.message || String(e) });
  } finally {
    updateStatus({ active: false, lastSync: Date.now() });
    suppressDbHook.value = false;
  }
}

async function triggerSync(reason = "manual") {
  if (!ensureClient()) return;
  if (syncing.value) {
    pendingSync.value = true;
    return;
  }

  syncing.value = true;
  try {
    addSyncLog("🔄 Auto sync:", reason);
    await fullSync();
  } finally {
    syncing.value = false;
    if (pendingSync.value) {
      pendingSync.value = false;
      triggerSync("queued");
    }
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

function handleStorageEvent(event) {
  if (!event.key || !event.key.startsWith("s3_")) return;
  loadConfig();
  updateStatus({ configured: isConfigured() });
  if (isConfigured()) {
    scheduleSync("config-update");
  }
}

onMounted(() => {
  loadConfig();
  updateStatus({ configured: isConfigured(), active: false });
  registerDbHooks();
  if (isConfigured()) {
    triggerSync("startup");
  }

  intervalId = setInterval(() => {
    triggerSync("interval-15m");
  }, 15 * 60 * 1000);

  window.addEventListener("storage", handleStorageEvent);
});

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (intervalId) clearInterval(intervalId);
  cleanupDbHooks();
  window.removeEventListener("storage", handleStorageEvent);
});
</script>
