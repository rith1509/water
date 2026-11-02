"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { avgFeasibilityByGroup, solutionShares } from "@/data/surveyData";
import { series } from "@/lib/palette";
import { ChartTooltip } from "./chart-tooltip";
import { ShareList } from "./share-list";

export function SolutionsPie() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto aspect-square w-full max-w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={solutionShares}
              dataKey="value"
              nameKey="name"
              innerRadius={0}
              outerRadius="100%"
              stroke="#fff"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {solutionShares.map((s, i) => (
                <Cell
                  key={s.name}
                  fill={series[i % series.length]}
                  fillOpacity={active == null || active === i ? 1 : 0.35}
                />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip
                  title={() => "Proposed solution"}
                  format={(p) => `${p.value} (${(p.payload as { share?: number })?.share}%)`}
                  footer={(p) => {
                    const n = String(p[0]?.name ?? "");
                    return avgFeasibilityByGroup[n] ? `Avg feasibility ${avgFeasibilityByGroup[n]}/5` : null;
                  }}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ShareList rows={solutionShares} colors={series} active={active} onHover={setActive} />
    </div>
  );
}
