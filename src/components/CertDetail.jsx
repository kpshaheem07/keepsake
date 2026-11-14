import { useEffect, useState } from "react";
import { dataUrlToBlob, fmt } from "@/lib/utils";
import Attachments, { FileActions } from "./Attachments.jsx";

export default function CertDetail({ uid, cert, onBack, onEdit, onDelete }) {
  const [blob, setBlob] = useState("");
  useEffect(() => {
    if (!cert.file) { setBlob(""); return; }
    const u = URL.createObjectURL(dataUrlToBlob(cert.file));
    setBlob(u);
    return () => URL.revokeObjectURL(u);
  }, [cert.file]);
  const img = cert.fileType?.startsWith("image/");
  const desktop = typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;
  const linkStyle = { textDecoration: "none", display: "inline-flex", alignItems: "center" };
  return (
    <article className="detail">
      <div className="bar"><button className="btn sm" onClick={onBack}>← Back</button><div className="tag" style={{ flex: 1 }}>My Certificates</div></div>
      <h1 className="px big-title">{cert.title}</h1>
      {cert.file && img && <img className="bigimg" src={cert.file} alt={cert.title} />}
      {cert.file && !img && blob && desktop && (
        <object className="pdfview" data={blob} type="application/pdf"><p style={{ padding: 12, color: "#000" }}>Preview is not available here. Use Open or Download.</p></object>
      )}
      {cert.file && <FileActions name={cert.fileName || "certificate"} dataUrl={cert.file} />}
      <Attachments uid={uid} item={cert} />
      {!cert.file && !(cert.fileMeta || []).length && <div className="empty" style={{ margin: "12px 0" }}>No file saved. Press Edit to add one.</div>}
      {cert.note && <section className="panel"><span className="tag">Note</span><div className="val">{cert.note}</div></section>}
      <div className="row" style={{ margin: "16px 0" }}>
        <button className="btn y" onClick={onEdit}>Edit</button>
        <button className="btn d" onClick={onDelete}>Delete</button>
      </div>
      <div className="tag" style={{ textTransform: "none" }}>Created {fmt(cert.created)} · Updated {fmt(cert.updated)}</div>
    </article>
  );
}
