// All data lives in this browser's localStorage under one key.
const KEY = "keepsake.v1";

function seed() {
  const n = new Date().toISOString();
  const colId = crypto.randomUUID();
  return {
    collections: [{ id: colId, name: "My Toolbox", created: n, updated: n }],
    categories: ["Websites", "Apps", "Prompts"].map((name) => ({ id: crypto.randomUUID(), colId, name, created: n, updated: n })),
    items: [],
  };
}

export function loadState() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { return { state: seed(), warning: "Browser storage is blocked, so nothing can be saved in this session." }; }
  if (!raw) return { state: seed(), warning: "" };
  try {
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.collections) || !Array.isArray(s.categories) || !Array.isArray(s.items)) throw new Error("shape");
    return { state: s, warning: "" };
  } catch {
    // Never discard unreadable data: keep a copy before anything is overwritten.
    try { localStorage.setItem(KEY + ".backup", raw); } catch { /* ignore */ }
    return { state: seed(), warning: "Your saved data could not be read. A raw copy was kept in browser storage under “keepsake.v1.backup”." };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save (storage is full or blocked). Your last change was not applied." };
  }
}
