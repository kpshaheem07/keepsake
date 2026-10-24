import { useState } from "react";
import Lock from "./Lock.jsx";
import { fmt } from "@/lib/utils";

export default function ItemCard({ item: i, catName, onCopy, onEdit, onDelete }) {
  const [show, setShow] = useState(false);
  const due = i.reminder && i.reminder <= new Date().toISOString().slice(0, 10);
  return (
    <article className="card">
      <div className="tag">{catName} · {fmt(i.updated)}</div>
      <h3>{i.title}</h3>
      {i.image && <img src={i.image} alt={`Image for ${i.title}`} />}
      {i.desc && <p>{i.desc}</p>}
      {i.note && <p style={{ color: "var(--mute)", fontSize: 14 }}>Note: {i.note}</p>}
      {i.url && <a href={i.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--acc)", wordBreak: "break-all" }}>{i.url}</a>}
      {i.reminder && <div><span className="badge">{due ? "DUE" : "REMINDER"}</span> {fmt(i.reminder + "T00:00:00")}</div>}
      {(i.user || i.pass) && (
        <div className="login">
          <div className="row"><Lock /><b>Login</b></div>
          {i.user && <div>User: <code>{show ? i.user : "••••••••"}</code> <button className="btn sm" aria-label="Copy username" onClick={() => onCopy(i.user, "Username")}>Copy</button></div>}
          {i.pass && <div>Pass: <code>{show ? i.pass : "••••••••"}</code> <button className="btn sm" aria-label="Copy password" onClick={() => onCopy(i.pass, "Password")}>Copy</button></div>}
          <button className="btn sm" aria-pressed={show} onClick={() => setShow(!show)}>{show ? "Hide" : "Reveal"}</button>
        </div>
      )}
      <div className="row">
        {i.desc && <button className="btn sm" onClick={() => onCopy(i.desc, "Text")}>Copy text</button>}
        {i.url && <button className="btn sm" onClick={() => onCopy(i.url, "URL")}>Copy URL</button>}
        <button className="btn sm" onClick={onEdit}>Edit</button>
        <button className="btn sm d" onClick={onDelete}>Delete</button>
      </div>
    </article>
  );
}
