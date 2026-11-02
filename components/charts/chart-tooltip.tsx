"use client";

type Item = {
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown> & { fill?: string };
  dataKey?: string | number;
};

type Props = {
  active?: boolean;
  label?: string | number;
  payload?: Item[];
  title?: (label: string | number | undefined, payload: Item[]) => React.ReactNode;
  format?: (item: Item) => React.ReactNode;
  footer?: (payload: Item[]) => React.ReactNode;
  hideZero?: boolean;
};

export function ChartTooltip({ active, payload, label, title, format, footer, hideZero }: Props) {
  if (!active || !payload?.length) return null;
  const items = hideZero ? payload.filter((p) => Number(p.value) > 0) : payload;

  return (
    <div className="min-w-44 rounded-md border border-border bg-card-solid px-3 py-2.5 text-[12.5px] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)]">
      <div className="mb-1.5 font-medium text-foreground">{title ? title(label, payload) : label}</div>
      <div className="space-y-1">
        {items.map((p) => (
          <div key={String(p.dataKey ?? p.name)} className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ background: p.color ?? p.payload?.fill }}
              aria-hidden
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="tabular ml-auto pl-4 font-medium text-foreground">
              {format ? format(p) : p.value}
            </span>
          </div>
        ))}
      </div>
      {footer && <div className="mt-2 border-t border-border pt-1.5 text-muted-foreground">{footer(payload)}</div>}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="size-2 rounded-[2px]" style={{ background: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
