"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip, Legend } from "@/components/charts/chart-tooltip";
import { Chips, Counter, Meter, Panel } from "@/components/site/bits";
import { Scramble } from "@/components/site/scramble";
import { BHAWANS, ISSUE_KEYS, ISSUE_LABELS, bhawanProfiles, type IssueKey } from "@/data/surveyData";
import { muted, silt, water } from "@/lib/palette";
import { cn } from "@/lib/utils";

type Metric = "delay" | "taps" | "coolers" | "approval" | "support";

const METRICS: { value: Metric; label: string; unit: string; get: (p: (typeof bhawanProfiles)[number]) => number; fmt: (n: number) => string }[] = [
  { value: "delay", label: "Repair delay", unit: "avg /10", get: (p) => p.avgDelay, fmt: (n) => n.toFixed(1) },
  { value: "taps", label: "Tap waste", unit: "reports", get: (p) => p.issues.taps, fmt: (n) => String(n) },
  { value: "coolers", label: "Dog coolers", unit: "reports", get: (p) => p.issues.coolers, fmt: (n) => String(n) },
  { value: "approval", label: "Stuck in approvals", unit: "reports", get: (p) => p.issues.approval, fmt: (n) => String(n) },
  { value: "support", label: "Fix support", unit: "% yes", get: (p) => p.yesShare, fmt: (n) => `${n}` },
];

const ISSUE_COLORS: Record<IssueKey, string> = {
  approval: silt,
  taps: water[700],
  coolers: water[500],
  flush: water[300],
  overflow: "#3b4a54",
};

const SHORT: Record<IssueKey, string> = {
  approval: "Approvals",
  taps: "Taps",
  coolers: "Coolers",
  flush: "Flush",
  overflow: "Overflow",
};

