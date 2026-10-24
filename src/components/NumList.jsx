import { useState } from "react";

export default function NumList({ rows, onOpen, onEdit, onDelete, onAdd, empty }) {
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const list = rows.filter((r) => !s || (r.title + " " + (r.text || "")).toLowerCase().includes(s));
  return (
    <>
      <div className="bar">
        <input type="search" aria-label="Search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn y" onClick={onAdd}>+ Add</button>
      </div>
      <ol className="nums">
        {!list.length && <li className="empty">{s ? "Nothing found." : empty}</li>}
        {list.map((r) => (
          <li key={r.id} className="numrow">
            <span className="no px" aria-hidden="true">{rows.indexOf(r) + 1}</span>
            <button className="numbtn" onClick={() => onOpen(r.id)}>
              <b>{r.title}</b>
              {r.sub && <small>{r.sub}</small>}
            </button>
            <div className="row">
              <button className="btn sm" aria-label={`Edit ${r.title}`} onClick={() => onEdit(r.id)}>Edit</button>
              <button className="btn sm d" aria-label={`Delete ${r.title}`} onClick={() => onDelete(r.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
