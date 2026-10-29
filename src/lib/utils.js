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
