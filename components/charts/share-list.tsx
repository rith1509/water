"use client";

import type { ShareRow } from "@/data/surveyData";
import { cn } from "@/lib/utils";

/**
 * Ruled list of name / count / share.
 * Default: a colour swatch per row (legend for a pie or donut).
 * `bars`: a thin proportional bar under each name instead, for lists with no chart.
 */
export function ShareList({
  rows,
  colors,
  active,
  onHover,
  bars,
  className,
}: {
  rows: ShareRow[];
  colors: string[];
  active?: number | null;
  onHover?: (i: number | null) => void;
  bars?: boolean;
  className?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ul className={cn("divide-y divide-border text-[13px]", className)} onMouseLeave={() => onHover?.(null)}>
      {rows.map((r, i) => (
        <li
          key={r.name}
          onMouseEnter={() => onHover?.(i)}
          className={cn(
            "flex items-center gap-2.5 py-2 transition-opacity",
            active != null && active !== i && "opacity-45"
          )}
        >
          {!bars && (
            <span className="size-2.5 shrink-0 rounded-[2px]" style={{ background: colors[i % colors.length] }} aria-hidden />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate">{r.name}</span>
            {bars && (
              <span className="mt-1.5 block h-1 rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${(r.value / max) * 100}%`, background: colors[0] }}
                />
              </span>
            )}
          </span>
          <span className="tabular w-8 text-right text-muted-foreground">{r.value}</span>
          <span className="tabular w-10 text-right font-medium">{r.share}%</span>
        </li>
      ))}
    </ul>
  );
}
