import { useEffect, useState } from "react";
import { useFiles } from "@/useCloud";
import { dataUrlToBlob, dataUrlToText, kbText, copyText } from "@/lib/utils";

const linkStyle = { textDecoration: "none", display: "inline-flex", alignItems: "center" };

function FileCard({ meta, file }) {
  const [url, setUrl] = useState(""); const [text, setText] = useState(""); const [copied, setCopied] = useState("");
  const img = meta.type?.startsWith("image/"), pdf = meta.type === "application/pdf", txt = meta.type === "text/plain";
  useEffect(() => {
    if (!file?.data) { setUrl(""); setText(""); return; }
    const u = URL.createObjectURL(dataUrlToBlob(file.data));
    setUrl(u);
    if (txt) { try { setText(dataUrlToText(file.data)); } catch { setText(""); } }
    return () => URL.revokeObjectURL(u);
  }, [file?.data]);
  return (
    <div className="panel">
      <b style={{ wordBreak: "break-all" }}>{meta.name} <span className="tag">{kbText(meta.size)}</span></b>
      {!file && <div className="tag" style={{ textTransform: "none" }}>Loading file… (needs internet the first time)</div>}
      {file && img && <img className="bigimg" src={file.data} alt={meta.name} />}
      {file && pdf && url && <object className="pdfview" data={url} type="application/pdf"><p style={{ padding: 12, color: "#000" }}>Preview is not available here. Use Open or Download.</p></object>}
      {file && txt && <div className="val">{text.slice(0, 20000)}{text.length > 20000 ? "\n\n… Showing the first 20,000 letters. Use Copy or Download for all." : ""}</div>}
      {file && url && (
        <div className="row">
          {txt && <button className="btn" onClick={async () => { setCopied((await copyText(text)) ? "Copied" : "Copy failed"); setTimeout(() => setCopied(""), 1500); }}>{copied || "Copy"}</button>}
          <a className="btn y" href={url} download={meta.name} style={linkStyle}>Download</a>
          <a className="btn" href={url} target="_blank" rel="noopener noreferrer" style={linkStyle}>Open</a>
        </div>
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
