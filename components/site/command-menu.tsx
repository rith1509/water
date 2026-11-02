"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BHAWANS } from "@/data/surveyData";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string; hint: string; group: string; href: string };

const ITEMS: Item[] = [
  ...ROUTES.map((r) => ({ id: r.href, label: r.label, hint: r.blurb, group: "Pages", href: r.href })),
  ...BHAWANS.map((b) => ({
    id: "b-" + b,
    label: `${b} Bhawan`,
    hint: "Open in Bhawans",
    group: "Bhawans",
    href: `/bhawans?b=${encodeURIComponent(b)}`,
  })),
  { id: "sim", label: "Simulate a leaking tap", hint: "Repair pipeline", group: "Tools", href: "/pipeline" },
  { id: "calc", label: "Harvest calculator", hint: "Harvesting", group: "Tools", href: "/harvesting#calculator" },
  { id: "plan", label: "Build a fix plan", hint: "Fixes", group: "Tools", href: "/fixes#plan" },
  { id: "rain", label: "Rain stress view", hint: "Waterlogging", group: "Tools", href: "/waterlogging" },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const router = useRouter();
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input, textarea")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const ev = () => setOpen(true);
    window.addEventListener("keydown", key);
    window.addEventListener("open-command", ev);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("open-command", ev);
    };
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ITEMS.filter((it) => (it.label + " " + it.hint).toLowerCase().includes(s)) : ITEMS;
  }, [q]);

  useEffect(() => setI(0), [q, open]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${i}"]`)?.scrollIntoView({ block: "nearest" });
  }, [i]);

  const go = (it?: Item) => {
    if (!it) return;
    setOpen(false);
    setQ("");
    router.push(it.href);
  };

  let lastGroup = "";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-[#02050a]/70 backdrop-blur-sm" />
        <Dialog.Content
          className="glass fixed left-1/2 top-[14vh] z-[81] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setI((v) => Math.min(v + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setI((v) => Math.max(v - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              go(results[i]);
            }
          }}
        >
          <Dialog.Title className="sr-only">Jump to</Dialog.Title>
          <Dialog.Description className="sr-only">Search pages, bhawans and tools</Dialog.Description>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <span className="hud text-water-600">›</span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search pages, bhawans, tools…"
              className="h-12 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hud rounded-[4px] border border-border px-1.5 py-0.5">esc</kbd>
          </div>
          <ul ref={list} className="max-h-[52vh] overflow-y-auto p-1.5">
            {results.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-muted-foreground">Nothing matches “{q}”.</li>}
            {results.map((it, idx) => {
              const header = it.group !== lastGroup;
              lastGroup = it.group;
              return (
                <li key={it.id}>
                  {header && <div className="hud px-3 pb-1 pt-3">{it.group}</div>}
                  <button
                    data-i={idx}
                    onMouseMove={() => setI(idx)}
                    onClick={() => go(it)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13.5px]",
                      idx === i ? "bg-accent text-foreground" : "text-foreground/80"
                    )}
                  >
                    {it.label}
                    <span className="ml-auto text-[12px] text-muted-foreground">{it.hint}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="hud flex gap-4 border-t border-border px-4 py-2.5">
            <span>↑↓ move</span>
            <span>↵ open</span>
            <span className="ml-auto">/ also opens this</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
