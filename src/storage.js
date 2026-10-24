// Normal data lives in this browser's localStorage. Old v1 data is never deleted.
const KEY = "keepsake.v2";
const empty = () => ({ cats: [], groups: [], items: [] });

export function loadState() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { return { state: empty(), warning: "Browser storage is blocked, so nothing can be saved in this session." }; }
  if (!raw) return { state: empty(), warning: "" };
  try {
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.cats) || !Array.isArray(s.groups) || !Array.isArray(s.items)) throw new Error("shape");
    return { state: s, warning: "" };
  } catch {
    try { localStorage.setItem(KEY + ".backup", raw); } catch { /* ignore */ }
    return { state: empty(), warning: "Your saved data could not be read. A raw copy was kept under “keepsake.v2.backup”." };
  }
}
export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return { ok: true }; }
  catch { return { ok: false, error: "Could not save (storage is full or blocked). Your last change was not applied." }; }
}
