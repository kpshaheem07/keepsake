import { useEffect, useRef, useState } from "react";
import { collection, doc, onSnapshot, query, where, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";
import { friendly } from "@/lib/errors";

const NAMES = ["cats", "groups", "items", "projects", "certs"];

// Live copy of your data from Firestore. Writes show up at once on this device
// (even offline) and upload when the internet is there.
export function useCloud(uid) {
  const rows = useRef({ cats: [], groups: [], items: [], projects: [], certs: [] });
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
  // Files live in their own records ("files"). Removed or replaced files are deleted automatically.
  const update = (mutate, adds = []) => {
    const old = rows.current, next = structuredClone(old);
    mutate(next);
    const ops = [];
    for (const n of NAMES) {
      const oldBy = new Map(old[n].map((r) => [r.id, r]));
      const ids = new Set();
      for (const r of next[n]) {
        ids.add(r.id);
        const o = oldBy.get(r.id);
        if (!o || JSON.stringify(o) !== JSON.stringify(r)) {
          ops.push({ n, id: r.id, data: r });
          const keep = new Set((r.fileMeta || []).map((m) => m.id));
          for (const m of o?.fileMeta || []) if (!keep.has(m.id)) ops.push({ n: "files", id: m.id, del: true });
        }
      }
      for (const [id, o] of oldBy) if (!ids.has(id)) {
        ops.push({ n, id, del: true });
        for (const m of o.fileMeta || []) ops.push({ n: "files", id: m.id, del: true });
      }
    }
    for (const a of adds) ops.push({ n: "files", id: a.id, data: a.data });
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

// Files of ONE item, loaded only when you open it.
export function useFiles(uid, ownerId, enabled) {
  const [files, setFiles] = useState({});
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!enabled) return;
    const q = query(collection(db, "users", uid, "files"), where("ownerId", "==", ownerId));
    return onSnapshot(q, (snap) => setFiles(Object.fromEntries(snap.docs.map((d) => [d.id, { ...d.data(), id: d.id }]))), (e) => setErr(friendly(e)));
  }, [uid, ownerId, enabled]);
  return { files, err };
}
