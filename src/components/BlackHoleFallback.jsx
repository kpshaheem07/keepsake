import { useEffect, useRef } from "react";

// Stand-in for the paid React Bits Pro "Black Hole" so the app runs before you
// install the real one. Replace the import in Home.jsx once you have it.
export default function BlackHoleFallback() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, x = cv.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W, H, raf;
    const P = Array.from({ length: 700 }, () => ({ a: Math.random() * 6.283, r: 1.35 + Math.pow(Math.random(), 1.6) * 3.2, s: Math.random() }));
    const size = () => { W = cv.width = cv.clientWidth; H = cv.height = cv.clientHeight; };
    size();
    const draw = () => {
      const r0 = Math.min(W, H) * 0.13, cx = W / 2, cy = H / 2;
      x.clearRect(0, 0, W, H); x.globalCompositeOperation = "lighter";
      for (const p of P) {
        if (!reduce) p.a += 0.012 / Math.pow(p.r, 1.5);
        const r = p.r * r0, s = Math.sin(p.a), c = Math.cos(p.a), al = 0.12 + 0.5 * (1 - (p.r - 1.35) / 3.2);
        x.fillStyle = `rgba(255,${230 - p.s * 60 | 0},${120 + p.s * 100 | 0},${al * 0.55})`;
        x.fillRect(cx + c * r, cy + s * r * 0.22, 2, 2);
        if (s < 0) {
          const ly = cy - (r0 * 1.12 + (p.r - 1.35) * r0 * 0.5) * Math.abs(s) - r0 * 0.2 * (1 - Math.abs(c));
          x.fillStyle = `rgba(255,255,255,${al * 0.4})`; x.fillRect(cx + c * r * 0.8, ly, 2, 2);
        }
      }
      x.globalCompositeOperation = "source-over";
      x.fillStyle = "#000"; x.beginPath(); x.arc(cx, cy, r0, 0, 6.283); x.fill();
      x.save(); x.shadowColor = "#ffe629"; x.shadowBlur = 24; x.strokeStyle = "rgba(255,246,190,.95)"; x.lineWidth = 2;
      x.beginPath(); x.arc(cx, cy, r0 * 1.04, 0, 6.283); x.stroke(); x.restore();
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(() => { size(); if (reduce) draw(); });
    ro.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" />;
}
