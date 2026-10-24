import { useState } from "react";
import Modal from "./Modal.jsx";

export default function NameDialog({ title, initial = "", onSave, onClose }) {
  const [v, setV] = useState(initial);
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const name = v.trim();
    if (!name) return setErr("Please enter a name.");
    onSave(name);
  };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit}>
        <h2 className="px">{title}</h2>
        <label htmlFor="nm">Name (required)</label>
        <input id="nm" maxLength={60} value={v} onChange={(e) => setV(e.target.value)} autoFocus />
        <div className="err" role="alert">{err}</div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn y" type="submit">Save</button>
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
