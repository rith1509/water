"use client";

import { useEffect, useRef } from "react";

/** A trailing ring that swells over anything clickable. Fine pointers only; the native cursor stays. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const r = ring.current!;
    const d = dot.current!;
    let x = -100,
      y = -100,
      rx = -100,
      ry = -100,
      scale = 1,
      target = 1,
      id = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = (e.target as HTMLElement)?.closest?.("a, button, [role=tab], [role=option], input, [data-cursor]");
      target = el ? 2.1 : 1;
      r.style.opacity = "1";
      d.style.opacity = "1";
    };
    const leave = () => {
      r.style.opacity = "0";
      d.style.opacity = "0";
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      scale += (target - scale) * 0.18;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      d.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      id = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    id = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] size-7 rounded-full border border-[#bfeaf8]/50 opacity-0 mix-blend-difference transition-opacity"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] size-1 rounded-full bg-[#e8f8ff] opacity-0"
      />
    </>
  );
}
