"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FixesDonut } from "@/components/charts/fixes-donut";
import { WasteStackedBar } from "@/components/charts/waste-stacked-bar";
import { BHAWANS, bhawanStats, preferredFixes } from "@/data/surveyData";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[12px] text-muted-foreground">{label}</div>
      <div className="tabular truncate text-[15px] font-medium">{value}</div>
    </div>
  );
}

export function WasteTab() {
  const [bhawan, setBhawan] = useState<string>("all");
  const stats = bhawanStats(bhawan);
  const fixes = preferredFixes(bhawan);
  const scope = bhawan === "all" ? "all bhawans" : `${bhawan} Bhawan`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border bg-card px-5 py-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="w-full sm:w-56">
          <label htmlFor="bhawan" className="mb-1.5 block text-[12px] text-muted-foreground">
            Bhawan
          </label>
          <Select value={bhawan} onValueChange={setBhawan}>
            <SelectTrigger id="bhawan">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All bhawans</SelectItem>
              <SelectSeparator />
              {BHAWANS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden h-10 w-px bg-border sm:block" />
        <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-[auto_auto_1fr] md:gap-10">
          <Stat label="Responses" value={stats.responses} />
          <Stat label="Avg. repair delay" value={`${stats.avgDelay} / 10`} />
          <div className="col-span-2 md:col-span-1">
            <Stat label="Top issue" value={`${stats.topIssue} · ${stats.topIssueShare}%`} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>What wastes water, bhawan by bhawan</CardTitle>
            <CardDescription>
              Each student&apos;s main complaint. The gold band is repairs that sat in the Gen Sec → Supervisor →
              Assistant Warden → Plumber queue.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <WasteStackedBar selected={bhawan} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Fixes students would back</CardTitle>
            <CardDescription>
              Answers marked &ldquo;Yes&rdquo; in {scope}. {fixes.shares[0]?.name} leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <FixesDonut selected={bhawan} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
