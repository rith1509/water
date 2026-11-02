"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = "░▒▓/\\|_-=+*<>#%01";

/**
 * Text that decodes letter by letter, the way frozen UI text resolves in Igloo-style sites.
 * Plays on mount, on hover (when `hover`), and whenever `text` changes.
 */
export function Scramble({
  text,
  hover = false,
  duration = 700,
  delay = 0,
  className,
  as: Tag = "span",
}: {
  text: string;
  hover?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
}) {
  const [out, setOut] = useState(text);
  const raf = useRef<number | null>(null);

  const run = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }
    if (raf.current) cancelAnimationFrame(raf.current);
    const start = performance.now() + delay;
    const n = text.length;
    const tick = (now: number) => {
      const t = Math.max(0, (now - start) / duration);
      let s = "";
      for (let i = 0; i < n; i++) {
        const ch = text[i];
        // letters settle left to right with a little jitter
        const settle = i / n * 0.75 + 0.25 * ((i * 7919) % 13) / 13;
        if (ch === " " || t >= settle) s += ch;
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text, duration, delay]);

  useEffect(() => {
    run();
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [run]);

  return (
    <Tag className={className} onMouseEnter={hover ? run : undefined} aria-label={text}>
      <span aria-hidden>{out}</span>
    </Tag>
  );
}
