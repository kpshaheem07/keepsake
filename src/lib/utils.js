import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const fmt = (d) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through */ }
  const a = document.createElement("textarea");
  a.value = text; a.style.cssText = "position:fixed;opacity:0";
  document.body.append(a); a.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  a.remove();
  return ok;
}

export const byCreated = (a, b) => a.created.localeCompare(b.created);

export function resizeImage(file, max = 600) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Please choose an image file."));
    const r = new FileReader();
    r.onerror = () => reject(new Error("That image could not be read."));
    r.onload = () => {
      const im = new Image();
      im.onerror = () => reject(new Error("That image could not be read."));
      im.onload = () => {
        const s = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        const url = c.toDataURL("image/jpeg", 0.7);
        if (url.length > 700000) return reject(new Error("This image is too large. Please choose a smaller one."));
        resolve(url);
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

export function normalizeUrl(raw) {
  let u = raw.trim();
  if (!u) return { ok: true, url: "" };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) u = "https://" + u;
  try {
    const p = new URL(u);
    if (!/^https?:$/.test(p.protocol) || !p.hostname.includes(".")) throw new Error();
    return { ok: true, url: u };
  } catch {
    return { ok: false };
  }
}

const readDataUrl = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onerror = () => rej(new Error("That file could not be read.")); r.onload = () => res(r.result); r.readAsDataURL(file); });

// Files (PDF, TXT, images) are kept inside the free database, one record per file.
export const MAX_FILE = 740 * 1024;
export const MAX_FILES = 5;
export async function prepareFile(file) {
  const kb = Math.round(file.size / 1024);
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const isTxt = file.type === "text/plain" || /\.txt$/i.test(file.name);
  if (isPdf || isTxt) {
    if (file.size > MAX_FILE) throw new Error(`"${file.name}" is too big (${kb} KB). The limit is 740 KB.`);
    const type = isPdf ? "application/pdf" : "text/plain";
    const data = (await readDataUrl(file)).replace(/^data:[^;,]*/, "data:" + type);
    return { name: file.name, type, size: file.size, data };
  }
  if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" is not a PDF, TXT or image file.`);
  const src = await readDataUrl(file);
  const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(`"${file.name}" could not be read.`)); i.src = src; });
  for (const max of [1600, 1280, 1000, 800]) {
    const sc = Math.min(1, max / Math.max(im.width, im.height));
    const c = document.createElement("canvas"); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
    c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
    for (const q of [0.85, 0.75, 0.65, 0.5]) {
      const url = c.toDataURL("image/jpeg", q);
      if (url.length <= 960000) return { name: file.name.replace(/\.[^.]+$/, "") + ".jpg", type: "image/jpeg", size: Math.round(url.length * 0.75), data: url };
    }
  }
  throw new Error(`"${file.name}" is too large to save. Please choose a smaller one.`);
}
export const fileCount = (rows) => rows.reduce((n, r) => n + (r.fileMeta?.length || (r.file ? 1 : 0)), 0);
export const kbText = (n) => (n ? Math.max(1, Math.round(n / 1024)) + " KB" : "");
export function dataUrlToText(u) {
  const bin = atob(u.split(",")[1]), arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8").decode(arr);
}
export function dataUrlToBlob(u) {
  const [h, b] = u.split(",");
  const bin = atob(b), arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: (h.match(/:(.*?);/) || [])[1] || "application/octet-stream" });
}

// ---- Saving and opening files so it works on desktop, Android and iPhone/iPad ----
export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent || "") || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function canShareFiles() {
  try { const f = new File(["x"], "x.txt", { type: "text/plain" }); return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [f] })); }
  catch { return false; }
}
// Opens the phone's own share menu ("Save to Files", "Drive", ...).
export async function shareFile(name, dataUrl) {
  const blob = dataUrlToBlob(dataUrl);
  const f = new File([blob], name, { type: blob.type });
  try { await navigator.share({ files: [f], title: name }); return "shared"; }
  catch (e) { return e && e.name === "AbortError" ? "cancelled" : "failed"; }
}
// iPhone/iPad: share menu (it has "Save to Files"). Desktop and Android: normal download.
export async function saveFile(name, dataUrl) {
  if (isIOS() && canShareFiles()) {
    const r = await shareFile(name, dataUrl);
    if (r !== "failed") return r;
  }
  const url = URL.createObjectURL(dataUrlToBlob(dataUrl));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.style.display = "none";
  document.body.append(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 60000);
  return "downloaded";
}
// Opens the file in a new tab. If the phone blocks that, opens it in this tab (use Back to return).
export function openFile(dataUrl) {
  const url = URL.createObjectURL(dataUrlToBlob(dataUrl));
  const w = window.open(url, "_blank");
  if (!w) location.href = url;
  setTimeout(() => URL.revokeObjectURL(url), 300000);
}
