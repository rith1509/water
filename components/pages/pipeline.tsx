"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chips, Counter, Panel, Slider } from "@/components/site/bits";
import { delayHistogram, issuesByBhawan, wasteProblems } from "@/data/surveyData";
import { silt, water } from "@/lib/palette";
import { cn } from "@/lib/utils";

const LEAKS = [
  { value: "drip", label: "Dripping", lph: 2 },
  { value: "trickle", label: "Trickling", lph: 30 },
  { value: "running", label: "Running", lph: 300 },
] as const;
type Leak = (typeof LEAKS)[number]["value"];

const FIX_WORK = 0.3; // days on site once the plumber has the job

type Lane = { name: string; color: string; nodes: string[]; segs: number[] };

function position(segs: number[], t: number) {
  // returns progress across nodes as a float index
  let acc = 0;
  for (let i = 0; i < segs.length; i++) {
    if (t <= acc + segs[i]) return i + (segs[i] === 0 ? 1 : (t - acc) / segs[i]);
    acc += segs[i];
  }
  return segs.length;
}

function LaneView({ lane, t, lph }: { lane: Lane; t: number; lph: number }) {
  const total = lane.segs.reduce((a, b) => a + b, 0);
  const done = t >= total;
  const p = position(lane.segs, Math.min(t, total));
  const n = lane.nodes.length - 1;
  const pct = (p / n) * 100;
  const days = Math.min(t, total);
  const litres = days * 24 * lph;
  const stageIndex = Math.min(Math.floor(p), n);

  return (
    <div className="rounded-lg border border-border p-4 sm:p-5">
      <div className="mb-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div className="text-[14px] font-medium" style={{ color: lane.color }}>
          {lane.name}
        </div>
        <div className="hud">
          {done ? "Fixed" : t === 0 ? "Waiting for a report" : `At: ${lane.nodes[stageIndex]}`}
        </div>
        <div className="ml-auto flex gap-6">
          <div className="text-right">
            <div className="hud">Days</div>
            <div className="tabular text-[20px] font-medium">{days.toFixed(1)}</div>
          </div>
          <div className="text-right">
            <div className="hud">Litres lost</div>
            <div className="tabular text-[20px] font-medium" style={{ color: done ? undefined : lane.color }}>
              {Math.round(litres).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-3 h-16">
        <div className="absolute inset-x-0 top-[9px] h-px bg-border" />
        <div
          className="absolute left-0 top-[9px] h-px transition-[width] duration-75"
          style={{ width: `${pct}%`, background: lane.color, boxShadow: `0 0 12px ${lane.color}` }}
        />
        {lane.nodes.map((node, i) => {
          const reached = p >= i;
          return (
            <div key={node} className="absolute top-0 -translate-x-1/2" style={{ left: `${(i / n) * 100}%` }}>
              <div
                className={cn("mx-auto size-[19px] rounded-full border-2 transition-colors", reached ? "" : "border-border bg-background")}
                style={reached ? { borderColor: lane.color, background: "#04070b" } : undefined}
              >
                {reached && <div className="m-[3px] size-[9px] rounded-full" style={{ background: lane.color }} />}
              </div>
              <div
                className={cn(
                  "mt-2 w-20 text-center text-[11px] leading-tight sm:w-24 sm:text-[12px]",
                  reached ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {node}
              </div>
            </div>
          );
        })}
        {t > 0 && !done && (
          <motion.div
            className="absolute top-[3px] size-[13px] -translate-x-1/2 rounded-full"
            style={{ left: `${pct}%`, background: "#fff", boxShadow: `0 0 0 4px ${lane.color}55, 0 0 18px ${lane.color}` }}
          />
        )}
      </div>
    </div>
  );
}

export function PipelinePage() {
  const [gs, setGs] = useState(1.5);
  const [sup, setSup] = useState(2);
  const [aw, setAw] = useState(2);
  const [pl, setPl] = useState(1.5);
  const [direct, setDirect] = useState(1);
  const [leak, setLeak] = useState<Leak>("running");
  const [speed, setSpeed] = useState<"1" | "3">("1");
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef<number | null>(null);

  const lph = LEAKS.find((l) => l.value === leak)!.lph;
  const old: Lane = {
    name: "Today: four sign-offs",
    color: silt,
    nodes: ["Leak reported", "Gen Sec", "Supervisor", "Asst. Warden", "Plumber", "Fixed"],
    segs: [gs, sup, aw, pl, FIX_WORK],
  };
  const fresh: Lane = {
    name: "Proposed: Channel-i SOS",
    color: water[700],
    nodes: ["Leak reported", "Channel-i ticket", "Plumber", "Fixed"],
    segs: [0.05, direct, FIX_WORK],
  };
  const oldTotal = old.segs.reduce((a, b) => a + b, 0);
  const newTotal = fresh.segs.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((v) => {
        const next = v + dt * (speed === "3" ? 3 : 1) * 1.6; // 1.6 days per second at 1×
        if (next >= oldTotal) {
          setRunning(false);
          return oldTotal;
        }
        return next;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [running, speed, oldTotal]);

  const finished = t >= oldTotal && t > 0;
  const savedLitres = (oldTotal - newTotal) * 24 * lph;
  const stuck = useMemo(() => issuesByBhawan.reduce((s, r) => s + r.approval, 0), []);
  const maxH = Math.max(...delayHistogram.map((d) => d.n));
  const bad = delayHistogram.filter((d) => d.d >= 8).reduce((s, d) => s + d.n, 0);

  const start = () => {
    setT(0);
    setRunning(true);
  };

  return (
    <div className="space-y-4">
      <Panel
        ticks
        label="Simulation · one leak, two routes"
        title="Report a leak and watch it travel"
        aside={
          <div className="flex items-center gap-2">
            <Chips options={[{ value: "1", label: "1×" }, { value: "3", label: "3×" }]} value={speed} onChange={setSpeed} />
            <button
              onClick={running ? () => setRunning(false) : start}
              className={cn(
                "h-9 rounded-md px-4 text-[13px] font-medium transition-colors",
                running ? "border border-border text-foreground" : "bg-water-700 text-primary-foreground hover:bg-water-900"
              )}
            >
              {running ? "Pause" : finished ? "Run again" : t > 0 ? "Restart" : "Report a leak"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <LaneView lane={old} t={t} lph={lph} />
          <LaneView lane={fresh} t={t} lph={lph} />
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: finished ? 1 : 0.35 }}
          className="mt-4 grid gap-3 rounded-lg border border-border bg-[linear-gradient(120deg,rgba(143,220,242,0.08),transparent)] p-4 sm:grid-cols-3"
        >
          <div>
            <div className="hud">Days saved</div>
            <div className="text-[30px] font-semibold tracking-[-0.02em]">
              <Counter key={`d${finished}${oldTotal}${newTotal}`} value={finished ? oldTotal - newTotal : 0} decimals={1} />
            </div>
          </div>
          <div>
            <div className="hud">Water saved, this leak</div>
            <div className="text-[30px] font-semibold tracking-[-0.02em]">
              <Counter key={`l${finished}${savedLitres}`} value={finished ? savedLitres : 0} />
              <span className="ml-1 text-[15px] font-normal text-muted-foreground">L</span>
            </div>
          </div>
          <div>
            <div className="hud">Across survey complaints</div>
            <div className="text-[30px] font-semibold tracking-[-0.02em]">
              <Counter key={`s${finished}${savedLitres}`} value={finished ? (savedLitres * stuck) / 1000 : 0} />
              <span className="ml-1 text-[15px] font-normal text-muted-foreground">kL</span>
            </div>
            <div className="text-[11.5px] text-muted-foreground">if all {stuck} approval-stuck reports leaked like this</div>
          </div>
        </motion.div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-7" label="Assumptions" title="Tune the wait at each step">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Slider label="Gen Sec forwards it" value={gs} min={0} max={7} step={0.5} onChange={setGs} display={`${gs} d`} />
            <Slider label="Supervisor approves" value={sup} min={0} max={7} step={0.5} onChange={setSup} display={`${sup} d`} />
            <Slider label="Asst. Warden signs off" value={aw} min={0} max={7} step={0.5} onChange={setAw} display={`${aw} d`} />
            <Slider label="Plumber is assigned" value={pl} min={0} max={7} step={0.5} onChange={setPl} display={`${pl} d`} />
            <Slider label="Channel-i → plumber" value={direct} min={0} max={4} step={0.25} onChange={setDirect} display={`${direct} d`} />
            <div>
              <div className="mb-1 text-[12.5px] text-muted-foreground">How bad is the leak</div>
              <Chips options={LEAKS.map((l) => ({ value: l.value, label: l.label }))} value={leak} onChange={setLeak} />
              <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">≈ {lph} L per hour</div>
            </div>
          </div>
          <p className="mt-5 text-[12px] leading-relaxed text-muted-foreground">
            Step times and flow rates are placeholders to play with, not measured values. Total today: {oldTotal.toFixed(1)} days.
            With Channel-i: {newTotal.toFixed(2)} days.
          </p>
        </Panel>

        <Panel className="lg:col-span-5" label="What students said" title="Repair delay rating">
          <div className="flex h-[170px] items-end gap-1.5">
            {delayHistogram.map((d) => (
              <div key={d.d} className="group flex flex-1 flex-col items-center gap-1">
                <span className="tabular text-[10.5px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">{d.n}</span>
                <motion.div
                  className="w-full rounded-t-[3px]"
                  style={{ background: d.d >= 8 ? silt : water[400] }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(d.n / maxH) * 130}px` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: d.d * 0.03, ease: [0.16, 1, 0.3, 1] }}
                />
                <span className="font-mono text-[10px] text-muted-foreground">{d.d}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-[13px] text-muted-foreground">
            <span className="text-[20px] font-medium text-silt">{Math.round((bad / wasteProblems.length) * 100)}%</span> of
            students rated the wait 8/10 or worse.
          </div>
        </Panel>
      </div>
    </div>
  );
}
