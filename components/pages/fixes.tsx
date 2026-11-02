"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { FixesDonut } from "@/components/charts/fixes-donut";
import { Chips, Counter, Panel } from "@/components/site/bits";
import {
  ACTION_TARGETS,
  BHAWANS,
  ISSUE_KEYS,
  actionVotes,
  issueShares,
  type IssueKey,
} from "@/data/surveyData";
import { silt, water } from "@/lib/palette";
import { cn } from "@/lib/utils";

type Sort = "yes" | "no" | "split";

const RING_LABELS: Record<IssueKey, string> = {
  coolers: "Dog coolers",
  taps: "Running taps",
  approval: "Approvals",
  flush: "Flush tanks",
  overflow: "Overflow",
};

const SHORT_ACTION: Record<string, string> = {
  "Install dog-proof mesh enclosures around ground floor coolers": "Dog-proof mesh on coolers",
  "Raise cooler platforms so dogs cannot reach the spout": "Raised cooler platforms",
  "Replace bathroom taps with push-button taps": "Push-button taps",
  "Install sensor taps in common washrooms": "Sensor taps",
  "Direct Channel-i SOS ticketing to plumber for leaks": "Channel-i SOS to plumber",
  "Track plumbing tickets publicly on Channel-i with SLA timers": "Public ticket tracker",
  "Keep spare tap washers and valves with bhawan maintenance staff": "Spares kept in bhawan",
  "Fit auto-cut float valves on overhead tanks": "Auto-cut tank valves",
  "Fine for deliberate tap damage via bhawan council": "Fines for tap damage",
  "Weekly student volunteer audit of running taps": "Weekly volunteer audit",
};

function Ring({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx={32} cy={32} r={r} fill="none" stroke="rgba(175,220,240,0.1)" strokeWidth={5} />
        <motion.circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - value) }}
          initial={{ strokeDashoffset: c }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </svg>
      <span className="text-[11.5px] leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}

export function FixesPage() {
  const [bhawan, setBhawan] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("yes");
  const [plan, setPlan] = useState<string[]>([
    "Direct Channel-i SOS ticketing to plumber for leaks",
    "Install dog-proof mesh enclosures around ground floor coolers",
  ]);

  const votes = useMemo(() => {
    const v = actionVotes(bhawan);
    const split = (x: (typeof v)[number]) => -Math.abs(x.yes - x.no) / Math.max(x.total, 1);
    return [...v].sort((a, b) =>
      sort === "yes" ? b.yesShare - a.yesShare : sort === "no" ? b.no / b.total - a.no / a.total : split(b) - split(a)
    );
  }, [bhawan, sort]);

  const allVotes = useMemo(() => actionVotes("all"), []);
  const covered = new Set<IssueKey>(plan.flatMap((a) => ACTION_TARGETS[a]));
  const coverage = ISSUE_KEYS.reduce((s, k) => s + (covered.has(k) ? issueShares[k] : 0), 0);
  const planVotes = allVotes.filter((v) => plan.includes(v.action));
  const support = planVotes.length
    ? planVotes.reduce((s, v) => s + v.yes, 0) / planVotes.reduce((s, v) => s + v.total, 0)
    : 0;
  const toggle = (a: string) => setPlan((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          className="lg:col-span-8"
          label="Willingness · each student rated one fix"
          title="Would you back it?"
          aside={
            <select
              value={bhawan}
              onChange={(e) => setBhawan(e.target.value)}
              className="h-8 rounded-md border border-input bg-card-solid px-2 text-[12.5px] outline-none"
              aria-label="Bhawan"
            >
              <option value="all">All bhawans</option>
              {BHAWANS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Chips
              options={[
                { value: "yes", label: "Most yes" },
                { value: "no", label: "Most no" },
                { value: "split", label: "Most split" },
              ]}
              value={sort}
              onChange={setSort}
            />
            <div className="hud ml-auto flex gap-4">
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-[2px]" style={{ background: "#f08a7e" }} />No</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-[2px]" style={{ background: "#3b4a54" }} />Maybe</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-[2px]" style={{ background: water[700] }} />Yes</span>
            </div>
          </div>
          <motion.ul layout className="space-y-1">
            <AnimatePresence initial={false}>
              {votes.map((v) => {
                const inPlan = plan.includes(v.action);
                return (
                  <motion.li
                    layout
                    key={v.action}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 32 }}
                  >
                    <button
                      onClick={() => toggle(v.action)}
                      className={cn(
                        "grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 rounded-md px-2 py-2 text-left transition-colors sm:grid-cols-[200px_1fr_auto]",
                        inPlan ? "bg-accent" : "hover:bg-muted"
                      )}
                      title={v.action}
                    >
                      <span className="flex items-center gap-2 text-[13px]">
                        <span
                          className={cn(
                            "grid size-3.5 shrink-0 place-items-center rounded-[3px] border text-[9px]",
                            inPlan ? "border-water-700 bg-water-700 text-primary-foreground" : "border-input"
                          )}
                        >
                          {inPlan && "✓"}
                        </span>
                        <span className="truncate">{SHORT_ACTION[v.action]}</span>
                      </span>
                      <span className="col-span-2 row-start-2 flex h-2.5 overflow-hidden rounded-full sm:col-span-1 sm:row-start-auto">
                        <motion.span layout style={{ background: "#f08a7e", width: `${(v.no / v.total) * 100}%` }} />
                        <motion.span layout style={{ background: "#3b4a54", width: `${(v.maybe / v.total) * 100}%` }} />
                        <motion.span layout style={{ background: water[700], width: `${(v.yes / v.total) * 100}%` }} />
                      </span>
                      <span className="tabular w-16 text-right text-[12.5px]">
                        {v.yesShare}% <span className="text-muted-foreground">yes</span>
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
          <p className="mt-3 text-[12px] text-muted-foreground">Click a row to add it to your plan. Small groups per bhawan, so read single-bhawan bars loosely.</p>
        </Panel>

        <Panel className="lg:col-span-4" label="Fix groups" title={bhawan === "all" ? "What students said yes to" : `Yes votes in ${bhawan}`}>
          <FixesDonut selected={bhawan} />
        </Panel>
      </div>

      <div id="plan" className="scroll-mt-24">
        <Panel ticks label="Plan builder" title="Pick fixes. See what they cover.">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(ACTION_TARGETS).map((a) => (
                  <button
                    key={a}
                    onClick={() => toggle(a)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                      plan.includes(a) ? "border-water-700 bg-water-700 text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {SHORT_ACTION[a]}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setPlan(Object.keys(ACTION_TARGETS))} className="hud rounded-md border border-border px-2.5 py-1.5 hover:text-foreground">Select all</button>
                <button onClick={() => setPlan([])} className="hud rounded-md border border-border px-2.5 py-1.5 hover:text-foreground">Clear</button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <div>
                <div className="hud">Complaints addressed</div>
                <div className="text-[56px] font-semibold leading-none tracking-[-0.04em]">
                  <Counter value={Math.round(coverage * 100)} />
                  <span className="text-[24px] text-muted-foreground">%</span>
                </div>
                <div className="mt-2 text-[12.5px] text-muted-foreground">
                  {plan.length} fix{plan.length === 1 ? "" : "es"} · {Math.round(support * 100)}% of raters said yes
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {ISSUE_KEYS.map((k) => (
                  <Ring
                    key={k}
                    value={covered.has(k) ? 1 : 0}
                    color={k === "approval" ? silt : water[700]}
                    label={RING_LABELS[k]}
                  />
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
