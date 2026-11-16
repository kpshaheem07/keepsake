import { useState } from "react";
import { byCreated, fmt, inAppBrowser } from "@/lib/utils";

export default function PrintView({ S, scope, includePw, onClose }) {
  const [msg, setMsg] = useState("");
  const cats = S.cats.filter((c) => scope === "all" || c.id === scope).sort(byCreated);
  return (
    <div id="print-root" className="preview">
      <div className="no-print preview-bar">
        <button className="btn y" onClick={() => { try { if (typeof window.print !== "function") throw new Error("printing is not available"); window.print(); } catch (e) { setMsg("Could not open the print window: " + (e?.message || e)); } }}>Save as PDF</button>
        <button className="btn" onClick={onClose}>Close</button>
        <div className="tag" style={{ textTransform: "none", flexBasis: "100%" }}>Press <b>Save as PDF</b>. Then in the window that opens: on Android choose <b>Save as PDF</b> and press the PDF button. On iPhone press the Share icon and choose <b>Save to Files</b>.</div>
        {inAppBrowser() && <div className="banner" style={{ background: "var(--acc)", flexBasis: "100%" }}>You are inside another app. Printing can be blocked here. Tap the menu (three dots) and choose <b>Open in browser</b>.</div>}
        {msg && <div className="err" role="alert" style={{ flexBasis: "100%" }}>{msg}</div>}
      </div>
      <h1>Keepsake</h1>
      <p>{scope === "all" ? "Everything" : cats[0]?.name} · {fmt(new Date())}</p>
      {cats.map((c) => (
        <section key={c.id}>
          <h2>{c.name}</h2>
          {S.groups.filter((g) => g.catId === c.id).sort(byCreated).map((g) => (
            <div key={g.id}>
              <h3>{g.name}</h3>
              {S.items.filter((i) => i.groupId === g.id).sort(byCreated).map((i, n) => (
                <div key={i.id} className="pitem">
                  <h4>{n + 1}. {i.title}</h4>
                  {i.prompt && <p className="pre">{i.prompt}</p>}
                  {i.purpose && <p><b>Purpose:</b> {i.purpose}</p>}
                  {i.link && <p><b>Link:</b> {i.link}</p>}
                  {i.email && <p><b>Email used:</b> {i.email}</p>}
                  {includePw && i.password && <p><b>Password:</b> {i.password}</p>}
                  {i.note && <p className="pre"><b>Note:</b> {i.note}</p>}
                  {i.reminder && <p><b>Reminder:</b> {fmt(i.reminder + "T00:00:00")}</p>}
                  {i.image && <img src={i.image} alt="" />}
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
