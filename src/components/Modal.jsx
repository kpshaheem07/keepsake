import { useEffect, useRef } from "react";

export default function Modal({ onClose, children }) {
  const r = useRef(null);
  useEffect(() => { r.current?.showModal(); }, []);
  return <dialog ref={r} onClose={onClose}>{children}</dialog>;
}
