import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import SecretInput from "./SecretInput.jsx";
import { authMessage } from "@/lib/errors";

export default function SignIn() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !pw) return setErr("Please type your email and password.");
    setBusy(true); setErr("");
    try { await signInWithEmailAndPassword(auth, email.trim(), pw); }
    catch (x) { setErr(authMessage(x)); setBusy(false); }
  };
  return (
    <div className="wrap">
      <nav><span className="logo px">KEEPSAKE</span></nav>
      <h1 className="px" style={{ fontSize: 22, margin: "24px 0" }}>Sign in</h1>
      <form className="panel" style={{ maxWidth: 420 }} onSubmit={submit}>
        <label htmlFor="em">Email</label>
        <input id="em" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="pw">Password</label>
        <SecretInput id="pw" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
        <div className="err" role="alert">{err}</div>
        <button className="btn y" disabled={busy}>{busy ? "Please wait…" : "Sign in"}</button>
      </form>
    </div>
  );
}
