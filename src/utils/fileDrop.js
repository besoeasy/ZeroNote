const DEFAULT_FILEDROP_UPLOAD_URL = "https://filedrop.besoeasy.com/upload";

function getFileDropUploadUrl() {
  const envUrl = import.meta?.env?.VITE_FILEDROP_UPLOAD_URL;
  return (envUrl && String(envUrl).trim()) || DEFAULT_FILEDROP_UPLOAD_URL;
}

async function safeParseJson(response) {
  const text = await response.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

/**
 * Upload a File/Blob to File Drop.
 * Expected response shape (per file-drop README):
 * { status: 'success', cid, url, size, type, filename }
 */
export async function uploadToFileDrop(file, { uploadUrl } = {}) {
  const targetUrl = uploadUrl || getFileDropUploadUrl();

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(targetUrl, {
    method: "POST",
    body: form,
  });

  const { json, text } = await safeParseJson(res);

  if (!res.ok) {
    const message = json?.error || json?.message || text || `HTTP ${res.status}`;
    throw new Error(`FileDrop upload failed: ${message}`);
  }

  if (!json || json.status !== "success" || !json.url) {
    throw new Error("FileDrop upload failed: unexpected response");
  }

  return json;
}

export async function uploadNoteTextToFileDrop(
  noteText,
  {
    filename = `zeronote-${new Date().toISOString().replace(/[:.]/g, "-")}.md`,
    mimeType = "text/markdown",
    uploadUrl,
  } = {}
) {
  const blob = new Blob([noteText], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });
  return uploadToFileDrop(file, { uploadUrl });
}

export async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
