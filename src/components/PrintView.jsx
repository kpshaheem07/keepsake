import { byCreated, fmt } from "@/lib/utils";

export default function PrintView({ S, scope, includePw }) {
  const cats = S.cats.filter((c) => scope === "all" || c.id === scope).sort(byCreated);
  return (
    <div id="print-root">
      <h1>Keepsake</h1>
      <p>{scope === "all" ? "Everything" : cats[0]?.name} · {fmt(new Date())}</p>
      {cats.map((c) => (
        <section key={c.id}>
          <h2>{c.name}</h2>
          {S.groups.filter((g) => g.catId === c.id).sort(byCreated).map((g) => (
            <div key={g.id}>
              <h3>{g.name}</h3>
              {S.items.filter((i) => i.groupId === g.id).sort(byCreated).map((i, n) => (
                <div key={i.id} className="pitem">
                  <h4>{n + 1}. {i.title}</h4>
                  {i.prompt && <p className="pre">{i.prompt}</p>}
                  {i.purpose && <p><b>Purpose:</b> {i.purpose}</p>}
                  {i.link && <p><b>Link:</b> {i.link}</p>}
                  {i.email && <p><b>Email used:</b> {i.email}</p>}
                  {includePw && i.password && <p><b>Password:</b> {i.password}</p>}
                  {i.note && <p className="pre"><b>Note:</b> {i.note}</p>}
                  {i.reminder && <p><b>Reminder:</b> {fmt(i.reminder + "T00:00:00")}</p>}
                  {i.image && <img src={i.image} alt="" />}
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
