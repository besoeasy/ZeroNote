<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8 pt-16 md:pt-8 space-y-6">
    <header class="text-center space-y-3">
      <p class="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-700 bg-purple-100 rounded-full">Experimental</p>
      <h1 class="text-3xl md:text-5xl font-black text-gray-900">Nostr Sync</h1>
      <p class="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">Sync your notes to Nostr relays via your browser extension (NIP-07). Each note is published as a separate event with smart attachment chunking. Data stays encrypted with your master password.</p>
    </header>

    <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      <div class="flex items-start gap-3">
        <div class="p-3 bg-purple-100 rounded-xl">
          <CloudUpload class="w-6 h-6 text-purple-700" />
        </div>
        <div class="flex-1 space-y-2">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h2 class="text-xl font-semibold text-gray-900">Sync Notes to Relays</h2>
            <span class="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">NIP-07 extension required</span>
          </div>
          <p class="text-sm text-gray-600">Each note is a replaceable `kind:30078` app-data event. Large attachments are automatically chunked. Incremental sync updates only changed notes.</p>
        </div>
      </div>

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
        <div class="grid grid-cols-1 gap-2">
          <button
            @click="syncNostr"
            :disabled="nostrWorking"
            class="inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
          >
            <CloudUpload class="w-5 h-5 mr-2" />
            {{ nostrWorking ? 'Syncing...' : 'Sync' }}
          </button>
        </div>
      </div>

      <div v-if="nostrProgress.total" class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm animate-pulse">
        <p class="font-medium text-gray-800">{{ nostrProgress.status }}</p>
        <p class="text-xs text-gray-600">{{ nostrProgress.current }} / {{ nostrProgress.total }} {{ nostrProgress.unit || 'item' }}{{ nostrProgress.total === 1 ? '' : 's' }}</p>
      </div>

      <div v-if="chunkProgress.total" class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p class="font-medium text-blue-800">{{ chunkProgress.status }}</p>
        <p class="text-xs text-blue-600">{{ chunkProgress.current }} / {{ chunkProgress.total }} chunk{{ chunkProgress.total === 1 ? '' : 's' }}</p>
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
const nostrProgress = ref({ current: 0, total: 0, status: "", unit: "note" });
const chunkProgress = ref({ current: 0, total: 0, status: "" });

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

const ensureNostrExtension = () => {
  if (typeof window === "undefined" || !window.nostr || typeof window.nostr.signEvent !== "function") {
    throw new Error("Nostr browser extension not found. Please install a NIP-07 extension and try again.");
  }
};

// Sign a Nostr event via NIP-07 extension
const signEventWithExtension = async (baseEvent) => {
  ensureNostrExtension();
  try {
    const signed = await window.nostr.signEvent(baseEvent);
    if (!signed || !signed.id || !signed.sig) {
      throw new Error("Failed to sign event: missing id/sig");
    }
    return signed;
  } catch (e) {
    throw new Error(e?.message || "Failed to sign event");
  }
};

const ATTACHMENT_INLINE_THRESHOLD = 3 * 1024; // 3KB inline max
const ATTACHMENT_CHUNK_SIZE = 3000; // ~3KB per chunk (base64 chars)

