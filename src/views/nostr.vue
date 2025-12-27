<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8 pt-16 md:pt-8 space-y-6">
    <header class="text-center space-y-3">
      <p class="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-700 bg-purple-100 rounded-full">Experimental</p>
      <h1 class="text-3xl md:text-5xl font-black text-gray-900">Nostr Backup</h1>
      <p class="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">Publish and restore encrypted backups via your Nostr extension (NIP-07). Data stays encrypted with your master password; relays only see ciphertext. A Nostr browser extension is required.</p>
    </header>

    <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      <div class="flex items-start gap-3">
        <div class="p-3 bg-purple-100 rounded-xl">
          <CloudUpload class="w-6 h-6 text-purple-700" />
        </div>
        <div class="flex-1 space-y-2">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h2 class="text-xl font-semibold text-gray-900">Backup & Restore</h2>
            <span class="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">NIP-07 extension required</span>
          </div>
          <p class="text-sm text-gray-600">Uses `kind:30023` events with chunked ciphertext. Keep your relays reachable for restores.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Relays</label>
          <textarea
            v-model="nostrRelayInput"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            placeholder="One relay per line"
          ></textarea>
          <p class="text-xs text-gray-500">We will publish to all listed relays and accept restore data from any that reply.</p>
        </div>
        <div class="space-y-3">
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900 flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 mt-0.5" />
            <div>
              <p class="font-semibold">Extension needed</p>
              <p class="text-purple-800">Install and enable a Nostr (NIP-07) browser extension, then retry if prompted.</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              @click="backupToNostr"
              :disabled="nostrWorking"
              class="inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
            >
              <CloudUpload class="w-5 h-5 mr-2" />
              {{ nostrWorking ? 'Working...' : 'Backup to Nostr' }}
            </button>
            <button
              @click="restoreFromNostr"
              :disabled="nostrWorking"
              class="inline-flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
            >
              <CloudDownload class="w-5 h-5 mr-2" />
              {{ nostrWorking ? 'Working...' : 'Restore from Nostr' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="nostrProgress.total" class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm animate-pulse">
        <p class="font-medium text-gray-800">{{ nostrProgress.status }}</p>
        <p class="text-xs text-gray-600">{{ nostrProgress.current }} / {{ nostrProgress.total }} chunk{{ nostrProgress.total === 1 ? '' : 's' }}</p>
      </div>

      <div v-if="nostrMessage" class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
        {{ nostrMessage }}
      </div>
      <div v-if="nostrError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
        {{ nostrError }}
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { db, decryptData, encryptData } from "@/db.js";
import { CloudUpload, CloudDownload, AlertTriangle } from "lucide-vue-next";

const nostrRelayInput = ref(
  localStorage.getItem("nostr_relays") || "wss://relay.damus.io\nwss://nos.lol\nwss://relay.nostr.band"
);
const nostrWorking = ref(false);
const nostrMessage = ref("");
const nostrError = ref("");
const nostrProgress = ref({ current: 0, total: 0, status: "" });

const nostrRelays = computed(() =>
  nostrRelayInput.value
    .split(/\s+/)
    .map((r) => r.trim())
    .filter(Boolean)
);

// Convert ArrayBuffer to base64 for transport
const arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

// Convert base64 back to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

const buildPlainBackupData = async () => {
  const notes = await db.notes.filter((note) => !note.deletedAt).toArray();
  if (notes.length === 0) {
    throw new Error("No notes to backup. Create some notes first!");
  }
  return notes.map((note) => ({
    ...note,
    content: decryptData(note.content),
    attachments:
      note.attachments?.map((att) => ({
        ...att,
        data: att.data ? arrayBufferToBase64(att.data) : null,
      })) || [],
  }));
};

const buildEncryptedBackupString = async () => {
  const plain = await buildPlainBackupData();
  const jsonData = JSON.stringify(plain);
  return encryptData(jsonData);
};

const ensureNostrExtension = () => {
  if (typeof window === "undefined" || !window.nostr || typeof window.nostr.signEvent !== "function") {
    throw new Error("Nostr browser extension not found. Please install a NIP-07 extension and try again.");
  }
};

const chunkString = (str, size = 15000) => {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) chunks.push(str.slice(i, i + size));
  return chunks;
};

const publishToRelay = (relayUrl, event) =>
  new Promise((resolve, reject) => {
    let settled = false;
    const ws = new WebSocket(relayUrl);
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        ws.close();
        reject(new Error("Relay timeout"));
      }
    }, 12000);

    ws.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(new Error("Relay connection failed"));
      }
    };

    ws.onopen = () => {
      ws.send(JSON.stringify(["EVENT", event]));
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (Array.isArray(data) && data[0] === "OK" && data[1] === event.id) {
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            data[2] === true ? resolve() : reject(new Error(data[3] || "Relay rejected event"));
          }
          ws.close();
        }
      } catch (e) {
        /* ignore parse */
      }
    };

    ws.onclose = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(new Error("Relay closed"));
      }
    };
  });

