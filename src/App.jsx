import { useEffect, useRef, useState } from "react";
import Home from "@/components/Home.jsx";
import Head from "@/components/Head.jsx";
import NameList from "@/components/NameList.jsx";
import NumList from "@/components/NumList.jsx";
import Detail from "@/components/Detail.jsx";
import FormDialog from "@/components/FormDialog.jsx";
import NameDialog from "@/components/NameDialog.jsx";
import VaultGate from "@/components/VaultGate.jsx";
import { loadState, saveState } from "@/storage";
import { useVault } from "@/useVault";
import { useRoute, go } from "@/lib/hash";
import { uid, copyText } from "@/lib/utils";
import { ITEM_FIELDS, VAULT_FIELDS } from "@/fields";

const now = () => new Date().toISOString();
const mk = (name) => ({ id: uid(), name, created: now(), updated: now() });
const byCreated = (a, b) => a.created.localeCompare(b.created);

export default function App() {
  const init = useRef(null);
  if (!init.current) init.current = loadState();
  const [S, setS] = useState(init.current.state);
  const [warn] = useState(init.current.warning);
  const [saveErr, setSaveErr] = useState("");
  const [toast, setToast] = useState("");
  const [dlg, setDlg] = useState(null);
  const timer = useRef();
  const r = useRoute();
  const V = useVault();

  const notify = (m) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 1800); };
  const copy = async (t, label) => notify((await copyText(t)) ? `${label} copied` : "Copy failed — select the text and copy by hand");

  // Change a copy, save it, and only then show it. A failed save changes nothing.
  const update = (mutate) => {
    const next = structuredClone(S); mutate(next);
    const res = saveState(next);
    if (!res.ok) { setSaveErr(res.error); return false; }
    setSaveErr(""); setS(next); return true;
  };
  const vupdate = async (mutate) => {
    const ok = await V.update(mutate);
    if (!ok) setSaveErr("Could not save the private data. Your last change was not applied.");
    else setSaveErr("");
    return ok;
  };

  // The private area locks itself as soon as you leave it.
  useEffect(() => { if (r[0] !== "v" && V.status === "open") V.lock(); });

  const ask = (title, initial, cb) => setDlg({ k: "name", title, initial, cb });
  const form = (title, fields, initial, cb) => setDlg({ k: "form", title, fields, initial, cb });
  const ok = (b) => b;

  /* ---------- pages ---------- */
  const [a, b, c] = r;
  let page = null;

  const cat = a === "c" && S.cats.find((x) => x.id === b);
  const grp = a === "g" && S.groups.find((x) => x.id === b);
  const itm = a === "i" && S.items.find((x) => x.id === b);
  const vd = V.data;
  const vcat = a === "v" && b === "c" && vd?.cats.find((x) => x.id === c);
  const vitm = a === "v" && b === "i" && vd?.items.find((x) => x.id === c);

  if (cat) {
    const groups = S.groups.filter((g) => g.catId === cat.id).sort(byCreated);
    page = (<>
      <Head title={cat.name} crumb="Category" onBack={() => go()} />
      <NameList rows={groups.map((g) => ({ id: g.id, name: g.name, count: S.items.filter((i) => i.groupId === g.id).length, unit: "item" }))}
        onAdd={() => ask("New category", "", (v) => update((s) => { s.groups.push({ ...mk(v), catId: cat.id }); }))}
        onOpen={(id) => go("g", id)}
        onEdit={(id) => ask("Rename category", groups.find((g) => g.id === id).name, (v) => update((s) => { const g = s.groups.find((x) => x.id === id); g.name = v; g.updated = now(); }))}
        onDelete={(id) => { const g = groups.find((x) => x.id === id), n = S.items.filter((i) => i.groupId === id).length; if (confirm(`Delete "${g.name}" and its ${n} items? This cannot be undone.`)) update((s) => { s.items = s.items.filter((i) => i.groupId !== id); s.groups = s.groups.filter((x) => x.id !== id); }); }}
        empty="Nothing here yet. Press “+ Add category”." placeholder="Search…" />
    </>);
  } else if (grp) {
    const pc = S.cats.find((x) => x.id === grp.catId);
    const items = S.items.filter((i) => i.groupId === grp.id).sort(byCreated);
    const save = (it) => (vals) => update((s) => {
      if (it) s.items = s.items.map((x) => (x.id === it.id ? { ...x, ...vals, updated: now() } : x));
      else s.items.push({ id: uid(), groupId: grp.id, ...vals, created: now(), updated: now() });
    });
    page = (<>
      <Head title={grp.name} crumb={pc?.name} onBack={() => go("c", grp.catId)} />
      <NumList rows={items.map((i) => ({ id: i.id, title: i.title, sub: i.purpose, text: [i.prompt, i.purpose, i.note, i.link].join(" ") }))}
        onAdd={() => form("Add", ITEM_FIELDS, {}, save(null))}
        onOpen={(id) => go("i", id)}
        onEdit={(id) => form("Edit", ITEM_FIELDS, items.find((x) => x.id === id), save(items.find((x) => x.id === id)))}
        onDelete={(id) => { if (confirm(`Delete "${items.find((x) => x.id === id).title}"?`)) update((s) => { s.items = s.items.filter((x) => x.id !== id); }); }}
        empty="Nothing saved yet. Press “+ Add”." />
    </>);
  } else if (itm) {
    const g = S.groups.find((x) => x.id === itm.groupId), pc = g && S.cats.find((x) => x.id === g.catId);
    page = <Detail title={itm.title} crumb={`${pc?.name || ""} › ${g?.name || ""}`} fields={ITEM_FIELDS} values={itm}
      onBack={() => go("g", itm.groupId)} onCopy={copy}
      warn="This password is saved without a lock. Put very important secrets in the Private lock."
      onEdit={() => form("Edit", ITEM_FIELDS, itm, (vals) => update((s) => { s.items = s.items.map((x) => (x.id === itm.id ? { ...x, ...vals, updated: now() } : x)); }))}
      onDelete={() => { if (confirm(`Delete "${itm.title}"?`) && update((s) => { s.items = s.items.filter((x) => x.id !== itm.id); })) go("g", itm.groupId); }} />;
  } else if (a === "v") {
    if (V.status !== "open") {
      page = <VaultGate V={V} notify={notify} onBack={() => go()} />;
    } else if (vcat) {
      const items = vd.items.filter((i) => i.catId === vcat.id).sort(byCreated);
      const save = (it) => (vals) => vupdate((d) => {
        if (it) d.items = d.items.map((x) => (x.id === it.id ? { ...x, ...vals, updated: now() } : x));
        else d.items.push({ id: uid(), catId: vcat.id, ...vals, created: now(), updated: now() });
      });
      page = (<>
        <Head title={vcat.name} crumb="Private lock" onBack={() => go("v")} />
        <NumList rows={items.map((i) => ({ id: i.id, title: i.title, sub: i.purpose, text: [i.purpose, i.note, i.link].join(" ") }))}
          onAdd={() => form("Add", VAULT_FIELDS, {}, save(null))}
          onOpen={(id) => go("v", "i", id)}
          onEdit={(id) => form("Edit", VAULT_FIELDS, items.find((x) => x.id === id), save(items.find((x) => x.id === id)))}
          onDelete={(id) => { if (confirm(`Delete "${items.find((x) => x.id === id).title}"?`)) vupdate((d) => { d.items = d.items.filter((x) => x.id !== id); }); }}
          empty="Nothing saved yet. Press “+ Add”." />
      </>);
    } else if (vitm) {
      const pc = vd.cats.find((x) => x.id === vitm.catId);
      page = <Detail title={vitm.title} crumb={`Private lock › ${pc?.name || ""}`} fields={VAULT_FIELDS} values={vitm}
        onBack={() => go("v", "c", vitm.catId)} onCopy={copy}
        onEdit={() => form("Edit", VAULT_FIELDS, vitm, (vals) => vupdate((d) => { d.items = d.items.map((x) => (x.id === vitm.id ? { ...x, ...vals, updated: now() } : x)); }))}
        onDelete={async () => { if (confirm(`Delete "${vitm.title}"?`) && (await vupdate((d) => { d.items = d.items.filter((x) => x.id !== vitm.id); }))) go("v", "c", vitm.catId); }} />;
    } else {
      const cats = vd.cats.slice().sort(byCreated);
      page = (<>
        <Head title="Private lock" crumb="Encrypted" onBack={() => go()}>
          <button className="btn sm" onClick={() => { V.lock(); go(); }}>Lock now</button>
        </Head>
        <NameList rows={cats.map((k) => ({ id: k.id, name: k.name, count: vd.items.filter((i) => i.catId === k.id).length, unit: "item" }))}
          onAdd={() => ask("New category (for example: API keys)", "", (v) => vupdate((d) => { d.cats.push(mk(v)); }))}
          onOpen={(id) => go("v", "c", id)}
          onEdit={(id) => ask("Rename category", cats.find((k) => k.id === id).name, (v) => vupdate((d) => { const k = d.cats.find((x) => x.id === id); k.name = v; k.updated = now(); }))}
          onDelete={(id) => { const k = cats.find((x) => x.id === id), n = vd.items.filter((i) => i.catId === id).length; if (confirm(`Delete "${k.name}" and its ${n} items? This cannot be undone.`)) vupdate((d) => { d.items = d.items.filter((i) => i.catId !== id); d.cats = d.cats.filter((x) => x.id !== id); }); }}
          empty="No private categories yet. Press “+ Add category”." />
      </>);
    }
  }

  if (!page) {
    const cats = S.cats.slice().sort(byCreated);
    page = <Home rows={cats.map((k) => ({ id: k.id, name: k.name, count: S.groups.filter((g) => g.catId === k.id).length, unit: "category" }))}
      onAdd={() => ask("New category", "", (v) => update((s) => { s.cats.push(mk(v)); }))}
      onOpen={(id) => go("c", id)}
      onEdit={(id) => ask("Rename category", cats.find((k) => k.id === id).name, (v) => update((s) => { const k = s.cats.find((x) => x.id === id); k.name = v; k.updated = now(); }))}
      onDelete={(id) => { const k = cats.find((x) => x.id === id), gs = S.groups.filter((g) => g.catId === id).map((g) => g.id), n = S.items.filter((i) => gs.includes(i.groupId)).length;
        if (confirm(`Delete "${k.name}" with ${gs.length} categories and ${n} items inside? This cannot be undone.`)) update((s) => { s.items = s.items.filter((i) => !gs.includes(i.groupId)); s.groups = s.groups.filter((g) => g.catId !== id); s.cats = s.cats.filter((x) => x.id !== id); }); }}
      onLock={() => go("v")} />;
  }

  return (
    <div className="wrap">
      <nav><button className="logo px" aria-label="Keepsake home" onClick={() => go()}>KEEPSAKE</button></nav>
      {(warn || saveErr) && <div className="banner" role="alert">{saveErr || warn}</div>}
      {page}
      {dlg?.k === "name" && <NameDialog title={dlg.title} initial={dlg.initial} onClose={() => setDlg(null)}
        onSave={async (v) => { if (ok(await dlg.cb(v))) setDlg(null); }} />}
      {dlg?.k === "form" && <FormDialog title={dlg.title} fields={dlg.fields} initial={dlg.initial} onClose={() => setDlg(null)}
        onSave={async (vals) => { if (await dlg.cb(vals)) { setDlg(null); notify("Saved"); } else return "Could not save. Nothing was changed."; }} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
