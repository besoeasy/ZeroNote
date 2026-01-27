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

export async function encryptNoteText(noteText, shareKey) {
  if (!shareKey) throw new Error("Missing share key");

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const key = await importAesKeyFromShareKey(shareKey);
  const plaintext = new TextEncoder().encode(String(noteText || ""));

  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  const cipherBytes = new Uint8Array(cipherBuffer);

  return {
    zn: "enc-v1",
    alg: "A256GCM",
    iv: bytesToBase64Url(iv),
    ct: bytesToBase64Url(cipherBytes),
    mime: "text/markdown",
  };
}

export async function decryptNotePayload(payload, shareKey) {
  if (!payload || payload.zn !== "enc-v1" || !payload.iv || !payload.ct) {
    throw new Error("Unsupported encrypted payload");
  }
  if (!shareKey) throw new Error("Missing share key");

  const key = await importAesKeyFromShareKey(shareKey);
  const iv = base64UrlToBytes(payload.iv);
  const ct = base64UrlToBytes(payload.ct);

  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(plainBuffer);
}

export function isEncryptedNotePayloadString(text) {
  if (!text) return false;
  const trimmed = String(text).trim();
  return trimmed.startsWith("{") && trimmed.includes('"zn"') && trimmed.includes("enc-v1");
}
