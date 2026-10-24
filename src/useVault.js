import { useRef, useState } from "react";
import { createVault, openVault, changePassword, encryptData, loadMeta, saveMeta } from "@/lib/vault";

export function useVault() {
  const first = useRef(null);
  if (!first.current) first.current = loadMeta();
  const meta = useRef(first.current.meta || null);
  const dek = useRef(null);
  const [status, setStatus] = useState(first.current.status); // none | locked | open | broken | blocked
  const [data, setData] = useState(null);

  const open = (m, k, d) => { meta.current = m; dek.current = k; setData(d); setStatus("open"); };

  return {
    status, data,
    // Make a new lock in memory. Nothing is saved until commit() is called.
    async prepare(password) {
      const v = await createVault(password);
      return { recovery: v.recovery, commit: async () => { if (!saveMeta(v.meta)) return "Could not save the lock (storage full or blocked)."; open(v.meta, v.dek, v.data); return ""; } };
    },
    async unlock(password) {
      try { const r = await openVault(meta.current, password, false); open(meta.current, r.dek, r.data); return ""; }
      catch { return "Wrong password."; }
    },
    async recover(code, newPassword) {
      try {
        const r = await openVault(meta.current, code, true);
        const m = await changePassword(meta.current, r.dek, newPassword);
        if (!saveMeta(m)) return "Could not save the new password (storage full or blocked).";
        open(m, r.dek, r.data); return "";
      } catch { return "That Recovery code is not correct."; }
    },
    lock() { dek.current = null; setData(null); if (meta.current) setStatus("locked"); },
    // Change the private data, encrypt it, save it. Only shows the change if saving worked.
    async update(mutate) {
      const next = structuredClone(data); mutate(next);
      const m = { ...meta.current, d: await encryptData(dek.current, next) };
      if (!saveMeta(m)) return false;
      meta.current = m; setData(next); return true;
    },
  };
}
