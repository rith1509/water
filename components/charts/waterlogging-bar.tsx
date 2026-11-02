"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { waterloggingByLocation } from "@/data/surveyData";
import { grid, muted, water } from "@/lib/palette";
import { ChartTooltip, Legend } from "./chart-tooltip";

function Tick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const words = (payload?.value ?? "").split(" ");
  // two lines at most: split roughly in half
  const mid = Math.ceil(words.length / 2);
  const lines = words.length > 2 ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] : [words.join(" ")];
  return (
    <text x={x} y={(y ?? 0) + 12} textAnchor="middle" fill={muted} fontSize={12}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

export function WaterloggingBar() {
  return (
    <div className="flex h-full flex-col gap-3">
      <Legend
        items={[
          { label: "Severe (4–5)", color: water[700] },
          { label: "Moderate (1–3)", color: water[300] },
        ]}
      />
      <div className="h-[268px] min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waterloggingByLocation} margin={{ top: 4, right: 4, left: -18, bottom: 8 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke={grid} />
            <XAxis dataKey="location" tickLine={false} axisLine={false} interval={0} height={40} tick={<Tick />} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: muted, fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: water[100], opacity: 0.6 }}
              content={
                <ChartTooltip
                  title={(_, p) => String(p[0]?.payload?.fullName ?? "")}
                  footer={(p) => {
                    const row = p[0]?.payload as { total: number; avgSeverity: number } | undefined;
                    return row ? `${row.total} reports · avg severity ${row.avgSeverity}/5` : null;
                  }}
                />
              }
            />
            <Bar dataKey="severe" name="Severe" stackId="s" fill={water[700]} maxBarSize={56} />
            <Bar dataKey="moderate" name="Moderate" stackId="s" fill={water[300]} radius={[3, 3, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
