import { Card } from "@/components/ui/card";
import { headline } from "@/data/surveyData";
import { cn } from "@/lib/utils";

type Metric = {
  label: string;
  value: React.ReactNode;
  note: React.ReactNode;
  lead?: boolean;
};

const metrics: Metric[] = [
  {
    label: "Total responses",
    value: headline.totalResponses.toLocaleString("en-IN"),
    note: `${headline.perModule} each across ${headline.modules} survey modules`,
    lead: true,
  },
  {
    label: "Worst waterlogging",
    value: headline.worstAreaShort,
    note: `${headline.worstAreaReports} reports, ${headline.worstAreaSevere}% rated severe`,
  },
  {
    label: "Most tap waste",
    value: `${headline.tapBhawan} Bhawan`,
    note: `${headline.tapCount} broken or running tap reports`,
  },
  {
    label: "Avg. repair delay",
    value: (
      <>
        {headline.avgDelay}
        <span className="ml-0.5 text-[15px] font-normal text-muted-foreground">/10</span>
      </>
    ),
    note: `${headline.approvalShare}% blame the four-step approval chain`,
  },
];

export function Metrics() {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card
          key={m.label}
          className={cn(
            "justify-between gap-6 px-5 py-4",
            m.lead && "border-water-500/50 bg-[linear-gradient(160deg,rgba(92,199,224,0.22),rgba(16,26,35,0.6))]"
          )}
        >
          <div className={cn("text-[12.5px]", m.lead ? "text-water-700" : "text-muted-foreground")}>{m.label}</div>
          <div>
            <div
              className={cn(
                "tabular font-semibold leading-tight tracking-[-0.02em]",
                m.lead ? "text-[34px]" : "text-[22px] sm:text-[24px]"
              )}
            >
              {m.value}
            </div>
            <div className={cn("mt-1 text-[12.5px] leading-snug", m.lead ? "text-foreground/70" : "text-muted-foreground")}>
              {m.note}
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}
