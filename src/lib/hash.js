import { useSyncExternalStore } from "react";
const sub = (cb) => { addEventListener("hashchange", cb); return () => removeEventListener("hashchange", cb); };
const snap = () => location.hash;
// "#/c/123" -> ["c","123"]
export function useRoute() {
  const h = useSyncExternalStore(sub, snap);
  return h.replace(/^#\/?/, "").split("/").filter(Boolean);
}
export const go = (...p) => { location.hash = "/" + p.join("/"); };
