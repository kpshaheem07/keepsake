export default function Head({ title, crumb, onBack, children }) {
  return (
    <div className="bar">
      <button className="btn sm" onClick={onBack}>← Back</button>
      <div style={{ flex: 1, minWidth: 140 }}>
        {crumb && <div className="tag">{crumb}</div>}
        <h2 className="px" style={{ margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
