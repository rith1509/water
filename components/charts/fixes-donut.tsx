"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { preferredFixes } from "@/data/surveyData";
import { series } from "@/lib/palette";
import { ChartTooltip } from "./chart-tooltip";
import { ShareList } from "./share-list";

export function FixesDonut({ selected }: { selected: string }) {
  const [active, setActive] = useState<number | null>(null);
  const { shares, yes, total, yesShare } = preferredFixes(selected);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto aspect-square w-full max-w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={shares}
              dataKey="value"
              nameKey="name"
              innerRadius="66%"
              outerRadius="100%"
              paddingAngle={1.5}
              isAnimationActive={false}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {shares.map((s, i) => (
                <Cell key={s.name} fill={series[i % series.length]} fillOpacity={active == null || active === i ? 1 : 0.35} />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip
                  title={() => "Would back it"}
                  format={(p) => `${p.value} (${(p.payload as { share?: number })?.share}%)`}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-[26px] font-semibold leading-none tracking-[-0.02em]">{yesShare}%</span>
          <span className="mt-1 text-[11.5px] text-muted-foreground">
            said yes · {yes}/{total}
          </span>
        </div>
      </div>
      <ShareList rows={shares} colors={series} active={active} onHover={setActive} />
    </div>
  );
}
