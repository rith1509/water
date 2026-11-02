"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Scramble } from "./scramble";

function Clock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const f = () =>
      setNow(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        })
      );
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular">{now || "--:--:--"} IST</span>;
}

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#04070b]/72 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-6 px-4 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">commReach</span>
          <span className="hud hidden sm:inline">iitr / water</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {ROUTES.map((r) => {
            const active = path === r.href;
            return (
              <Link
                key={r.href}
                href={r.href}
                className={cn(
                  "relative flex items-baseline gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="font-mono text-[10px] text-water-500">{r.code}</span>
                <Scramble text={r.label} hover duration={380} />
                {active && <span className="absolute inset-x-2.5 -bottom-[9px] h-px bg-water-700" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-2">
          <span className="hud hidden xl:inline">
            <Clock />
          </span>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-command"))}
            className="hud flex h-8 items-center gap-2 rounded-md border border-border px-2.5 text-foreground/80 transition-colors hover:border-water-500 hover:text-foreground"
          >
            Jump to
            <kbd className="rounded-[4px] bg-muted px-1 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
          </button>
          <button
            className="hud h-8 rounded-md border border-border px-2.5 text-foreground/80 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div className="mx-auto h-px max-w-[1320px] bg-gradient-to-r from-transparent via-border to-transparent" />

      {open && (
        <div className="glass mx-4 mt-2 rounded-lg p-2 lg:hidden">
          {ROUTES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={cn(
                "flex items-baseline gap-3 rounded-md px-3 py-2.5",
                path === r.href ? "bg-accent text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="font-mono text-[10px] text-water-500">{r.code}</span>
              <span className="text-[14px]">{r.label}</span>
              <span className="ml-auto truncate text-[12px] text-muted-foreground/70">{r.blurb}</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
