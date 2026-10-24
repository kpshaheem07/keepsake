import { useState } from "react";

export default function SecretInput({ id, value, onChange, autoComplete = "new-password" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="row" style={{ flexWrap: "nowrap" }}>
      <input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} value={value} onChange={onChange} />
      <button type="button" className="btn sm" aria-pressed={show} onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
    </div>
  );
}
