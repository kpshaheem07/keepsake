import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { createVault, openVault, changePassword, encryptData, decryptData } from "@/lib/vault";
import { friendly } from "@/lib/errors";

// The lock lives in ONE Firestore document. Only scrambled (encrypted) text is sent.
export function useVault(uid, onError) {
  const meta = useRef(null), dek = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | none | locked | open | error
  const [data, setData] = useState(null);
  const ref = doc(db, "users", uid, "private", "vault");
  const put = (m) => setDoc(ref, { meta: m }).catch((e) => onError(friendly(e)));

  useEffect(() => onSnapshot(ref, async (snap) => {
    if (!snap.exists()) {
      meta.current = null;
      // Only trust "no lock yet" when the server said so, so we never overwrite a real lock.
      if (!snap.metadata.fromCache) setStatus((s) => (s === "open" ? s : "none"));
      return;
    }
    const m = snap.data().meta;
    const remote = !!meta.current && meta.current.d.ct !== m.d.ct;
    meta.current = m;
    setStatus((s) => (s === "loading" || s === "none" ? "locked" : s));
    if (dek.current && remote && !snap.metadata.hasPendingWrites) { try { setData(await decryptData(dek.current, m.d)); } catch { /* keep current */ } }
  }, () => setStatus("error")), [uid]);

  const open = (m, k, d) => { meta.current = m; dek.current = k; setData(d); setStatus("open"); };

  return {
    status, data,
    async prepare(password) {
      const v = await createVault(password);
      return { recovery: v.recovery, commit: async () => { put(v.meta); open(v.meta, v.dek, v.data); return ""; } };
    },
    async unlock(password) {
      try { const r = await openVault(meta.current, password, false); open(meta.current, r.dek, r.data); return ""; }
      catch { return "Wrong password."; }
    },
    async recover(code, newPassword) {
      try {
        const r = await openVault(meta.current, code, true);
        const m = await changePassword(meta.current, r.dek, newPassword);
        put(m); open(m, r.dek, r.data); return "";
      } catch { return "That Recovery code is not correct."; }
    },
    importMeta(m) { meta.current = m; put(m); setStatus("locked"); },
    lock() { dek.current = null; setData(null); if (meta.current) setStatus("locked"); },
    async update(mutate) {
      const next = structuredClone(data); mutate(next);
      const m = { ...meta.current, d: await encryptData(dek.current, next) };
      put(m); meta.current = m; setData(next); return true;
    },
  };
}
