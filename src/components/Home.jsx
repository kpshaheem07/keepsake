// REAL COMPONENT: after running  npx shadcn@latest add @reactbits-starter/black-hole-tw
// change the next line to the path the CLI printed, e.g.
//   import BlackHole from "@/components/ui/black-hole-tw";
// (if the file exports a named BlackHole instead: import { BlackHole } from "...")
import BlackHole from "@/components/BlackHoleFallback";

export default function Home({ collections, counts, onOpen, onAdd }) {
  return (
    <>
      <section className="hero">
        <div className="hero-bg"><BlackHole /></div>
        <div className="hero-in">
          <h1 className="px">Remember the tools you find.</h1>
          <p className="sub">One organized place for useful websites, apps and prompts — saved on this device, no account needed.</p>
          <button className="btn y" onClick={onAdd}>+ New collection</button>
        </div>
      </section>
      <h2 className="px">Collections</h2>
      <div className="grid">
        {collections.map((c) => (
          <button key={c.id} className="tile" onClick={() => onOpen(c.id)}>
            <b className="px">{c.name}</b>
            <small>{counts[c.id] || 0} item{counts[c.id] === 1 ? "" : "s"}</small>
          </button>
        ))}
      </div>
    </>
  );
}
