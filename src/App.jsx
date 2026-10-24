import { useRef, useState } from "react";
import Home from "@/components/Home.jsx";
import Collection from "@/components/Collection.jsx";
import NameDialog from "@/components/NameDialog.jsx";
import { loadState, saveState } from "@/storage";
import { uid } from "@/lib/utils";

export default function App() {
  const init = useRef(null);
  if (!init.current) init.current = loadState();
  const [S, setS] = useState(init.current.state);
  const [warn] = useState(init.current.warning);
  const [saveErr, setSaveErr] = useState("");
  const [colId, setColId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef();

  const notify = (m) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 1800); };

  // Apply a change to a copy, save it, and only then show it. A failed save changes nothing.
  const update = (mutate) => {
    const next = structuredClone(S);
    mutate(next);
    const r = saveState(next);
    if (!r.ok) { setSaveErr(r.error); return false; }
    setSaveErr(""); setS(next);
    return true;
  };

  const col = S.collections.find((c) => c.id === colId);
  const counts = {};
  for (const c of S.collections) {
    const ids = S.categories.filter((k) => k.colId === c.id).map((k) => k.id);
    counts[c.id] = S.items.filter((i) => ids.includes(i.catId)).length;
  }

  return (
    <div className="wrap">
      <nav><button className="logo px" aria-label="Keepsake home" onClick={() => setColId(null)}>KEEPSAKE</button></nav>
      {(warn || saveErr) && <div className="banner" role="alert">{saveErr || warn}</div>}
      {col
        ? <Collection key={col.id} S={S} col={col} update={update} notify={notify} onBack={() => setColId(null)} onGone={() => setColId(null)} />
        : <Home collections={S.collections} counts={counts} onOpen={setColId} onAdd={() => setAdding(true)} />}
      {adding && <NameDialog title="New collection" onClose={() => setAdding(false)}
        onSave={(v) => { const n = new Date().toISOString(); if (update((s) => { s.collections.push({ id: uid(), name: v, created: n, updated: n }); })) setAdding(false); }} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