export function BhawansPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = BHAWANS.includes(params.get("b") as never) ? (params.get("b") as string) : "Ganga";
  const [selected, setSelectedState] = useState(initial);
  const [metric, setMetric] = useState<Metric>("delay");
  const [compare, setCompare] = useState<string>("Govind");

  const setSelected = (b: string) => {
    setSelectedState(b);
    router.replace(`/bhawans?b=${encodeURIComponent(b)}`, { scroll: false });
  };

  const m = METRICS.find((x) => x.value === metric)!;
  const sorted = useMemo(() => [...bhawanProfiles].sort((a, b) => m.get(b) - m.get(a)), [m]);
  const max = Math.max(...bhawanProfiles.map(m.get));
  const min = Math.min(...bhawanProfiles.map(m.get));
  const p = bhawanProfiles.find((x) => x.bhawan === selected)!;
  const q = bhawanProfiles.find((x) => x.bhawan === compare)!;
  const rank = sorted.findIndex((x) => x.bhawan === selected) + 1;
  const maxDelayN = Math.max(...p.delays.map((d) => d.n), 1);

  const radar = ISSUE_KEYS.map((k) => ({
    issue: SHORT[k],
    [selected]: p.issues[k],
    [compare]: q.issues[k],
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="hud">Colour tiles by</span>
        <Chips options={METRICS.map((x) => ({ value: x.value, label: x.label }))} value={metric} onChange={setMetric} />
      </div>

      <motion.div layout className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {sorted.map((b, i) => {
          const v = m.get(b);
          const t = max === min ? 1 : (v - min) / (max - min);
          const on = b.bhawan === selected;
          return (
            <motion.button
              layout
              key={b.bhawan}
              onClick={() => setSelected(b.bhawan)}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className={cn(
                "group relative overflow-hidden rounded-lg border p-3.5 text-left",
                on ? "border-water-700" : "border-border hover:border-water-400"
              )}
              style={{
                background: `linear-gradient(160deg, rgba(${metric === "approval" ? "224,183,121" : "92,199,224"},${0.06 + t * 0.34}), rgba(10,16,22,0.7))`,
              }}
            >
              <div className="hud flex">
                <span className={on ? "text-water-900" : "text-water-600"}>#{String(i + 1).padStart(2, "0")}</span>
                <span className="ml-auto">{m.unit}</span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-2">
                <span className="text-[15px] font-medium">{b.bhawan}</span>
                <span className="tabular text-[22px] font-semibold leading-none tracking-[-0.02em]">{m.fmt(v)}</span>
              </div>
              {on && <motion.span layoutId="tile-ring" className="absolute inset-0 rounded-lg ring-1 ring-water-700" />}
            </motion.button>
          );
        })}
        <motion.div layout className="hidden flex-col justify-between rounded-lg border border-dashed border-border p-3.5 lg:flex">
          <div className="hud">Key</div>
          <div>
            <div className="mb-1.5 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, rgba(${metric === "approval" ? "224,183,121" : "92,199,224"},0.08), rgba(${metric === "approval" ? "224,183,121" : "92,199,224"},0.5))` }} />
            <div className="flex text-[11px] text-muted-foreground"><span>Lower</span><span className="ml-auto">Higher</span></div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-7" ticks>
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                <div>
                  <div className="hud">
                    Rank #{rank} of 11 · {m.label.toLowerCase()}
                  </div>
                  <Scramble as="h2" text={`${selected} Bhawan`} className="mt-1 block text-[30px] font-semibold tracking-[-0.03em]" duration={520} />
                </div>
                <div className="ml-auto flex gap-6">
                  <div>
                    <div className="hud">Reports</div>
                    <div className="text-[22px] font-medium"><Counter value={p.reports} /></div>
                  </div>
                  <div>
                    <div className="hud">Avg delay</div>
                    <div className="text-[22px] font-medium"><Counter value={p.avgDelay} decimals={1} /></div>
                  </div>
                  <div>
                    <div className="hud">Back fixes</div>
                    <div className="text-[22px] font-medium"><Counter value={p.yesShare} />%</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="hud mb-3">Main complaint</div>
                  <div className="space-y-2.5">
                    {ISSUE_KEYS.map((k) => (
                      <div key={k}>
                        <div className="mb-1 flex text-[12.5px]">
                          <span className="text-foreground/85">{ISSUE_LABELS[k]}</span>
                          <span className="tabular ml-auto text-muted-foreground">{p.issues[k]}</span>
                        </div>
                        <Meter value={p.issues[k]} max={p.reports} color={ISSUE_COLORS[k]} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="hud mb-3">Repair delay rating, 1 → 10</div>
                  <div className="flex h-[132px] items-end gap-1">
                    {p.delays.map((d) => (
                      <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
                        <motion.div
                          className="w-full rounded-t-[3px]"
                          style={{ background: d.d >= 8 ? silt : water[400] }}
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.n / maxDelayN) * 108}px` }}
                          transition={{ duration: 0.6, delay: d.d * 0.02, ease: [0.16, 1, 0.3, 1] }}
                        />
                        <span className="font-mono text-[10px] text-muted-foreground">{d.d}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-[12.5px] text-muted-foreground">
                    <span className="text-silt">{p.severeDelays}</span> of {p.reports} rated the wait 8 or worse. Top fix
                    here: <span className="text-foreground">{p.topFix}</span>.
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Panel>

        <Panel
          className="lg:col-span-5"
          label="Compare"
          title="Complaint shape"
          aside={
            <select
              value={compare}
              onChange={(e) => setCompare(e.target.value)}
              className="h-8 rounded-md border border-input bg-card-solid px-2 text-[12.5px] outline-none"
              aria-label="Compare with"
            >
              {BHAWANS.filter((b) => b !== selected).map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          }
        >
          <Legend
            items={[
              { label: selected, color: water[700] },
              { label: compare === selected ? "—" : compare, color: silt },
            ]}
          />
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke="rgba(170,215,235,0.12)" />
                <PolarAngleAxis dataKey="issue" tick={{ fill: muted, fontSize: 11.5 }} />
                <Tooltip content={<ChartTooltip />} />
                <Radar dataKey={compare} stroke={silt} fill={silt} fillOpacity={0.15} strokeWidth={1.5} />
                <Radar dataKey={selected} stroke={water[700]} fill={water[700]} fillOpacity={0.25} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[12px] text-muted-foreground">Click any tile above to change the first bhawan.</p>
        </Panel>
      </div>
    </div>
  );
}
