import { useState } from "react";
import Modal from "./Modal.jsx";
import SecretInput from "./SecretInput.jsx";
import { normalizeUrl, resizeImage, prepareCertFile } from "@/lib/utils";

export default function FormDialog({ title, fields, initial = {}, onSave, onClose }) {
  const [f, setF] = useState(() => Object.fromEntries(fields.flatMap((x) => x.type === "file" ? [[x.key, initial[x.key] || ""], [x.key + "Name", initial[x.key + "Name"] || ""], [x.key + "Type", initial[x.key + "Type"] || ""]] : [[x.key, initial[x.key] || ""]])));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pick = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { setF({ ...f, image: await resizeImage(file) }); setErr(""); } catch (x) { setErr(x.message); }
  };
  const pickFile = (key) => async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { const r = await prepareCertFile(file); setF({ ...f, [key]: r.url, [key + "Name"]: r.name, [key + "Type"]: r.type }); setErr(""); }
    catch (x) { setErr(x.message); e.target.value = ""; }
  };
  const submit = async (e) => {
    e.preventDefault();
    const v = { ...f };
    for (const x of fields) {
      if (typeof v[x.key] === "string" && x.type !== "secret") v[x.key] = v[x.key].trim();
      if (x.required && !v[x.key]) return setErr(`${x.label} is required.`);
      if (x.type === "url" && v[x.key]) { const u = normalizeUrl(v[x.key]); if (!u.ok) return setErr("Please enter a valid link, like https://example.com."); v[x.key] = u.url; }
      if (x.type === "email" && v[x.key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v[x.key])) return setErr("Please enter a valid email, like name@example.com.");
    }
    setBusy(true);
    const msg = await onSave(v);
    setBusy(false);
    if (msg) setErr(msg);
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit}>
        <h2 className="px">{title}</h2>
        {fields.map((x, i) => {
          const id = "f-" + x.key;
          return (
            <div key={x.key}>
              <label htmlFor={id}>{x.label}{x.required ? " (required)" : " (optional)"}</label>
              {x.type === "area" && <textarea id={id} rows={x.big ? 5 : 3} value={f[x.key]} onChange={set(x.key)} />}
              {x.type === "secret" && <SecretInput id={id} value={f[x.key]} onChange={set(x.key)} />}
              {x.type === "image" && (<>
                <input id={id} type="file" accept="image/*" onChange={pick} />
                {f.image && <div><img src={f.image} alt="Preview" style={{ maxHeight: 120, maxWidth: "100%" }} /><button type="button" className="btn sm" onClick={() => setF({ ...f, image: "" })}>Remove image</button></div>}
              </>)}
              {x.type === "file" && (<>
                <input id={id} type="file" accept="application/pdf,image/*" onChange={pickFile(x.key)} />
                {f[x.key] && <div className="row"><span>Saved file: <b>{f[x.key + "Name"]}</b></span><button type="button" className="btn sm" onClick={() => setF({ ...f, [x.key]: "", [x.key + "Name"]: "", [x.key + "Type"]: "" })}>Remove file</button></div>}
              </>)}
              {x.type === "date" && <input id={id} type="date" value={f[x.key]} onChange={set(x.key)} />}
              {["text", "url", "email"].includes(x.type) && <input id={id} maxLength={x.type === "text" ? 120 : 500} inputMode={x.type === "url" ? "url" : undefined} placeholder={x.type === "url" ? "https://…" : undefined} value={f[x.key]} onChange={set(x.key)} autoFocus={i === 0} />}
            </div>
          );
        })}
        <div className="err" role="alert">{err}</div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn y" type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