const fetchEventsFromRelay = (relayUrl, pubkey) =>
  new Promise((resolve) => {
    const events = [];
    let settled = false;
    const ws = new WebSocket(relayUrl);
    const subId = `zeronote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        ws.close();
        resolve(events);
      }
    }, 6000);

    ws.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(events);
      }
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify([
          "REQ",
          subId,
          {
            kinds: [30023],
            authors: [pubkey],
            limit: 200,
          },
        ])
      );
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (Array.isArray(data) && data[0] === "EVENT" && data[1] === subId) {
          events.push(data[2]);
        }
        if (Array.isArray(data) && data[0] === "EOSE" && data[1] === subId) {
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            ws.send(JSON.stringify(["CLOSE", subId]));
            ws.close();
            resolve(events);
          }
        }
      } catch (e) {
        /* ignore */
      }
    };
  });

const signEventWithExtension = async (baseEvent) => {
  const signed = await window.nostr.signEvent(baseEvent);
  if (!signed.id || !signed.sig) {
    throw new Error("Failed to sign event");
  }
  return signed;
};

const backupToNostr = async () => {
  nostrWorking.value = true;
  nostrMessage.value = "";
  nostrError.value = "";
  nostrProgress.value = { current: 0, total: 0, status: "Preparing backup..." };

  try {
    ensureNostrExtension();
    localStorage.setItem("nostr_relays", nostrRelayInput.value);

    const encryptedPayload = await buildEncryptedBackupString();
    const chunks = chunkString(encryptedPayload);
    const backupId = `zeronote-backup:${Date.now()}`;
    const pubkey = await window.nostr.getPublicKey();

    if (chunks.length === 0) {
      throw new Error("Nothing to backup");
    }

    const relayUrls = nostrRelays.value;
    if (relayUrls.length === 0) {
      throw new Error("Please provide at least one relay URL");
    }

    let sent = 0;
    nostrProgress.value = { current: 0, total: chunks.length, status: "Signing events..." };

    for (let i = 0; i < chunks.length; i++) {
      const baseEvent = {
        kind: 30023,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["d", backupId],
          ["i", `${i + 1}/${chunks.length}`],
          ["v", "1"],
          ["content_type", "application/json"],
          ["app", "ZeroNote"],
        ],
        content: chunks[i],
        pubkey,
      };

      const signed = await signEventWithExtension(baseEvent);

      const publishResults = await Promise.allSettled(relayUrls.map((url) => publishToRelay(url, signed)));
      const ok = publishResults.some((r) => r.status === "fulfilled");
      if (!ok) {
        throw new Error("Failed to publish to any relay. Check your relays and try again.");
      }

      sent += 1;
      nostrProgress.value = { current: sent, total: chunks.length, status: `Published chunk ${sent}/${chunks.length}` };
    }

    nostrMessage.value = `Backup published to Nostr (${chunks.length} chunk${chunks.length === 1 ? "" : "s"}). Keep your relays reachable for restore.`;
  } catch (err) {
    console.error("Nostr backup failed", err);
    nostrError.value = err.message || "Nostr backup failed";
  } finally {
    nostrWorking.value = false;
  }
};

const restoreFromNostr = async () => {
  nostrWorking.value = true;
  nostrMessage.value = "";
  nostrError.value = "";
  nostrProgress.value = { current: 0, total: 0, status: "Fetching backup from relays..." };

  try {
    ensureNostrExtension();
    localStorage.setItem("nostr_relays", nostrRelayInput.value);

    const pubkey = await window.nostr.getPublicKey();
    const relayUrls = nostrRelays.value;
    if (relayUrls.length === 0) {
      throw new Error("Please provide at least one relay URL");
    }

    const allEventsArrays = await Promise.all(relayUrls.map((url) => fetchEventsFromRelay(url, pubkey)));
    const allEvents = allEventsArrays.flat();

    if (!allEvents.length) {
      throw new Error("No backup events found on the provided relays.");
    }

    const groups = new Map();
    for (const ev of allEvents) {
      const dTag = ev.tags.find((t) => t[0] === "d")?.[1];
      const iTag = ev.tags.find((t) => t[0] === "i")?.[1];
      if (!dTag || !iTag || !dTag.startsWith("zeronote-backup:")) continue;
      const [indexStr, totalStr] = iTag.split("/");
      const idx = Number(indexStr);
      const total = Number(totalStr);
      if (!Number.isFinite(idx) || !Number.isFinite(total)) continue;
      if (!groups.has(dTag)) {
        groups.set(dTag, { total, events: [], newest: ev.created_at || 0 });
      }
      const g = groups.get(dTag);
      g.events.push({ idx, total, ev });
      g.newest = Math.max(g.newest, ev.created_at || 0);
    }

    const completeGroups = Array.from(groups.entries())
      .filter(([, g]) => g.events.length === g.total)
      .sort((a, b) => b[1].newest - a[1].newest);

    if (!completeGroups.length) {
      throw new Error("No complete backup found. Make sure all chunks are available on your relays.");
    }

    const [selectedId, selected] = completeGroups[0];
    nostrProgress.value = { current: 0, total: selected.total, status: `Reassembling ${selectedId}` };

    selected.events.sort((a, b) => a.idx - b.idx);
    const combined = selected.events
      .map((e, i) => {
        nostrProgress.value = { current: i + 1, total: selected.total, status: `Reading chunk ${i + 1}/${selected.total}` };
        return e.ev.content || "";
      })
      .join("");

    const decrypted = decryptData(combined);
    if (!decrypted) {
      throw new Error("Failed to decrypt backup. Make sure you are logged in with the same master password.");
    }

    let parsed;
    try {
      parsed = JSON.parse(decrypted);
    } catch (e) {
      throw new Error("Backup content is invalid JSON.");
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Backup is empty or invalid.");
    }

    let restoredCount = 0;
    let skippedCount = 0;
    for (const note of parsed) {
      const existingNote = await db.notes.where({ id: note.id }).first();
      if (existingNote) {
        skippedCount++;
        continue;
      }

      await db.notes.add({
        id: note.id,
        content: encryptData(note.content),
        updatedAt: note.updatedAt,
        deletedAt: note.deletedAt,
        attachments:
          note.attachments?.map((att) => ({
            ...att,
            data: att.data ? base64ToArrayBuffer(att.data) : null,
          })) || [],
      });
      restoredCount++;
    }

    nostrMessage.value = `Restored ${restoredCount} note${restoredCount === 1 ? "" : "s"}${skippedCount ? ` (${skippedCount} skipped as duplicates)` : ""}. Reloading...`;
    setTimeout(() => location.reload(), 2000);
  } catch (err) {
    console.error("Nostr restore failed", err);
    nostrError.value = err.message || "Nostr restore failed";
  } finally {
    nostrWorking.value = false;
  }
};
</script>
