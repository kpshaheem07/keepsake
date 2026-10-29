import { useState } from "react";
import Modal from "./Modal.jsx";

export default function ExportDialog({ cats, fixedId, onGo, onClose }) {
  const [scope, setScope] = useState(fixedId || "all");
  const [pw, setPw] = useState(false);
  return (
    <Modal onClose={onClose}>
      <h2 className="px">Export PDF</h2>
      {!fixedId && (<>
        <label htmlFor="sc">What to export</label>
        <select id="sc" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="all">Everything</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </>)}
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="checkbox" style={{ width: 24, height: 24 }} checked={pw} onChange={(e) => setPw(e.target.checked)} /> Include passwords
      </label>
      {pw && <div className="err">Warning: a PDF is not locked. Anyone who gets the file can read these passwords.</div>}
      <p style={{ color: "var(--mute)", fontSize: 14 }}>The Private lock is never included. In the next window, choose <b>Save as PDF</b>.</p>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn y" onClick={() => onGo(scope, pw)}>Make PDF</button>
        <button className="btn" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
