"use client";

import { animate, useInView, useMotionValue, useTransform, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Scramble } from "./scramble";

/** Page heading block used on every inner page. */
export function PageHeader({
  code,
  title,
  lede,
  children,
}: {
  code: string;
  title: string;
  lede: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <div className="hud mb-3 flex items-center gap-2">
          <span className="text-water-600">{code}</span>
          <span className="h-px w-8 bg-border" />
          <span>IIT Roorkee · student survey</span>
        </div>
        <Scramble
          as="h1"
          text={title}
          duration={900}
          className="block text-[34px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[52px]"
        />
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
      </div>
      {children}
    </div>
  );
}

/** Frosted panel with an optional HUD label row. */
export function Panel({
  label,
  title,
  aside,
  className,
  children,
  ticks,
}: {
  label?: string;
  title?: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  ticks?: boolean;
}) {
  return (
    <section className={cn("glass rounded-[var(--radius)] p-5", ticks && "ticks", className)}>
      {(label || title || aside) && (
        <div className="mb-4 flex items-start gap-4">
          <div className="min-w-0">
            {label && <div className="hud mb-1">{label}</div>}
            {title && <h2 className="text-[16px] font-medium tracking-[-0.01em]">{title}</h2>}
          </div>
          {aside && <div className="ml-auto shrink-0">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Number that counts up the first time it scrolls into view, and rolls to new values after. */
export function Counter({
  value,
  decimals = 0,
  className,
  format,
}: {
  value: number;
  decimals?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) =>
    format ? format(v) : v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [inView, value, mv]);
  return <motion.span ref={ref} className={cn("tabular", className)}>{text}</motion.span>;
}

/** Segmented chip group. */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-wrap gap-1 rounded-lg border border-border p-1", className)} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative rounded-md px-2.5 py-1 text-[12.5px] transition-colors",
            value === o.value ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId={`chip-${options.map((x) => x.value).join("")}`}
              className="absolute inset-0 rounded-md bg-water-700"
              transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Labelled range slider with its value on the right. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display?: React.ReactNode;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] text-muted-foreground">{label}</span>
        <span className="tabular font-mono text-[12.5px] text-foreground">{display ?? value}</span>
      </div>
      <input
        type="range"
        className="ice-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--fill" as string]: `${fill}%` }}
      />
    </label>
  );
}

/** Thin horizontal meter. */
export function Meter({ value, max = 1, color = "var(--water-700)", className }: { value: number; max?: number; color?: string; className?: string }) {
  return (
    <div className={cn("h-1 overflow-hidden rounded-full bg-muted", className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
