import { useEffect, useRef, useState } from "react";
import { collection, doc, onSnapshot, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";
import { friendly } from "@/lib/errors";

const NAMES = ["cats", "groups", "items"];

// Live copy of your data from Firestore. Writes show up at once on this device
// (even offline) and upload when the internet is there.
export function useCloud(uid) {
  const rows = useRef({ cats: [], groups: [], items: [] });
  const [S, setS] = useState(rows.current);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const got = useRef({}); const pend = useRef({});

  useEffect(() => {
    const done = (n) => { got.current[n] = true; if (NAMES.every((x) => got.current[x])) setReady(true); };
    const timer = setTimeout(() => setReady(true), 4000); // offline on a new device
    const un = NAMES.map((n) => onSnapshot(collection(db, "users", uid, n), (snap) => {
      rows.current = { ...rows.current, [n]: snap.docs.map((d) => ({ ...d.data(), id: d.id })) };
      setS(rows.current);
      pend.current[n] = snap.metadata.hasPendingWrites; setPending(Object.values(pend.current).some(Boolean));
      if (!snap.metadata.fromCache || snap.docs.length) done(n);
      setError("");
    }, (e) => setError(friendly(e))));
    return () => { clearTimeout(timer); un.forEach((f) => f()); };
  }, [uid]);

  // Change a copy, find what is different, write only that.
  const update = (mutate) => {
    const old = rows.current, next = structuredClone(old);
    mutate(next);
    const ops = [];
    for (const n of NAMES) {
      const before = new Map(old[n].map((r) => [r.id, JSON.stringify(r)]));
      const ids = new Set();
      for (const r of next[n]) { ids.add(r.id); if (before.get(r.id) !== JSON.stringify(r)) ops.push({ n, id: r.id, data: r }); }
      for (const id of before.keys()) if (!ids.has(id)) ops.push({ n, id, del: true });
    }
    for (let i = 0; i < ops.length; i += 400) {
      const b = writeBatch(db);
      for (const o of ops.slice(i, i + 400)) {
        const ref = doc(db, "users", uid, o.n, o.id);
        o.del ? b.delete(ref) : b.set(ref, o.data);
      }
      b.commit().catch((e) => setError(friendly(e)));
    }
    return true;
  };
  return { S, ready, pending, error, update };
}
