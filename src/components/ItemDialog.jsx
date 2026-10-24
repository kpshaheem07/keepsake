import { useState } from "react";
import Modal from "./Modal.jsx";
import Lock from "./Lock.jsx";
import { normalizeUrl, resizeImage } from "@/lib/utils";

export default function ItemDialog({ item, cats, defaultCat, onSave, onClose }) {
  const d = item || {};
  const [f, setF] = useState({
    catId: d.catId || defaultCat || cats[0].id, title: d.title || "", desc: d.desc || "", note: d.note || "",
    url: d.url || "", image: d.image || "", reminder: d.reminder || "", user: d.user || "", pass: d.pass || "",
  });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { setF({ ...f, image: await resizeImage(file) }); setErr(""); } catch (x) { setErr(x.message); }
  };
  const submit = (e) => {
    e.preventDefault();
    const title = f.title.trim();
    if (!title) return setErr("Title is required.");
    const u = normalizeUrl(f.url);
    if (!u.ok) return setErr("Please enter a valid website URL, e.g. https://example.com.");
    const msg = onSave({ ...f, title, url: u.url, desc: f.desc.trim(), note: f.note.trim() });
    if (msg) setErr(msg);
  };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit}>
        <h2 className="px">{item ? "Edit item" : "Add item"}</h2>
        <label htmlFor="f-cat">Category</label>
        <select id="f-cat" value={f.catId} onChange={set("catId")}>{cats.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</select>
        <label htmlFor="f-title">Title (required)</label>
        <input id="f-title" maxLength={120} value={f.title} onChange={set("title")} autoFocus />
        <label htmlFor="f-desc">Description or prompt text</label>
        <textarea id="f-desc" rows={4} value={f.desc} onChange={set("desc")} />
        <label htmlFor="f-note">Note (optional)</label>
        <textarea id="f-note" rows={2} value={f.note} onChange={set("note")} />
        <label htmlFor="f-url">Website URL (optional)</label>
        <input id="f-url" inputMode="url" placeholder="https://…" value={f.url} onChange={set("url")} />
        <label htmlFor="f-img">Image (optional)</label>
        <input id="f-img" type="file" accept="image/*" onChange={pick} />
        {f.image && (
          <div>
            <img src={f.image} alt="Preview" style={{ maxHeight: 120, maxWidth: "100%" }} />
            <button type="button" className="btn sm" onClick={() => setF({ ...f, image: "" })}>Remove image</button>
          </div>
        )}
        <label htmlFor="f-rem">Reminder date (optional)</label>
        <input id="f-rem" type="date" value={f.reminder} onChange={set("reminder")} />
        <div className="row" style={{ marginTop: 12 }}><Lock /><b>Login details (optional)</b></div>
        <label htmlFor="f-user">Username</label>
        <input id="f-user" autoComplete="off" value={f.user} onChange={set("user")} />
        <label htmlFor="f-pass">Password</label>
        <input id="f-pass" type="password" autoComplete="new-password" value={f.pass} onChange={set("pass")} />
        <div className="err" role="alert">{err}</div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn y" type="submit">Save</button>
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
