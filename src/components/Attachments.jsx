import { useEffect, useState } from "react";
import { useFiles } from "@/useCloud";
import { dataUrlToBlob, dataUrlToText, kbText, copyText, saveFile, shareFile, openFile, canShareFiles, isIOS, inAppBrowser, isEmptyData } from "@/lib/utils";

// Download / Share / Open buttons that work on desktop, Android and iPhone.
export function InAppNotice() {
  if (!inAppBrowser()) return null;
  return <div className="banner" style={{ background: "var(--acc)" }} role="status">You are inside another app. Downloads can be blocked here. Tap the menu (three dots) and choose <b>Open in browser</b> (Chrome or Safari).</div>;
}

// Download / Share / Open buttons that work on desktop, Android and iPhone.
export function FileActions({ name, dataUrl, children }) {
  const [msg, setMsg] = useState("");
  const showShare = canShareFiles() && !isIOS();
  const run = (fn) => async () => { try { await fn(); } catch (e) { setMsg("This did not work: " + (e?.message || e) + ". Try the other buttons."); } };
  return (
    <>
      <div className="row">
        {children}
        <button className="btn y" onClick={run(async () => {
          setMsg("Working…");
          const r = await saveFile(name, dataUrl);
          setMsg(r === "downloaded" ? "Download started. Look in your Downloads folder. If nothing appears, tap Share or Open." : r === "shared" ? "In the menu, choose Save to Files." : "");
        })}>Download</button>
        {showShare && <button className="btn" onClick={run(async () => { if ((await shareFile(name, dataUrl)) === "failed") setMsg("Share did not work on this device. Try Open."); })}>Share</button>}
        <button className="btn" onClick={run(async () => { openFile(dataUrl); setMsg("Opening… If nothing opens, your browser blocked it. Allow pop-ups for this site, or use Download."); })}>Open</button>
      </div>
      {msg && <div className="tag" role="status" style={{ textTransform: "none" }}>{msg}</div>}
    </>
  );
}

function FileCard({ meta, file }) {
  const [url, setUrl] = useState(""); const [text, setText] = useState(""); const [copied, setCopied] = useState("");
  const img = meta.type?.startsWith("image/"), pdf = meta.type === "application/pdf", txt = meta.type === "text/plain";
  const desktop = typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;
  const empty = !!file && isEmptyData(file.data);
  useEffect(() => {
    if (!file?.data || empty) { setUrl(""); setText(""); return; }
    if (txt) { try { setText(dataUrlToText(file.data)); } catch { setText(""); } }
    if (!pdf || !desktop) return;
    const u = URL.createObjectURL(dataUrlToBlob(file.data));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file?.data]);
  return (
    <div className="panel">
      <b style={{ wordBreak: "break-all" }}>{meta.name} <span className="tag">{kbText(meta.size)}</span></b>
      {!file && <div className="tag" style={{ textTransform: "none" }}>Loading file… (needs internet the first time)</div>}
      {empty && <div className="err" role="alert">This saved file is empty (0 bytes), so it cannot be opened. Press <b>Edit</b>, remove it, and upload the file again.</div>}
      {file && !empty && img && <img className="bigimg" src={file.data} alt={meta.name} />}
      {file && !empty && pdf && url && <object className="pdfview" data={url} type="application/pdf"><p style={{ padding: 12, color: "#000" }}>Preview is not available here. Use Open or Download.</p></object>}
      {file && !empty && pdf && !desktop && <div className="tag" style={{ textTransform: "none" }}>PDF saved. Tap Open to read it, or Download to keep it.</div>}
      {file && !empty && txt && <div className="val">{text.slice(0, 20000)}{text.length > 20000 ? "\n\n… Showing the first 20,000 letters. Use Copy or Download for all." : ""}</div>}
      {file && !empty && (
        <FileActions name={meta.name} dataUrl={file.data}>
          {txt && <button className="btn" onClick={async () => { setCopied((await copyText(text)) ? "Copied" : "Copy failed"); setTimeout(() => setCopied(""), 1500); }}>{copied || "Copy"}</button>}
        </FileActions>
      )}
    </div>
  );
}

export default function Attachments({ uid, item }) {
  const metas = item.fileMeta || [];
  const { files, err } = useFiles(uid, item.id, metas.length > 0);
  if (!metas.length) return null;
  return (
    <section>
      <div className="tag" style={{ margin: "8px 0" }}>Files ({metas.length})</div>
      <InAppNotice />
      {err && <div className="err" role="alert">{err}</div>}
      {metas.map((m) => <FileCard key={m.id} meta={m} file={files[m.id]} />)}
    </section>
  );
}
