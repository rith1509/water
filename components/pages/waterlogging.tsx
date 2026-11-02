"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Chips, Meter, Panel, Slider } from "@/components/site/bits";
import { Scramble } from "@/components/site/scramble";
import { WATERLOGGING_LABELS, YEAR_LABELS, locationDetail } from "@/data/surveyData";
import { cn } from "@/lib/utils";

type Spot = { full: string; short: string; x: number; y: number; below?: boolean };

// Schematic positions (not to scale)
const SPOTS: Spot[] = [
  { full: "SAC outside path leading to pool/OAT", short: WATERLOGGING_LABELS["SAC outside path leading to pool/OAT"], x: 572, y: 256 },
  { full: "Govind Bhawan corridors", short: WATERLOGGING_LABELS["Govind Bhawan corridors"], x: 192, y: 378 },
  { full: "LHC green gala side path", short: WATERLOGGING_LABELS["LHC green gala side path"], x: 182, y: 192 },
  { full: "Govind canteen area", short: WATERLOGGING_LABELS["Govind canteen area"], x: 346, y: 404, below: true },
  { full: "Tennis court area", short: WATERLOGGING_LABELS["Tennis court area"], x: 486, y: 412, below: true },
];

const FLOOD_R = 40;

const YEARS = [
  { value: "all", label: "All years" },
  { value: "1", label: "1st" },
  { value: "2", label: "2nd" },
  { value: "3", label: "3rd" },
  { value: "4", label: "4th" },
  { value: "5", label: "5th" },
] as const;
type YearSel = (typeof YEARS)[number]["value"];

