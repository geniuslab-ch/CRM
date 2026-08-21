"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { PlatformBadge } from "./platform-badge";
import { ContentOpportunity, ContentStatus } from "@/types";
import { formatDate, formatNumber } from "@/lib/utils";

const TABS: { value: ContentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "IDEA", label: "Opportunities" },
  { value: "READY", label: "Ready" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PUBLISHED", label: "Published" },
];

export function ContentBoard({ opportunities }: { opportunities: ContentOpportunity[] }) {
  const [tab, setTab] = useState<string>("ALL");

  const filtered = useMemo(
    () => (tab === "ALL" ? opportunities : opportunities.filter((o) => o.status === tab)),
    [opportunities, tab]
  );

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <PlatformBadge platform={c.platform} />
                <StatusBadge status={c.status} />
              </div>
              <p className="font-semibold leading-snug">{c.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">Triggered by: {c.trigger}</p>

              <div className="mt-3 space-y-1.5 text-sm">
                <p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hook: </span>
                  {c.hook}
                </p>
                <p className="text-muted-foreground">{c.caption}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground">
                  CTA: {c.cta}
                </span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground">
                  {c.suggestedFootage}
                </span>
                {c.sponsorIntegration && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">
                    {c.sponsorIntegration}
                  </span>
                )}
              </div>

              <div className="mt-auto pt-3 text-xs text-muted-foreground">
                {c.status === "SCHEDULED" && c.scheduledDate && <p>Scheduled for {formatDate(c.scheduledDate)}</p>}
                {c.status === "PUBLISHED" && c.performance && (
                  <p>
                    {formatNumber(c.performance.views)} views · {c.performance.engagementRate}% engagement
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No content in this view.</p>
        )}
      </div>
    </div>
  );
}
