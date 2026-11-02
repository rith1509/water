"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ISSUE_LABELS, issuesByBhawan, type IssueKey } from "@/data/surveyData";
import { grid, ink, muted, silt, stone, water } from "@/lib/palette";
import { useNarrow } from "@/lib/use-narrow";
import { ChartTooltip, Legend } from "./chart-tooltip";

// Bottom to top. The approval chain sits on the baseline so it is comparable across bhawans.
const STACK: { key: IssueKey; color: string }[] = [
  { key: "approval", color: silt },
  { key: "taps", color: water[700] },
  { key: "coolers", color: water[500] },
  { key: "flush", color: water[300] },
  { key: "overflow", color: stone },
];

const maxTotal = Math.max(...issuesByBhawan.map((r) => r.total));
const top = Math.ceil(maxTotal / 5) * 5;
const ticks = Array.from({ length: top / 5 + 1 }, (_, i) => i * 5);

export function WasteStackedBar({ selected }: { selected: string }) {
  const narrow = useNarrow();
  const dim = (bhawan: string) => (selected === "all" || selected === bhawan ? 1 : 0.22);
  const tick = { fill: muted, fontSize: 12 };

  return (
    <div className="flex flex-col gap-3">
      <Legend items={STACK.map((s) => ({ label: ISSUE_LABELS[s.key], color: s.color }))} />
      <div className={narrow ? "h-[400px]" : "h-[372px]"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={issuesByBhawan}
            layout={narrow ? "vertical" : "horizontal"}
            margin={narrow ? { top: 0, right: 8, left: 0, bottom: 0 } : { top: 8, right: 4, left: -18, bottom: 0 }}
            barCategoryGap={narrow ? "18%" : "24%"}
          >
            <CartesianGrid vertical={narrow} horizontal={!narrow} stroke={grid} />
            {narrow ? (
              <>
                <XAxis type="number" ticks={ticks} domain={[0, top]} tickLine={false} axisLine={false} tick={tick} />
                <YAxis
                  type="category"
                  dataKey="bhawan"
                  width={66}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fill: ink, fontSize: 12 }}
                />
              </>
            ) : (
              <>
                <XAxis dataKey="bhawan" tickLine={false} axisLine={false} interval={0} tick={tick} />
                <YAxis ticks={ticks} domain={[0, top]} tickLine={false} axisLine={false} tick={tick} />
              </>
            )}
            <Tooltip
              cursor={{ fill: water[100], opacity: 0.6 }}
              content={
                <ChartTooltip
                  title={(l) => `${l} Bhawan`}
                  hideZero
                  footer={(p) => `${(p[0]?.payload as { total?: number })?.total ?? 0} responses`}
                />
              }
            />
            {STACK.map((s, i) => {
              const last = i === STACK.length - 1;
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={ISSUE_LABELS[s.key]}
                  stackId="b"
                  fill={s.color}
                  radius={last ? (narrow ? [0, 3, 3, 0] : [3, 3, 0, 0]) : 0}
                  maxBarSize={44}
                >
                  {issuesByBhawan.map((row) => (
                    <Cell key={row.bhawan} fillOpacity={dim(row.bhawan)} />
                  ))}
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
