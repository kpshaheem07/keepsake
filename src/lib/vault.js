// Private lock. Everything inside is encrypted with AES-GCM (built into the browser).
// A random data key encrypts the data. That key is stored twice, each time locked by a
// different secret: (1) your password, (2) your Recovery code. Either one can open it.
const enc = new TextEncoder(), dec = new TextDecoder();
const ITER = 250000;
const rand = (n) => crypto.getRandomValues(new Uint8Array(n));
function b64(buf) { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode(...u.subarray(i, i + 8192)); return btoa(s); }
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function kek(secret, salt) {
  const base = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITER }, base,
    { name: "AES-GCM", length: 256 }, false, ["wrapKey", "unwrapKey"]);
}
async function wrap(dek, secret) {
  const salt = rand(16), iv = rand(12), k = await kek(secret, salt);
  const ct = await crypto.subtle.wrapKey("raw", dek, k, { name: "AES-GCM", iv });
  return { s: b64(salt), iv: b64(iv), ct: b64(ct) };
}
async function unwrap(w, secret) {
  const k = await kek(secret, unb64(w.s));
  return crypto.subtle.unwrapKey("raw", unb64(w.ct), k, { name: "AES-GCM", iv: unb64(w.iv) },
    { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}
export async function encryptData(dek, data) {
  const iv = rand(12);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, dek, enc.encode(JSON.stringify(data)));
  return { iv: b64(iv), ct: b64(ct) };
}
async function decryptData(dek, d) {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(d.iv) }, dek, unb64(d.ct));
  return JSON.parse(dec.decode(pt));
}

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid mistakes
export function newRecoveryCode() {
  const b = rand(24); let s = "";
  for (const x of b) s += ALPHA[x & 31];
  return s.match(/.{4}/g).join("-");
}
export const normCode = (c) => c.toUpperCase().replace(/[^A-Z2-9]/g, "");

export async function createVault(password) {
  const dek = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const recovery = newRecoveryCode();
  const data = { cats: [], items: [] };
  const meta = { v: 1, w1: await wrap(dek, password), w2: await wrap(dek, normCode(recovery)), d: await encryptData(dek, data) };
  return { meta, recovery, dek, data };
}
export async function openVault(meta, secret, useRecovery) {
  const dek = await unwrap(useRecovery ? meta.w2 : meta.w1, useRecovery ? normCode(secret) : secret);
  return { dek, data: await decryptData(dek, meta.d) };
}
export async function changePassword(meta, dek, newPassword) {
  return { ...meta, w1: await wrap(dek, newPassword) };
}

const KEY = "keepsake.vault.v1";
export function loadMeta() {
  let raw; try { raw = localStorage.getItem(KEY); } catch { return { status: "blocked" }; }
  if (!raw) return { status: "none" };
  try { const m = JSON.parse(raw); if (!m.w1 || !m.w2 || !m.d) throw 0; return { status: "locked", meta: m }; }
  catch { return { status: "broken" }; }
}
export function saveMeta(meta) { try { localStorage.setItem(KEY, JSON.stringify(meta)); return true; } catch { return false; } }
