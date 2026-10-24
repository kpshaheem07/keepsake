// REAL COMPONENT: after running  npx shadcn@latest add @reactbits-starter/black-hole-tw
// change the next line to the path the CLI printed, e.g.
//   import BlackHole from "@/components/ui/black-hole-tw";
import BlackHole from "@/components/BlackHoleFallback";
import NameList from "./NameList.jsx";
import Lock from "./Lock.jsx";

export default function Home({ rows, onAdd, onOpen, onEdit, onDelete, onLock }) {
  return (
    <>
      <section className="hero">
        <div className="hero-bg"><BlackHole /></div>
        <div className="hero-in">
          <h1 className="px">Remember the tools you find.</h1>
          <p className="sub">Make your own categories. Save everything you want inside them.</p>
          <button className="btn y" onClick={onAdd}>+ Add category</button>
        </div>
      </section>
      <NameList rows={rows} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} placeholder="Search categories…" empty="No categories yet. Press “+ Add category” to make your first one." />
      <div className="foot">
        <button className="btn" onClick={onLock}><Lock /> Private lock</button>
      </div>
    </>
  );
}
