import { useEffect, useState } from "react";
import { useFiles } from "@/useCloud";
import { dataUrlToBlob, dataUrlToText, kbText, copyText, saveFile, shareFile, openFile, canShareFiles, isIOS } from "@/lib/utils";

// Download / Share / Open buttons that work on desktop, Android and iPhone.
export function FileActions({ name, dataUrl, children }) {
  const [msg, setMsg] = useState("");
  const showShare = canShareFiles() && !isIOS();
  return (
    <>
      <div className="row">
        {children}
        <button className="btn y" onClick={async () => {
          const r = await saveFile(name, dataUrl);
          setMsg(r === "downloaded" ? "Download started. Look in your Downloads folder. If nothing appears, tap Share or Open." : r === "shared" ? "In the menu, choose Save to Files." : "");
        }}>Download</button>
        {showShare && <button className="btn" onClick={async () => { if ((await shareFile(name, dataUrl)) === "failed") setMsg("Share did not work on this device. Try Open."); }}>Share</button>}
        <button className="btn" onClick={() => openFile(dataUrl)}>Open</button>
      </div>
      {msg && <div className="tag" role="status" style={{ textTransform: "none" }}>{msg}</div>}
    </>
  );
}

function FileCard({ meta, file }) {
  const [url, setUrl] = useState(""); const [text, setText] = useState(""); const [copied, setCopied] = useState("");
  const img = meta.type?.startsWith("image/"), pdf = meta.type === "application/pdf", txt = meta.type === "text/plain";
  const desktop = typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;
  useEffect(() => {
    if (!file?.data) { setUrl(""); setText(""); return; }
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
      {file && img && <img className="bigimg" src={file.data} alt={meta.name} />}
      {file && pdf && url && <object className="pdfview" data={url} type="application/pdf"><p style={{ padding: 12, color: "#000" }}>Preview is not available here. Use Open or Download.</p></object>}
      {file && pdf && !desktop && <div className="tag" style={{ textTransform: "none" }}>PDF saved. Tap Open to read it, or Download to keep it.</div>}
      {file && txt && <div className="val">{text.slice(0, 20000)}{text.length > 20000 ? "\n\n… Showing the first 20,000 letters. Use Copy or Download for all." : ""}</div>}
      {file && (
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
      {err && <div className="err" role="alert">{err}</div>}
      {metas.map((m) => <FileCard key={m.id} meta={m} file={files[m.id]} />)}
    </section>
  );
}
