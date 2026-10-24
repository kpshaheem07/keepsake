import { useState } from "react";
import SecretInput from "./SecretInput.jsx";
import Lock from "./Lock.jsx";
import Head from "./Head.jsx";
import { copyText } from "@/lib/utils";

export default function VaultGate({ V, onBack, notify }) {
  const [mode, setMode] = useState(V.status === "none" ? "setup" : "unlock");
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState(""); const [code, setCode] = useState("");
  const [pending, setPending] = useState(null); const [saved, setSaved] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const run = async (fn) => { setBusy(true); setErr(""); try { const m = await fn(); if (m) setErr(m); } finally { setBusy(false); } };
  const checkNew = () => (pw.length < 4 ? "Use at least 4 characters." : pw !== pw2 ? "The two passwords are not the same." : "");

  if (V.status === "broken") return (<><Head title="Private lock" onBack={onBack} /><div className="banner" role="alert">The saved lock data cannot be read. Nothing was deleted. Please tell your helper.</div></>);
  if (V.status === "blocked") return (<><Head title="Private lock" onBack={onBack} /><div className="banner" role="alert">This browser blocks storage, so the lock cannot be used here.</div></>);

  return (
    <>
      <Head title="Private lock" onBack={onBack} />
      <div className="panel" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="row"><Lock /><b>{mode === "setup" ? "Make your lock" : mode === "code" ? "Save your Recovery code" : mode === "forgot" ? "Forgot password" : "Open your lock"}</b></div>

        {mode === "setup" && (
          <form onSubmit={(e) => { e.preventDefault(); const m = checkNew(); if (m) return setErr(m); run(async () => { setPending(await V.prepare(pw)); setMode("code"); }); }}>
            <p>Choose a password. You can type anything.</p>
            <label htmlFor="p1">New password</label><SecretInput id="p1" value={pw} onChange={(e) => setPw(e.target.value)} />
            <label htmlFor="p2">Type it again</label><SecretInput id="p2" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            <div className="err" role="alert">{err}</div>
            <button className="btn y" disabled={busy}>{busy ? "Please wait…" : "Continue"}</button>
          </form>
        )}

        {mode === "code" && pending && (
          <div>
            <p>This is your <b>Recovery code</b>. If you forget your password, this code is the only way back in. It is shown <b>only once</b>.</p>
            <div className="val bigval px" style={{ fontSize: 14, lineHeight: 2, wordBreak: "break-all" }}>{pending.recovery}</div>
            <div className="row"><button className="btn" onClick={async () => notify((await copyText(pending.recovery)) ? "Recovery code copied" : "Copy failed — write it down")}>Copy</button></div>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" style={{ width: 24, height: 24 }} checked={saved} onChange={(e) => setSaved(e.target.checked)} /> I saved my Recovery code in a safe place</label>
            <div className="err" role="alert">{err}</div>
            <button className="btn y" disabled={!saved || busy} onClick={() => run(() => pending.commit())}>Open my lock</button>
          </div>
        )}

        {mode === "unlock" && (
          <form onSubmit={(e) => { e.preventDefault(); run(() => V.unlock(pw)); }}>
            <label htmlFor="p1">Password</label><SecretInput id="p1" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
            <div className="err" role="alert">{err}</div>
            <div className="row"><button className="btn y" disabled={busy}>{busy ? "Please wait…" : "Unlock"}</button>
              <button type="button" className="btn" onClick={() => { setErr(""); setMode("forgot"); }}>Forgot password?</button></div>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={(e) => { e.preventDefault(); const m = checkNew(); if (m) return setErr(m); run(() => V.recover(code, pw)); }}>
            <label htmlFor="rc">Recovery code</label><input id="rc" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
            <label htmlFor="p1">New password</label><SecretInput id="p1" value={pw} onChange={(e) => setPw(e.target.value)} />
            <label htmlFor="p2">Type it again</label><SecretInput id="p2" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            <div className="err" role="alert">{err}</div>
            <div className="row"><button className="btn y" disabled={busy}>{busy ? "Please wait…" : "Set new password"}</button>
              <button type="button" className="btn" onClick={() => { setErr(""); setMode("unlock"); }}>Cancel</button></div>
          </form>
        )}
      </div>
    </>
  );
}
