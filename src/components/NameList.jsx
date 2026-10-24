import { useState } from "react";

export default function NameList({ rows, onOpen, onEdit, onDelete, onAdd, addLabel = "+ Add category", empty, placeholder = "Search…" }) {
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const list = rows.filter((r) => !s || r.name.toLowerCase().includes(s));
  return (
    <>
      <div className="bar">
        <input type="search" aria-label="Search" placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
        {onAdd && <button className="btn y" onClick={onAdd}>{addLabel}</button>}
      </div>
      <div className="grid">
        {!list.length && <div className="empty">{s ? "Nothing found." : empty}</div>}
        {list.map((r) => (
          <div key={r.id} className="tile-wrap">
            <button className="tile" onClick={() => onOpen(r.id)}>
              <b className="px">{r.name}</b>
              <small>{r.count} {r.unit}{r.count === 1 ? "" : "s"}</small>
            </button>
            <div className="row">
              <button className="btn sm" aria-label={`Edit ${r.name}`} onClick={() => onEdit(r.id)}>Edit</button>
              <button className="btn sm d" aria-label={`Delete ${r.name}`} onClick={() => onDelete(r.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
