import { useMemo, useState } from "react";
import ItemCard from "./ItemCard.jsx";
import ItemDialog from "./ItemDialog.jsx";
import NameDialog from "./NameDialog.jsx";
import { uid, copyText } from "@/lib/utils";

export default function Collection({ S, col, update, notify, onBack, onGone }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [dlg, setDlg] = useState(null);
  const cats = S.categories.filter((k) => k.colId === col.id);
  const ids = cats.map((k) => k.id);
  const cur = cats.find((k) => k.id === cat);
  const now = () => new Date().toISOString();
  const close = () => setDlg(null);

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    return S.items
      .filter((i) => ids.includes(i.catId) && (cat === "all" || i.catId === cat) &&
        (!s || [i.title, i.desc, i.note, i.url].join(" ").toLowerCase().includes(s)))
      .sort((a, b) => b.updated.localeCompare(a.updated));
  }, [S.items, ids.join(), cat, q]);

  const copy = async (t, label) => notify((await copyText(t)) ? `${label} copied` : "Copy failed — select the text manually");

  const saveItem = (item) => (f) => {
    const n = now();
    const ok = update((s) => {
      if (item) s.items = s.items.map((x) => (x.id === item.id ? { ...x, ...f, updated: n } : x));
      else s.items.push({ id: uid(), ...f, created: n, updated: n });
    });
    if (!ok) return "Could not save. Nothing was changed.";
    close(); notify("Saved");
  };

  return (
    <>
      <div className="bar">
        <button className="btn sm" onClick={onBack}>← Back</button>
        <h2 className="px" style={{ margin: 0, flex: 1 }}>{col.name}</h2>
        <button className="btn sm" onClick={() => setDlg({ t: "colRename" })}>Rename</button>
        <button className="btn sm d" onClick={() => {
          const n = S.items.filter((i) => ids.includes(i.catId)).length;
          if (confirm(`Delete collection "${col.name}" with ${cats.length} categories and ${n} items? This cannot be undone.`))
            if (update((s) => { s.items = s.items.filter((i) => !ids.includes(i.catId)); s.categories = s.categories.filter((k) => k.colId !== col.id); s.collections = s.collections.filter((c) => c.id !== col.id); })) onGone();
        }}>Delete</button>
      </div>

      <div className="bar">
        <input type="search" aria-label="Search items" placeholder="Search title, text, note or URL…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn y" onClick={() => cats.length ? setDlg({ t: "item", item: null }) : notify("Create a category first")}>+ Add item</button>
      </div>

      <div className="tabs" role="group" aria-label="Categories">
        <button className="tab" aria-pressed={cat === "all"} onClick={() => setCat("all")}>All</button>
        {cats.map((k) => <button key={k.id} className="tab" aria-pressed={cat === k.id} onClick={() => setCat(k.id)}>{k.name}</button>)}
        <button className="tab" onClick={() => setDlg({ t: "catNew" })}>+ Category</button>
      </div>

      {cur && (
        <div className="row" style={{ marginBottom: 12 }}>
          <button className="btn sm" onClick={() => setDlg({ t: "catRename" })}>Rename category</button>
          <button className="btn sm d" onClick={() => {
            const n = S.items.filter((i) => i.catId === cur.id).length;
            if (confirm(`Delete category "${cur.name}" and its ${n} items?`))
              if (update((s) => { s.items = s.items.filter((i) => i.catId !== cur.id); s.categories = s.categories.filter((k) => k.id !== cur.id); })) setCat("all");
          }}>Delete category</button>
        </div>
      )}

      <div className="grid items">
        {!items.length && <div className="empty">{q ? "No items match your search." : cats.length ? "Nothing here yet. Use “+ Add item” to save your first one." : "Create a category first, then add items."}</div>}
        {items.map((i) => (
          <ItemCard key={i.id} item={i} catName={cats.find((k) => k.id === i.catId)?.name} onCopy={copy}
            onEdit={() => setDlg({ t: "item", item: i })}
            onDelete={() => { if (confirm(`Delete "${i.title}"?`)) update((s) => { s.items = s.items.filter((x) => x.id !== i.id); }); }} />
        ))}
      </div>

      {dlg?.t === "item" && <ItemDialog item={dlg.item} cats={cats} defaultCat={cat !== "all" ? cat : undefined} onSave={saveItem(dlg.item)} onClose={close} />}
      {dlg?.t === "colRename" && <NameDialog title="Rename collection" initial={col.name} onClose={close}
        onSave={(v) => { if (update((s) => { const c = s.collections.find((x) => x.id === col.id); c.name = v; c.updated = now(); })) close(); }} />}
      {dlg?.t === "catNew" && <NameDialog title="New category" onClose={close}
        onSave={(v) => { const id = uid(), n = now(); if (update((s) => { s.categories.push({ id, colId: col.id, name: v, created: n, updated: n }); })) { setCat(id); close(); } }} />}
      {dlg?.t === "catRename" && cur && <NameDialog title="Rename category" initial={cur.name} onClose={close}
        onSave={(v) => { if (update((s) => { const k = s.categories.find((x) => x.id === cur.id); k.name = v; k.updated = now(); })) close(); }} />}
    </>
  );
}
