"use client";

import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformBadge } from "./platform-badge";
import { ContentOpportunity, ContentStatus } from "@/types";
import { formatDate, formatNumber } from "@/lib/utils";
import { setContentIdeaStatus, removeContentIdea } from "@/lib/supabase/actions";

const TABS: { value: ContentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "IDEA", label: "Opportunities" },
  { value: "READY", label: "Ready" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PUBLISHED", label: "Published" },
];

const STATUSES: ContentStatus[] = ["IDEA", "READY", "SCHEDULED", "PUBLISHED"];

export function ContentBoard({ opportunities }: { opportunities: ContentOpportunity[] }) {
  const [tab, setTab] = useState<string>("ALL");
  const [overrides, setOverrides] = useState<Record<string, ContentStatus>>({});
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const visible = opportunities.filter((o) => !removed.has(o.id));

  const filtered = useMemo(
    () => (tab === "ALL" ? visible : visible.filter((o) => (overrides[o.id] ?? o.status) === tab)),
    [visible, tab, overrides]
  );

  function handleStatusChange(id: string, status: ContentStatus) {
    setOverrides((prev) => ({ ...prev, [id]: status }));
    startTransition(async () => {
      await setContentIdeaStatus(id, status);
    });
  }

  function handleDelete(id: string) {
    setRemoved((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await removeContentIdea(id);
    });
  }

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
        {filtered.map((c) => {
          const effectiveStatus = overrides[c.id] ?? c.status;
          return (
          <Card key={c.id} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <PlatformBadge platform={c.platform} />
                <div className="flex items-center gap-1.5">
                  <select
                    value={effectiveStatus}
                    onChange={(e) => handleStatusChange(c.id, e.target.value as ContentStatus)}
                    aria-label={`Status for ${c.title}`}
                    className="focus-ring rounded-lg border border-border bg-surface-2 px-1.5 py-0.5 text-[11px]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(c.id)}
                    aria-label={`Delete ${c.title}`}
                    className="focus-ring rounded p-1 text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
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
                {effectiveStatus === "SCHEDULED" && c.scheduledDate && <p>Scheduled for {formatDate(c.scheduledDate)}</p>}
                {effectiveStatus === "PUBLISHED" && c.performance && (
                  <p>
                    {formatNumber(c.performance.views)} views · {c.performance.engagementRate}% engagement
                  </p>
                )}
                {effectiveStatus === "PUBLISHED" && !c.performance && <p>No performance data entered yet.</p>}
              </div>
            </CardContent>
          </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No content in this view.</p>
        )}
      </div>
    </div>
  );
}
