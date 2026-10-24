import { useState } from "react";
import { fmt } from "@/lib/utils";

export default function Detail({ title, crumb, fields, values, onBack, onEdit, onDelete, onCopy, warn }) {
  const [show, setShow] = useState({});
  const due = values.reminder && values.reminder <= new Date().toISOString().slice(0, 10);
  return (
    <article className="detail">
      <div className="bar"><button className="btn sm" onClick={onBack}>← Back</button><div className="tag" style={{ flex: 1 }}>{crumb}</div></div>
      <h1 className="px big-title">{title}</h1>
      {values.image && <img className="bigimg" src={values.image} alt={`Image for ${title}`} />}
      {fields.filter((f) => f.key !== "title" && f.type !== "image" && values[f.key]).map((f) => {
        const v = values[f.key];
        const secret = f.type === "secret";
        return (
          <section key={f.key} className={"panel" + (f.big ? " bigpanel" : "")}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="tag">{f.label}</span>
              {f.type === "date" && due && <span className="badge">DUE</span>}
            </div>
            {f.type === "url"
              ? <a href={v} target="_blank" rel="noopener noreferrer" className="val" style={{ color: "var(--acc)" }}>{v}</a>
              : <div className={"val" + (f.big ? " bigval" : "")}>{secret && !show[f.key] ? "••••••••••" : f.type === "date" ? fmt(v + "T00:00:00") : v}</div>}
            <div className="row">
              {f.type !== "date" && <button className="btn" onClick={() => onCopy(v, f.label)}>Copy</button>}
              {f.type === "url" && <a className="btn" href={v} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Open</a>}
              {secret && <button className="btn" aria-pressed={!!show[f.key]} onClick={() => setShow({ ...show, [f.key]: !show[f.key] })}>{show[f.key] ? "Hide" : "Reveal"}</button>}
            </div>
          </section>
        );
      })}
      {warn && values.password && <p className="tag" style={{ textTransform: "none" }}>{warn}</p>}
      <div className="row" style={{ margin: "16px 0" }}>
        <button className="btn y" onClick={onEdit}>Edit</button>
        <button className="btn d" onClick={onDelete}>Delete</button>
      </div>
      <div className="tag" style={{ textTransform: "none" }}>Created {fmt(values.created)} · Updated {fmt(values.updated)}</div>
    </article>
  );
}