const prepareNoteForPublish = async (note) => {
  const decryptedContent = decryptData(note.content);
  const notePayload = {
    id: note.id,
    content: decryptedContent,
    updatedAt: note.updatedAt,
    deletedAt: note.deletedAt,
    attachments: [],
    attachmentChunks: [], // Track which chunks this note has
  };

  for (const att of note.attachments || []) {
    const attSize = att.data?.byteLength || 0;
    
    if (attSize === 0) {
      // No data, just preserve metadata
      notePayload.attachments.push({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        uploadedAt: att.uploadedAt,
      });
    } else if (attSize < ATTACHMENT_INLINE_THRESHOLD) {
      // Small attachment - inline as base64
      notePayload.attachments.push({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        uploadedAt: att.uploadedAt,
        data: arrayBufferToBase64(att.data),
      });
    } else {
      // Large attachment - will be chunked
      const encrypted = encryptData(new TextDecoder().decode(new Uint8Array(att.data)));
      const encryptedBytes = new TextEncoder().encode(encrypted);
      const base64Encrypted = arrayBufferToBase64(encryptedBytes);
      
      // Split into chunks
      const chunks = [];
      for (let i = 0; i < base64Encrypted.length; i += ATTACHMENT_CHUNK_SIZE) {
        chunks.push(base64Encrypted.slice(i, i + ATTACHMENT_CHUNK_SIZE));
      }
      
      // Store metadata with chunk count
      notePayload.attachments.push({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        uploadedAt: att.uploadedAt,
        chunkCount: chunks.length,
        chunked: true,
      });
      
      // Track chunk indices for publishing
      for (let i = 0; i < chunks.length; i++) {
        notePayload.attachmentChunks.push({
          attachmentId: att.id,
          chunkIndex: i,
          data: chunks[i],
        });
      }
    }
  }

  return notePayload;
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

const fetchEventsFromRelay = (relayUrl, pubkey, dTagPrefix = "zeronote-note:") =>
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
    }, 8000);

    ws.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(events);
      }
    };

    ws.onopen = () => {
      const filter = {
        kinds: [30078],
        authors: [pubkey],
        limit: 2000,
      };

      // Add d tag prefix filter if needed (note: not all relays support prefix matching)
      if (dTagPrefix) {
        filter["#d"] = [dTagPrefix]; // Some relays support this for prefix matching
      }

      ws.send(JSON.stringify(["REQ", subId, filter]));
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (Array.isArray(data) && data[0] === "EVENT" && data[1] === subId) {
          const ev = data[2];
          const dTag = ev.tags?.find((t) => t[0] === "d")?.[1];
          // Client-side filter since not all relays support prefix matching
          if (!dTagPrefix) {
            events.push(ev);
          } else if (dTag && dTag.startsWith(dTagPrefix)) {
            events.push(ev);
          }
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

const backupToNostr = async () => {
  nostrWorking.value = true;
  nostrMessage.value = "";
  nostrError.value = "";
  nostrProgress.value = { current: 0, total: 0, status: "Preparing notes...", unit: "note" };

  try {
    ensureNostrExtension();
    localStorage.setItem("nostr_relays", nostrRelayInput.value);

    const pubkey = await window.nostr.getPublicKey();
    const relayUrls = nostrRelays.value;
    if (relayUrls.length === 0) {
      throw new Error("Please provide at least one relay URL");
    }

    const notes = await db.notes.toArray(); // Include deleted notes
    if (notes.length === 0) {
      throw new Error("No notes to sync.");
    }

    nostrProgress.value = { current: 0, total: notes.length, status: "Publishing notes...", unit: "note" };

    let published = 0;

    for (const note of notes) {
      const notePayload = await prepareNoteForPublish(note);
      
      // Encrypt the entire note payload
      const encryptedContent = encryptData(JSON.stringify(notePayload));

      // Publish main note event
      const noteEvent = {
        kind: 30078,
        created_at: Math.floor((note.updatedAt || Date.now()) / 1000),
        tags: [
          ["d", `zeronote-note:${note.id}`],
          ["v", "1"],
          ["app", "ZeroNote"],
          ["updated_at", String(note.updatedAt)],
        ],
        content: encryptedContent,
        pubkey,
      };

      const signedNote = await signEventWithExtension(noteEvent);
      const noteResults = await Promise.allSettled(relayUrls.map((url) => publishToRelay(url, signedNote)));
      const noteOk = noteResults.some((r) => r.status === "fulfilled");
      
      if (!noteOk) {
        console.warn(`Failed to publish note ${note.id} to any relay`);
      }

      // Publish attachment chunks if any
      const chunks = notePayload.attachmentChunks || [];
      if (chunks.length > 0) {
        chunkProgress.value = { current: 0, total: chunks.length, status: `Uploading ${chunks.length} chunks for note ${published + 1}/${notes.length}` };
        
        for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
          const chunkInfo = chunks[chunkIdx];
          const chunkEvent = {
            kind: 30078,
            created_at: Math.floor((note.updatedAt || Date.now()) / 1000),
            tags: [
              ["d", `zeronote-attachment:${note.id}:${chunkInfo.attachmentId}:${chunkInfo.chunkIndex}`],
              ["v", "1"],
              ["app", "ZeroNote"],
              ["parent", `zeronote-note:${note.id}`],
            ],
            content: chunkInfo.data, // Already base64 encrypted
            pubkey,
          };

          const signedChunk = await signEventWithExtension(chunkEvent);
          await Promise.allSettled(relayUrls.map((url) => publishToRelay(url, signedChunk)));
          
          chunkProgress.value = {
            current: chunkIdx + 1,
            total: chunks.length,
            status: `Uploading ${chunkIdx + 1}/${chunks.length} chunks for note ${published + 1}/${notes.length}`,
          };
        }
      }

      published++;
      chunkProgress.value = { current: 0, total: 0, status: "" };
      nostrProgress.value = {
        current: published,
        total: notes.length,
        status: `Published ${published}/${notes.length} notes`,
        unit: "note",
      };
    }

    nostrMessage.value = `Successfully synced ${published} note${published === 1 ? "" : "s"} to Nostr.`;
  } catch (err) {
    console.error("Nostr sync failed", err);
    nostrError.value = err.message || "Nostr sync failed";
  } finally {
    nostrWorking.value = false;
  }
};

const restoreFromNostr = async () => {
  nostrWorking.value = true;
  nostrMessage.value = "";
  nostrError.value = "";
  nostrProgress.value = { current: 0, total: 0, status: "Fetching notes from relays...", unit: "note" };

  try {
    ensureNostrExtension();
    localStorage.setItem("nostr_relays", nostrRelayInput.value);

    const pubkey = await window.nostr.getPublicKey();
    const relayUrls = nostrRelays.value;
    if (relayUrls.length === 0) {
      throw new Error("Please provide at least one relay URL");
    }

    // Fetch all note events
    const allEventsArrays = await Promise.all(
      relayUrls.map((url) => fetchEventsFromRelay(url, pubkey, "zeronote-note:"))
    );
    let noteEvents = allEventsArrays.flat();

    if (!noteEvents.length) {
      // Fallback: fetch all author events and filter client-side
      const broadEventsArrays = await Promise.all(
        relayUrls.map((url) => fetchEventsFromRelay(url, pubkey, null))
      );
      const broadEvents = broadEventsArrays.flat();
      noteEvents = broadEvents.filter((ev) => {
        const dTag = ev.tags?.find((t) => t[0] === "d")?.[1];
        const appTag = ev.tags?.find((t) => t[0] === "app")?.[1];
        return dTag?.startsWith("zeronote-note:") && appTag === "ZeroNote";
      });

      if (!noteEvents.length) {
        throw new Error(
          "No notes found on the provided relays. Ensure you synced notes first, you're using the same Nostr key, and relays are reachable."
        );
      }
    }

    nostrProgress.value = { current: 0, total: noteEvents.length, status: "Processing notes...", unit: "note" };

    // Deduplicate by d tag (keep newest)
    const notesByDTag = new Map();
    for (const ev of noteEvents) {
      const dTag = ev.tags.find((t) => t[0] === "d")?.[1];
      if (!dTag || !dTag.startsWith("zeronote-note:")) continue;

      const existing = notesByDTag.get(dTag);
      if (!existing || (ev.created_at || 0) > (existing.created_at || 0)) {
        notesByDTag.set(dTag, ev);
      }
    }

    const uniqueNotes = Array.from(notesByDTag.values());
    let restoredCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < uniqueNotes.length; i++) {
      const ev = uniqueNotes[i];
      const dTag = ev.tags.find((t) => t[0] === "d")?.[1];
      const noteId = dTag.replace("zeronote-note:", "");
      
      nostrProgress.value = {
        current: i + 1,
        total: uniqueNotes.length,
        status: `Processing note ${i + 1}/${uniqueNotes.length}`,
        unit: "note",
      };

      // Decrypt note content
      const decrypted = decryptData(ev.content);
      if (!decrypted) {
        console.warn(`Failed to decrypt note ${noteId}`);
        skippedCount++;
        continue;
      }

      let notePayload;
      try {
        notePayload = JSON.parse(decrypted);
      } catch (e) {
        console.warn(`Invalid JSON for note ${noteId}`);
        skippedCount++;
        continue;
      }

      // Handle attachments
      for (const att of notePayload.attachments || []) {
        if (att.chunked && att.chunkCount > 0) {
          // Fetch chunks for this attachment from relays
          const chunkPattern = `zeronote-attachment:${noteId}:${att.id}:`;
          chunkProgress.value = { current: 0, total: att.chunkCount, status: `Downloading ${att.chunkCount} chunks for ${att.name}` };
          
          const chunkEventArrays = await Promise.all(
            relayUrls.map((url) => fetchEventsFromRelay(url, pubkey, chunkPattern))
          );
          const chunkEvents = chunkEventArrays.flat();
          
          if (chunkEvents.length === att.chunkCount) {
            // Parse and sort chunks
            const chunks = chunkEvents
              .map((ev) => {
                const dTag = ev.tags.find((t) => t[0] === "d")?.[1] || "";
                const parts = dTag.split(":");
                const chunkIndex = parseInt(parts[3]) || 0;
                return { index: chunkIndex, data: ev.content };
              })
              .sort((a, b) => a.index - b.index);

            // Reassemble base64
            const base64Encrypted = chunks.map((c) => c.data).join("");
            // Decode from base64 to encrypted bytes
            const encryptedBytes = base64ToArrayBuffer(base64Encrypted);
            // Decode encrypted bytes to string
            const encryptedString = new TextDecoder().decode(new Uint8Array(encryptedBytes));
            // Decrypt
            const decrypted = decryptData(encryptedString);
            // Store as UTF-8 bytes for storage
            att.data = new TextEncoder().encode(decrypted);
            delete att.chunked;
            delete att.chunkCount;
            
            chunkProgress.value = { current: att.chunkCount, total: att.chunkCount, status: `Downloaded ${att.chunkCount} chunks for ${att.name}` };
          } else {
            console.warn(`Incomplete chunks for attachment ${att.id}: got ${chunkEvents.length}, expected ${att.chunkCount}`);
            chunkProgress.value = { current: 0, total: 0, status: "" };
          }
        }
      }
      chunkProgress.value = { current: 0, total: 0, status: "" };

      // Check if note exists locally
      const existingNote = await db.notes.where({ id: noteId }).first();

      if (existingNote) {
        // Update if remote is newer
        if (notePayload.updatedAt > existingNote.updatedAt) {
          await db.notes.update(noteId, {
            content: encryptData(notePayload.content),
            updatedAt: notePayload.updatedAt,
            deletedAt: notePayload.deletedAt,
            attachments: notePayload.attachments.map((att) => ({
              ...att,
              data: att.data ? base64ToArrayBuffer(att.data) : null,
            })),
          });
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        // Add new note
        await db.notes.add({
          id: noteId,
          content: encryptData(notePayload.content),
          updatedAt: notePayload.updatedAt,
          deletedAt: notePayload.deletedAt,
          attachments: notePayload.attachments.map((att) => ({
            ...att,
            data: att.data ? base64ToArrayBuffer(att.data) : null,
          })),
        });
        restoredCount++;
      }
    }

    const summary = [];
    if (restoredCount > 0) summary.push(`${restoredCount} new`);
    if (updatedCount > 0) summary.push(`${updatedCount} updated`);
    if (skippedCount > 0) summary.push(`${skippedCount} skipped`);

    nostrMessage.value = `Sync complete: ${summary.join(", ")} note${summary.length > 1 ? "s" : ""}. Reloading...`;
    setTimeout(() => location.reload(), 2000);
  } catch (err) {
    console.error("Nostr sync failed", err);
    nostrError.value = err.message || "Nostr sync failed";
  } finally {
    nostrWorking.value = false;
  }
};

// Unified sync: upload all notes
const syncNostr = async () => {
  nostrWorking.value = true;
  nostrMessage.value = "";
  nostrError.value = "";
  nostrProgress.value = { current: 0, total: 0, status: "Publishing notes...", unit: "note" };
  chunkProgress.value = { current: 0, total: 0, status: "" };

  try {
    ensureNostrExtension();
    localStorage.setItem("nostr_relays", nostrRelayInput.value);

    const pubkey = await window.nostr.getPublicKey();
    const relayUrls = nostrRelays.value;
    if (relayUrls.length === 0) {
      throw new Error("Please provide at least one relay URL");
    }

    const notes = await db.notes.toArray();
    if (notes.length === 0) {
      throw new Error("No notes to sync.");
    }

    nostrProgress.value = { current: 0, total: notes.length, status: "Publishing notes...", unit: "note" };

    let published = 0;

    for (const note of notes) {
      const notePayload = await prepareNoteForPublish(note);
      
      // Encrypt the entire note payload
      const encryptedContent = encryptData(JSON.stringify(notePayload));

      // Publish main note event
      const noteEvent = {
        kind: 30078,
        created_at: Math.floor((note.updatedAt || Date.now()) / 1000),
        tags: [
          ["d", `zeronote-note:${note.id}`],
          ["v", "1"],
          ["app", "ZeroNote"],
          ["updated_at", String(note.updatedAt)],
        ],
        content: encryptedContent,
        pubkey,
      };

      const signedNote = await signEventWithExtension(noteEvent);
      const noteResults = await Promise.allSettled(relayUrls.map((url) => publishToRelay(url, signedNote)));
      const noteOk = noteResults.some((r) => r.status === "fulfilled");
      
      if (!noteOk) {
        console.warn(`Failed to publish note ${note.id} to any relay`);
      }

      // Publish attachment chunks if any
      const chunks = notePayload.attachmentChunks || [];
      if (chunks.length > 0) {
        chunkProgress.value = { current: 0, total: chunks.length, status: `Uploading ${chunks.length} chunks for note ${published + 1}/${notes.length}` };
        
        for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
          const chunkInfo = chunks[chunkIdx];
          const chunkEvent = {
            kind: 30078,
            created_at: Math.floor((note.updatedAt || Date.now()) / 1000),
            tags: [
              ["d", `zeronote-attachment:${note.id}:${chunkInfo.attachmentId}:${chunkInfo.chunkIndex}`],
              ["v", "1"],
              ["app", "ZeroNote"],
              ["parent", `zeronote-note:${note.id}`],
            ],
            content: chunkInfo.data,
            pubkey,
          };

          const signedChunk = await signEventWithExtension(chunkEvent);
          await Promise.allSettled(relayUrls.map((url) => publishToRelay(url, signedChunk)));
          
          chunkProgress.value = {
            current: chunkIdx + 1,
            total: chunks.length,
            status: `Uploading ${chunkIdx + 1}/${chunks.length} chunks for note ${published + 1}/${notes.length}`,
          };
        }
      }

      published++;
      chunkProgress.value = { current: 0, total: 0, status: "" };
      nostrProgress.value = {
        current: published,
        total: notes.length,
        status: `Published ${published}/${notes.length} notes`,
        unit: "note",
      };
    }

    nostrMessage.value = `Successfully synced ${published} note${published === 1 ? "" : "s"} to Nostr.`;
  } catch (err) {
    console.error("Nostr sync failed", err);
    nostrError.value = err.message || "Nostr sync failed";
  } finally {
    nostrWorking.value = false;
  }
};
</script>

