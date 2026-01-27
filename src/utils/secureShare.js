function bytesToBase64Url(bytes) {
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(b64url) {
  const b64 = String(b64url).replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function generateShareKey() {
  const keyBytes = new Uint8Array(32);
  crypto.getRandomValues(keyBytes);
  return bytesToBase64Url(keyBytes);
}

async function importAesKeyFromShareKey(shareKey) {
  const raw = base64UrlToBytes(shareKey);
  if (raw.byteLength !== 32) {
    throw new Error("Invalid key length");
  }
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptBytes(plainBytes, shareKey) {
  if (!shareKey) throw new Error("Missing share key");

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const key = await importAesKeyFromShareKey(shareKey);
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plainBytes);
  const cipherBytes = new Uint8Array(cipherBuffer);

  return { iv, cipherBytes };
}

async function decryptBytes(cipherBytes, iv, shareKey) {
  if (!shareKey) throw new Error("Missing share key");
  const key = await importAesKeyFromShareKey(shareKey);
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBytes);
  return new Uint8Array(plainBuffer);
}

export async function encryptJsonPayload(data, shareKey, { mime = "application/json" } = {}) {
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const { iv, cipherBytes } = await encryptBytes(plaintext, shareKey);

  return {
    zn: "enc-v1",
    alg: "A256GCM",
    iv: bytesToBase64Url(iv),
    ct: bytesToBase64Url(cipherBytes),
    mime,
  };
}

export async function decryptJsonPayload(payload, shareKey) {
  const text = await decryptNotePayload(payload, shareKey);
  return JSON.parse(text);
}

export async function encryptNoteText(noteText, shareKey) {
  return encryptJsonPayload({ content: String(noteText || "") }, shareKey, { mime: "application/json" });
}

export async function decryptNotePayload(payload, shareKey) {
  if (!payload || payload.zn !== "enc-v1" || !payload.iv || !payload.ct) {
    throw new Error("Unsupported encrypted payload");
  }
  if (!shareKey) throw new Error("Missing share key");

  const iv = base64UrlToBytes(payload.iv);
  const ct = base64UrlToBytes(payload.ct);
  const plainBytes = await decryptBytes(ct, iv, shareKey);
  return new TextDecoder().decode(plainBytes);
}

// Opaque binary format for attachments:
// bytes = [12-byte IV][ciphertext+tag]
export async function encryptOpaqueBinary(plainBytes, shareKey) {
  const { iv, cipherBytes } = await encryptBytes(plainBytes, shareKey);
  const out = new Uint8Array(iv.byteLength + cipherBytes.byteLength);
  out.set(iv, 0);
  out.set(cipherBytes, iv.byteLength);
  return out;
}

export async function decryptOpaqueBinary(encryptedBytes, shareKey) {
  const bytes = encryptedBytes instanceof Uint8Array ? encryptedBytes : new Uint8Array(encryptedBytes);
  if (bytes.byteLength < 13) {
    throw new Error("Invalid encrypted attachment");
  }
  const iv = bytes.slice(0, 12);
  const ct = bytes.slice(12);
  return decryptBytes(ct, iv, shareKey);
}

export function isEncryptedNotePayloadString(text) {
  if (!text) return false;
  const trimmed = String(text).trim();
  return trimmed.startsWith("{") && trimmed.includes('"zn"') && trimmed.includes("enc-v1");
}
