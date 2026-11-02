"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { CartesianGrid, ReferenceArea, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, Cell } from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { Chips, Counter, Meter, Panel, Slider } from "@/components/site/bits";
import { COST_ORDER, REASONS, catchmentsAll, solutionPoints, type SolutionPoint } from "@/data/surveyData";
import { grid, muted, water } from "@/lib/palette";
import { cn } from "@/lib/utils";

/* ---------------- solutions bubble chart ---------------- */

type CostSel = "all" | (typeof COST_ORDER)[number];

function SolutionsMap({ selected, onSelect }: { selected: string; onSelect: (s: string) => void }) {
  const [cost, setCost] = useState<CostSel>("all");
  const data = solutionPoints.map((p) => ({ ...p, dim: cost !== "all" && p.cost !== cost }));
  const sel = solutionPoints.find((p) => p.name === selected)!;
  const quickWin = sel.feasibility >= 3.7 && sel.costIndex <= 1;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div>
        <Chips
          className="mb-4"
          value={cost}
          onChange={setCost}
          options={[{ value: "all", label: "Any cost" }, ...COST_ORDER.map((c) => ({ value: c, label: c }))]}
        />
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 16, bottom: 22, left: 0 }}>
              <CartesianGrid stroke={grid} />
              <ReferenceArea x1={3.6} x2={5} y1={-0.4} y2={1.15} fill="#8fdcf2" fillOpacity={0.06} stroke="#8fdcf2" strokeOpacity={0.25} strokeDasharray="3 4"
                label={{ value: "QUICK WINS", position: "insideTopRight", fill: "#8fdcf2", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              />
              <XAxis
                type="number"
                dataKey="feasibility"
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: muted, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Feasibility (avg rating) →", position: "insideBottom", offset: -14, fill: muted, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="costIndex"
                domain={[-0.4, 3.4]}
                ticks={[0, 1, 2, 3]}
                tickFormatter={(v) => COST_ORDER[v] ?? ""}
                tick={{ fill: muted, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <ZAxis type="number" dataKey="votes" range={[120, 1400]} />
              <Tooltip
                cursor={false}
                content={
                  <ChartTooltip
                    title={(_, p) => String((p[0]?.payload as SolutionPoint)?.name ?? "")}
                    format={(p) => p.value}
                  />
                }
              />
              <Scatter data={data} onClick={(p) => onSelect((p as unknown as SolutionPoint).name)} isAnimationActive={false}>
                {data.map((p) => (
                  <Cell
                    key={p.name}
                    fill={p.name === selected ? water[900] : water[600]}
                    fillOpacity={p.dim ? 0.08 : p.name === selected ? 0.95 : 0.45}
                    stroke={p.name === selected ? "#fff" : water[700]}
                    strokeOpacity={p.dim ? 0.15 : 0.8}
                    className="cursor-pointer"
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">Bubble size is the number of students who proposed it. Click one.</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={sel.name}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.25 }}
          className="rounded-lg border border-border p-4"
        >
          <div className="hud flex items-center gap-2">
            Selected
            {quickWin && <span className="rounded-[3px] bg-water-700 px-1.5 py-0.5 text-[9.5px] text-primary-foreground">Quick win</span>}
          </div>
          <h3 className="mt-2 text-[17px] font-medium leading-snug tracking-[-0.01em]">{sel.name}</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className="hud">Proposed by</div>
              <div className="tabular text-[22px] font-medium">{sel.votes}</div>
            </div>
            <div>
              <div className="hud">Feasibility</div>
              <div className="tabular text-[22px] font-medium">
                {sel.feasibility.toFixed(1)}
                <span className="text-[13px] text-muted-foreground">/5</span>
              </div>
            </div>
          </div>
          <div className="hud mb-2 mt-5">Cost students expect</div>
          <div className="space-y-2">
            {COST_ORDER.map((c) => (
              <div key={c} className="flex items-center gap-3 text-[12px]">
                <span className="w-16 text-muted-foreground">{c}</span>
                <Meter value={sel.costMix[c] ?? 0} max={sel.votes} className="flex-1" />
                <span className="tabular w-5 text-right">{sel.costMix[c] ?? 0}</span>
              </div>
            ))}
          </div>
          <div className="hud mb-2 mt-6">Most proposed</div>
          <ul className="space-y-0.5">
            {[...solutionPoints].sort((a, b) => b.votes - a.votes).slice(0, 5).map((p) => (
              <li key={p.name}>
                <button
                  onClick={() => onSelect(p.name)}
                  className={cn(
                    "flex w-full gap-2 rounded px-1.5 py-1 text-left text-[12px] transition-colors",
                    p.name === selected ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="truncate">{p.name}</span>
                  <span className="tabular ml-auto">{p.votes}</span>
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- catchment ranking ---------------- */

function Catchments({ active, onPick }: { active: string; onPick: (name: string) => void }) {
  const [reason, setReason] = useState<string>("all");
  const rows = useMemo(() => {
    const r = catchmentsAll.map((c) => ({ ...c, score: reason === "all" ? c.value : c.reasons[reason] ?? 0 }));
    return r.filter((c) => c.score > 0).sort((a, b) => b.score - a.score);
  }, [reason]);
  const max = rows[0]?.score ?? 1;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {["all", ...REASONS].map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[12px] transition-colors",
              reason === r ? "border-water-600 bg-accent text-foreground" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {r === "all" ? "Any reason" : r}
          </button>
        ))}
      </div>
      <motion.ul layout className="divide-y divide-border">
        <AnimatePresence initial={false}>
          {rows.slice(0, 8).map((c, i) => (
            <motion.li
              layout
              key={c.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <button
                onClick={() => onPick(c.name)}
                className={cn("group flex w-full items-center gap-3 py-2.5 text-left", active === c.name && "text-water-900")}
              >
                <span className="hud w-6 text-water-600">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px]">{c.short}</span>
                  <Meter value={c.score} max={max} className="mt-1.5" color={active === c.name ? "#e8f8ff" : undefined} />
                </span>
                <span className="hud hidden w-24 text-right sm:block">{c.kind}</span>
                <span className="tabular w-7 text-right text-[13px]">{c.score}</span>
                <span className="hud w-14 text-right text-water-600 opacity-0 transition-opacity group-hover:opacity-100">
                  calc →
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

/* ---------------- harvest calculator ---------------- */

const DEFAULTS: Record<string, { area: number; c: number }> = {
  "Dept. / LHC": { area: 2800, c: 0.85 },
  "Bhawan roof": { area: 1800, c: 0.85 },
  "Open ground": { area: 3200, c: 0.45 },
};

function Tank({ fill }: { fill: number }) {
  const level = Math.max(0, Math.min(1, fill));
  const y = 210 - level * 180;
  return (
    <svg viewBox="0 0 160 230" className="h-[230px] w-[160px]">
      <defs>
        <clipPath id="tank">
          <rect x={14} y={24} width={132} height={190} rx={14} />
        </clipPath>
        <linearGradient id="tankwater" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8fdcf2" stopOpacity="0.85" />
          <stop offset="1" stopColor="#1f7f9c" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect x={14} y={24} width={132} height={190} rx={14} fill="rgba(170,215,235,0.04)" stroke="rgba(175,220,240,0.25)" />
      <g clipPath="url(#tank)">
        <motion.g animate={{ y }} initial={{ y: 210 }} transition={{ type: "spring", stiffness: 40, damping: 14 }}>
          <path
            d="M0 10 Q 20 0 40 10 T 80 10 T 120 10 T 160 10 T 200 10 T 240 10 V 260 H 0 Z"
            fill="url(#tankwater)"
            style={{ animation: "wave 3s linear infinite" }}
          />
          <path
            d="M0 12 Q 20 4 40 12 T 80 12 T 120 12 T 160 12 T 200 12 T 240 12 V 260 H 0 Z"
            fill="#8fdcf2"
            opacity={0.25}
            style={{ animation: "wave 4.6s linear infinite reverse" }}
          />
        </motion.g>
      </g>
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={14} x2={24} y1={214 - t * 190} y2={214 - t * 190} stroke="rgba(175,220,240,0.35)" />
      ))}
      <rect x={60} y={10} width={40} height={14} rx={3} fill="rgba(175,220,240,0.18)" />
      <style>{`@keyframes wave { from { transform: translateX(0) } to { transform: translateX(-80px) } }`}</style>
    </svg>
  );
}

function Calculator({ catchment, onCatchment }: { catchment: string; onCatchment: (s: string) => void }) {
  const c = catchmentsAll.find((x) => x.name === catchment) ?? catchmentsAll[0];
  const base = DEFAULTS[c.kind];
  const [areas, setAreas] = useState<Record<string, number>>({});
  const area = areas[c.name] ?? base.area;
  const [rainfall, setRainfall] = useState(1000);
  const [capacity, setCapacity] = useState(200000);
  const [coef, setCoef] = useState<number | null>(null);
  const C = coef ?? base.c;

  const litres = area * rainfall * C; // m² × mm = litres
  const fills = litres / capacity;
  const tankers = litres / 10000;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1 block text-[12.5px] text-muted-foreground">Catchment</span>
          <select
            value={c.name}
            onChange={(e) => {
              onCatchment(e.target.value);
              setCoef(null);
            }}
            className="h-9 w-full rounded-md border border-input bg-card-solid px-3 text-[13.5px] outline-none focus:border-water-600"
          >
            {catchmentsAll.map((x) => (
              <option key={x.name} value={x.name}>
                {x.short} · {x.value} votes
              </option>
            ))}
          </select>
        </label>
        <Slider
          label="Catchment area"
          value={area}
          min={200}
          max={8000}
          step={100}
          onChange={(v) => setAreas((a) => ({ ...a, [c.name]: v }))}
          display={`${area.toLocaleString("en-IN")} m²`}
        />
        <Slider label="Annual rainfall" value={rainfall} min={400} max={1800} step={20} onChange={setRainfall} display={`${rainfall} mm`} />
        <Slider
          label="Runoff coefficient"
          value={C}
          min={0.2}
          max={0.95}
          step={0.05}
          onChange={setCoef}
          display={`${C.toFixed(2)} · ${C > 0.75 ? "hard roof" : C > 0.5 ? "paved" : "soil / grass"}`}
        />
        <Slider
          label="Storage tank"
          value={capacity}
          min={20000}
          max={1000000}
          step={10000}
          onChange={setCapacity}
          display={`${(capacity / 1000).toLocaleString("en-IN")} kL`}
        />
      </div>

      <div className="flex justify-center">
        <Tank fill={Math.min(fills, 1)} />
      </div>

      <div>
        <div className="hud">Could be caught each year</div>
        <div className="mt-2 text-[44px] font-semibold leading-none tracking-[-0.03em] sm:text-[54px]">
          <Counter value={litres / 1000} format={(n) => Math.round(n).toLocaleString("en-IN")} />
          <span className="ml-1.5 text-[18px] font-normal text-muted-foreground">kL</span>
        </div>
        <div className="mt-1 text-[13px] text-muted-foreground">
          = {area.toLocaleString("en-IN")} m² × {rainfall} mm × {C.toFixed(2)}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border p-3">
            <div className="hud">Tank fills</div>
            <div className="tabular mt-1 text-[22px] font-medium">{fills >= 10 ? Math.round(fills) : fills.toFixed(1)}×</div>
            <div className="text-[11.5px] text-muted-foreground">per year</div>
          </div>
          <div className="rounded-md border border-border p-3">
            <div className="hud">Tanker loads</div>
            <div className="tabular mt-1 text-[22px] font-medium">{Math.round(tankers).toLocaleString("en-IN")}</div>
            <div className="text-[11.5px] text-muted-foreground">at 10 kL each</div>
          </div>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
          Areas, rainfall and coefficients are starting guesses. Set them to measured values before quoting a number.
        </p>
      </div>
    </div>
  );
}

export function HarvestingPage() {
  const [solution, setSolution] = useState(
    [...solutionPoints].filter((p) => p.feasibility >= 3.7 && p.costIndex <= 1).sort((a, b) => b.votes - a.votes)[0]?.name ??
      solutionPoints[0].name
  );
  const [catchment, setCatchment] = useState(catchmentsAll[0].name);

  return (
    <div className="space-y-4">
      <Panel label="12 proposals · 200 students" title="What to build: feasibility against cost" ticks>
        <SolutionsMap selected={solution} onSelect={setSolution} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-5" label="Where to catch it" title="Suggested catchments">
          <Catchments
            active={catchment}
            onPick={(n) => {
              setCatchment(n);
              document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </Panel>
        <div id="calculator" className="scroll-mt-24 lg:col-span-7">
          <Panel label="Harvest calculator" title="How much would it catch?" className="h-full" ticks>
            <Calculator catchment={catchment} onCatchment={setCatchment} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