function Building({ x, y, w, h, label, sub }: { x: number; y: number; w: number; h: number; label: string; sub?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="rgba(170,215,235,0.045)" stroke="rgba(175,220,240,0.18)" />
      <text x={x + 10} y={y + 20} fill="#b9ccd6" fontSize={11} fontFamily="var(--font-geist-mono)" letterSpacing="0.06em">
        {label}
      </text>
      {sub && (
        <text x={x + 10} y={y + 34} fill="#667b88" fontSize={10}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Map({
  rain,
  stress,
  selected,
  onSelect,
}: {
  rain: number;
  stress: Record<string, number>;
  selected: string;
  onSelect: (s: string) => void;
}) {
  const drops = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        x: (i * 97) % 800,
        d: ((i * 37) % 100) / 100,
        len: 10 + ((i * 13) % 14),
      })),
    []
  );
  const visible = Math.round((rain / 80) * drops.length);

  return (
    <svg viewBox="0 0 800 480" className="h-auto w-full select-none" role="img" aria-label="Schematic campus map">
      <defs>
        <radialGradient id="puddle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8fdcf2" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#2fa6c4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2fa6c4" stopOpacity="0" />
        </radialGradient>
        <pattern id="gridp" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(170,215,235,0.05)" />
        </pattern>
        <clipPath id="mapclip">
          <rect width="800" height="480" rx="10" />
        </clipPath>
      </defs>

      <g clipPath="url(#mapclip)">
        <rect width="800" height="480" fill="url(#gridp)" />

        {/* roads and paths */}
        <g stroke="rgba(175,220,240,0.14)" strokeWidth={14} strokeLinecap="round" fill="none">
          <path d="M40 300 H760" />
          <path d="M330 30 V460" />
        </g>
        <g stroke="rgba(175,220,240,0.22)" strokeWidth={2} strokeDasharray="2 6" fill="none">
          <path d="M100 192 H300" />
          <path d="M500 256 C560 256 600 230 640 210" />
          <path d="M500 256 C560 256 600 290 640 318" />
          <path d="M120 378 H300" />
        </g>

        <Building x={90} y={60} w={210} h={100} label="LHC" sub="Lecture hall complex" />
        <rect x={90} y={168} width={210} height={14} rx={4} fill="rgba(80,170,120,0.12)" />
        <text x={96} y={214} fill="#667b88" fontSize={10}>green gala side path</text>
        <Building x={380} y={210} w={120} h={90} label="SAC" sub="Student activity" />
        <Building x={640} y={170} w={110} h={66} label="POOL" />
        <Building x={640} y={292} w={110} h={66} label="OAT" />
        <Building x={70} y={330} w={240} h={110} label="GOVIND BHAWAN" sub="ground-floor corridors" />
        <Building x={316} y={366} w={64} h={22} label="CANTEEN" />
        <Building x={410} y={356} w={150} h={96} label="TENNIS" />
        <Building x={380} y={60} w={180} h={110} label="DEPARTMENTS" />

        {/* rain */}
        <g stroke="#a9e4f5" strokeOpacity={0.4} strokeWidth={1}>
          {drops.slice(0, visible).map((d, i) => (
            <line
              key={i}
              x1={d.x}
              x2={d.x - 4}
              y1={-30}
              y2={-30 + d.len}
              style={{
                animation: `drop ${0.9 - (rain / 80) * 0.35}s linear ${-d.d}s infinite`,
              }}
            />
          ))}
        </g>

        {/* puddles + hotspots */}
        {SPOTS.map((s) => {
          const k = stress[s.full] ?? 0;
          const r = rain < 4 ? 0 : 10 + k * rain * 0.85;
          const flooding = r > FLOOD_R;
          const lw = s.short.length * 6.6 + (flooding ? 70 : 16);
          const on = selected === s.full;
          return (
            <g
              key={s.full}
              onClick={() => onSelect(s.full)}
              className="cursor-pointer"
              data-cursor
              role="button"
              aria-label={s.short}
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(s.full)}
            >
              <motion.ellipse
                cx={s.x}
                cy={s.y}
                fill="url(#puddle)"
                animate={{ rx: r * 1.35, ry: r * 0.7 }}
                transition={{ type: "spring", stiffness: 70, damping: 16 }}
              />
              {rain >= 4 &&
                [0, 1].map((n) => (
                  <ellipse
                    key={n}
                    cx={s.x}
                    cy={s.y}
                    rx={6}
                    ry={3}
                    fill="none"
                    stroke="#bfeaf8"
                    strokeOpacity={0.5}
                    style={{
                      transformOrigin: `${s.x}px ${s.y}px`,
                      animation: `ripple ${2.6 - (rain / 80) * 1.4}s ease-out ${n * 0.9}s infinite`,
                    }}
                  />
                ))}
              <circle cx={s.x} cy={s.y} r={on ? 7 : 5} fill={on ? "#e8f8ff" : "#8fdcf2"} />
              <circle cx={s.x} cy={s.y} r={on ? 13 : 10} fill="none" stroke={on ? "#e8f8ff" : "#8fdcf2"} strokeOpacity={0.5} />
              <g transform={s.below ? `translate(${s.x - lw / 2}, ${s.y + 34})` : `translate(${s.x + 14}, ${s.y - 14})`}>
                <rect
                  x={0}
                  y={-13}
                  rx={4}
                  width={lw}
                  height={20}
                  fill="rgba(6,11,16,0.85)"
                  stroke={flooding ? "rgba(240,138,126,0.6)" : "rgba(175,220,240,0.2)"}
                />
                <text x={8} y={1} fill="#e4eef3" fontSize={11}>
                  {s.short}
                </text>
                {flooding && (
                  <text x={s.short.length * 6.6 + 12} y={1} fill="#f08a7e" fontSize={10} fontFamily="var(--font-geist-mono)">
                    FLOODED
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </g>
      <style>{`
        @keyframes drop { from { transform: translateY(0) } to { transform: translateY(540px) } }
        @keyframes ripple { from { transform: scale(1); opacity: .8 } to { transform: scale(7); opacity: 0 } }
      `}</style>
    </svg>
  );
}

export function WaterloggingPage() {
  const [rain, setRain] = useState(38);
  const [year, setYear] = useState<YearSel>("all");
  const [selected, setSelected] = useState(SPOTS[0].full);

  const [minY, maxY] = year === "all" ? [1, 5] : [Number(year), Number(year)];
  const details = useMemo(
    () => Object.fromEntries(SPOTS.map((s) => [s.full, locationDetail(s.full, minY, maxY)])),
    [minY, maxY]
  );
  const stress = useMemo(() => {
    const raw = Object.fromEntries(SPOTS.map((s) => [s.full, details[s.full].reports * details[s.full].avgSeverity]));
    const max = Math.max(...Object.values(raw), 1);
    return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v / max]));
  }, [details]);

  const d = details[selected];
  const spot = SPOTS.find((s) => s.full === selected)!;
  const ranked = [...SPOTS].sort((a, b) => stress[b.full] - stress[a.full]);
  const flooded = SPOTS.filter((s) => rain >= 4 && 10 + stress[s.full] * rain * 0.85 > FLOOD_R).length;
  const maxSev = Math.max(...d.severity.map((x) => x.n), 1);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Panel
        className="lg:col-span-8"
        label="Rain stress view · schematic, not to scale"
        title="Drag the rain. Watch where it pools."
        aside={
          <div className="hud text-right">
            <div className={cn(flooded ? "text-[#f08a7e]" : "text-water-700")}>
              {flooded} / {SPOTS.length} flooded
            </div>
          </div>
        }
        ticks
      >
        <div className="-mx-1 overflow-x-auto rounded-[10px] border border-border bg-[#050a0f] [scrollbar-width:thin]">
          <div className="min-w-[640px]">
            <Map rain={rain} stress={stress} selected={selected} onSelect={setSelected} />
          </div>
        </div>
        <div className="hud mt-2 sm:hidden">← swipe the map →</div>
        <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <Slider
            label="Rainfall intensity"
            value={rain}
            min={0}
            max={80}
            onChange={setRain}
            display={`${rain} mm/hr · ${rain < 4 ? "dry" : rain < 20 ? "light" : rain < 45 ? "heavy" : "cloudburst"}`}
          />
          <div>
            <div className="mb-1 text-[12.5px] text-muted-foreground">Who reported</div>
            <Chips options={[...YEARS]} value={year} onChange={setYear} />
          </div>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
          Puddle size scales with reports × average severity for each spot. It&apos;s a picture of what students
          reported, not a drainage model.
        </p>
      </Panel>

      <Panel className="lg:col-span-4" label="Selected spot">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected + year}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <Scramble as="h2" text={spot.short} className="block text-[24px] font-semibold tracking-[-0.02em]" duration={500} />
            <div className="mt-0.5 text-[12.5px] text-muted-foreground">{spot.full}</div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border p-3">
                <div className="hud">Reports</div>
                <div className="tabular mt-1 text-[24px] font-medium">{d.reports}</div>
              </div>
              <div className="rounded-md border border-border p-3">
                <div className="hud">Avg. severity</div>
                <div className="tabular mt-1 text-[24px] font-medium">
                  {d.reports ? d.avgSeverity : "–"}
                  <span className="text-[14px] text-muted-foreground">/5</span>
                </div>
              </div>
            </div>

            <div className="hud mb-2 mt-6">Severity</div>
            <div className="flex h-20 items-end gap-1.5">
              {d.severity.map((x) => (
                <div key={x.s} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t-[3px]"
                    style={{ background: x.s >= 4 ? "#8fdcf2" : "#1d5a73" }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(x.n / maxSev) * 64}px` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">{x.s}</span>
                </div>
              ))}
            </div>

            <div className="hud mb-2 mt-6">What students saw</div>
            <ul className="space-y-2.5">
              {d.issues.slice(0, 4).map((i) => (
                <li key={i.text} className="text-[13px] leading-snug">
                  <div className="flex gap-3">
                    <span className="flex-1 text-foreground/90">&ldquo;{i.text}&rdquo;</span>
                    <span className="tabular font-mono text-[12px] text-muted-foreground">×{i.n}</span>
                  </div>
                </li>
              ))}
              {d.issues.length === 0 && <li className="text-[13px] text-muted-foreground">No reports from this year.</li>}
            </ul>

            <div className="hud mb-2 mt-6">By year of study</div>
            <div className="space-y-1.5">
              {d.years.map((y) => (
                <div key={y.y} className="flex items-center gap-3 text-[12px]">
                  <span className="w-12 text-muted-foreground">{YEAR_LABELS[y.y]}</span>
                  <Meter value={y.n} max={Math.max(...d.years.map((v) => v.n), 1)} className="flex-1" />
                  <span className="tabular w-5 text-right">{y.n}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </Panel>

      <Panel className="lg:col-span-12" label="Ranked by stress" title="Which spot to fix first">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {ranked.map((s, i) => (
            <button
              key={s.full}
              onClick={() => setSelected(s.full)}
              className={cn(
                "rounded-md border p-3 text-left transition-colors",
                selected === s.full ? "border-water-600 bg-accent" : "border-border hover:border-water-400"
              )}
            >
              <div className="hud flex">
                <span className="text-water-600">#{i + 1}</span>
                <span className="ml-auto tabular">{Math.round(stress[s.full] * 100)}</span>
              </div>
              <div className="mt-1 text-[14px] font-medium">{s.short}</div>
              <Meter value={stress[s.full]} className="mt-2" />
              <div className="mt-2 text-[12px] text-muted-foreground">
                {details[s.full].reports} reports · sev {details[s.full].avgSeverity}
              </div>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
