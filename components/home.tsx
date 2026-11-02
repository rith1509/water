"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { headline } from "@/data/surveyData";
import { silt, water } from "@/lib/palette";
import { cn } from "@/lib/utils";
import type { Block } from "./three/hero-scene";
import { Counter } from "./site/bits";
import { Scramble } from "./site/scramble";

const HeroScene = dynamic(() => import("./three/hero-scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#04070b]" />,
});

const BLOCKS: (Block & { blurb: string })[] = [
  { code: "01", label: "Waterlogging", href: "/waterlogging", glow: water[700], shape: "ico", blurb: "Five spots, one rain slider" },
  { code: "02", label: "Harvesting", href: "/harvesting", glow: "#bff2ff", shape: "drop", blurb: "What to build, litres it catches" },
  { code: "03", label: "Bhawans", href: "/bhawans", glow: water[600], shape: "house", blurb: "Eleven hostels, side by side" },
  { code: "04", label: "Repair pipeline", href: "/pipeline", glow: silt, shape: "pipe", blurb: "Gen Sec → Plumber, simulated" },
  { code: "05", label: "Fixes", href: "/fixes", glow: "#e8f8ff", shape: "oct", blurb: "Build a plan students back" },
];

export function Home() {
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);
  const hot = hovered != null ? BLOCKS[hovered] : null;

  return (
    <main className="relative h-[100dvh] min-h-[640px] overflow-hidden">
      <div className="absolute inset-0">
        <HeroScene blocks={BLOCKS} hovered={hovered} onHover={setHovered} onOpen={(h) => router.push(h)} />
      </div>

      {/* vignette so copy stays legible over the scene */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(4,7,11,0.75)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#04070b] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#04070b] via-[#04070b]/80 to-transparent" />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1320px] flex-col px-4 pb-6 pt-24 sm:px-8 sm:pt-28">
        <div className="max-w-xl">
          <div className="hud mb-4 flex items-center gap-2">
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-water-700" />
            Live survey · {headline.totalResponses.toLocaleString("en-IN")} responses
          </div>
          <Scramble
            as="h1"
            text="Water, on campus."
            duration={1100}
            className="block text-[44px] font-semibold leading-[0.98] tracking-[-0.045em] sm:text-[76px]"
          />
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
            Where rainwater pools, where it could be caught, and why bhawan taps keep running. Each block holds one
            part of the survey.
          </p>
        </div>

        {/* label for the hovered block */}
        <div className="pointer-events-none absolute right-4 top-28 hidden w-64 sm:right-8 sm:block">
          <AnimatePresence mode="wait">
            {!hot && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass ticks rounded-lg px-4 py-3"
              >
                <div className="hud">05 blocks</div>
                <div className="mt-1 text-[13px] text-muted-foreground">Hover a block to look inside. Click to open it.</div>
              </motion.div>
            )}
            {hot && (
              <motion.div
                key={hot.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="glass ticks rounded-lg px-4 py-3"
              >
                <div className="hud text-water-600">{hot.code} · click to open</div>
                <Scramble text={hot.label} className="mt-1 block text-[18px] font-medium tracking-[-0.01em]" duration={420} />
                <div className="mt-0.5 text-[12.5px] text-muted-foreground">{hot.blurb}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto">
          <div className="pointer-events-auto mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
            {BLOCKS.map((b, i) => (
              <Link
                key={b.code}
                href={b.href}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "group bg-[#060b10]/85 px-4 py-2.5 backdrop-blur transition-colors sm:py-3",
                  hovered === i && "bg-[#0d1a22]/90",
                  i === 4 && "col-span-2 sm:col-span-1"
                )}
              >
                <div className="hud flex items-center gap-2">
                  <span className={cn("text-water-600", hovered === i && "text-water-900")}>{b.code}</span>
                  <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">→</span>
                </div>
                <div className="mt-1 text-[14px] font-medium">{b.label}</div>
                <div className="hidden truncate text-[12px] text-muted-foreground sm:block">{b.blurb}</div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <Stat label="Worst waterlogging" value={headline.worstAreaShort} sub={`${headline.worstAreaSevere}% rated severe`} />
            <Stat label="Most tap waste" value={`${headline.tapBhawan} Bhawan`} sub={`${headline.tapCount} broken-tap reports`} />
            <Stat
              label="Avg. repair delay"
              value={<><Counter value={headline.avgDelay} decimals={1} /><span className="text-muted-foreground">/10</span></>}
              sub="students' rating"
            />
            <Stat
              label="Stuck in approvals"
              value={<><Counter value={headline.approvalShare} />%</>}
              sub="of waste complaints"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="border-l border-border pl-3">
      <div className="hud">{label}</div>
      <div className="mt-1 text-[18px] font-medium tracking-[-0.01em] sm:text-[20px]">{value}</div>
      <div className="text-[12px] text-muted-foreground">{sub}</div>
    </div>
  );
}
