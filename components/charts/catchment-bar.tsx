"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { topCatchments } from "@/data/surveyData";
import { ink, muted, water } from "@/lib/palette";
import { ChartTooltip } from "./chart-tooltip";

export function CatchmentBar() {
  const max = topCatchments[0]?.value ?? 1;

  return (
    <div className="h-[392px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topCatchments} layout="vertical" margin={{ top: 0, right: 36, left: 0, bottom: 0 }} barCategoryGap="22%">
          <XAxis type="number" hide domain={[0, Math.ceil(max * 1.05)]} />
          <YAxis
            type="category"
            dataKey="name"
            width={172}
            tickLine={false}
            axisLine={false}
            tick={{ fill: ink, fontSize: 12.5 }}
          />
          <Tooltip
            cursor={{ fill: water[100], opacity: 0.6 }}
            content={
              <ChartTooltip
                title={(_, p) => String(p[0]?.payload?.fullName ?? "")}
                format={(p) => `${p.value} students`}
              />
            }
          />
          <Bar dataKey="value" name="Suggested by" radius={[0, 3, 3, 0]} isAnimationActive={false}>
            {topCatchments.map((c, i) => (
              <Cell key={c.name} fill={i < 3 ? water[600] : water[300]} />
            ))}
            <LabelList dataKey="value" position="right" offset={8} fill={muted} fontSize={12} className="tabular" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
