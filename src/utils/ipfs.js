const DEFAULT_IPFS_GATEWAY_BASE = "https://dweb.link/ipfs/";

export function getIpfsGatewayBase() {
  const envBase = import.meta?.env?.VITE_IPFS_GATEWAY_BASE;
  const base = (envBase && String(envBase).trim()) || DEFAULT_IPFS_GATEWAY_BASE;
  return base.endsWith("/") ? base : `${base}/`;
}

export function ipfsUrl(cid, { gatewayBase } = {}) {
  const base = gatewayBase || getIpfsGatewayBase();
  return `${base}${cid}`;
}

export async function fetchIpfsText(cid, { gatewayBase, signal } = {}) {
  const url = ipfsUrl(cid, { gatewayBase });
  const res = await fetch(url, { method: "GET", signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch IPFS content: ${res.status} ${text || ""}`.trim());
  }
  return res.text();
}

export function looksLikeIpfsCid(value) {
  if (!value) return false;
  const cid = String(value).trim();
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid) || /^bafy[a-z2-7]{50,}$/.test(cid);
}
