"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sponsor, SponsorStage } from "@/types";
import { formatCHF, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { deleteSponsor } from "@/lib/supabase/actions";

export const STAGES: { key: SponsorStage; label: string }[] = [
  { key: "PROSPECT", label: "Prospect" },
  { key: "RESEARCH", label: "Research" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "REPLIED", label: "Replied" },
  { key: "INTERESTED", label: "Interested" },
  { key: "MEETING", label: "Meeting" },
  { key: "PROPOSAL", label: "Proposal" },
  { key: "NEGOTIATION", label: "Negotiation" },
  { key: "WON", label: "Won" },
  { key: "LOST", label: "Lost" },
];

export function SponsorKanban({ sponsors }: { sponsors: Sponsor[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => sponsors.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    [sponsors, query]
  );

  const byStage = useMemo(() => {
    const map = new Map<SponsorStage, Sponsor[]>();
    for (const stage of STAGES) map.set(stage.key, []);
    for (const s of filtered) map.get(s.stage)?.push(s);
    return map;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sponsors…"
          className="pl-9"
          aria-label="Search sponsors"
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const items = byStage.get(stage.key) ?? [];
          return (
            <div key={stage.key} className="w-72 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stage.label}</p>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((s) => (
                  <SponsorCard key={s.id} sponsor={s} />
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    No sponsors
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Remove ${sponsor.name} from the sponsor CRM? This can't be undone.`)) return;
    setPending(true);
    startTransition(async () => {
      await deleteSponsor(sponsor.id);
      setPending(false);
    });
  }

  return (
    <Link href={`/sponsors/${sponsor.id}`}>
      <Card className="p-3.5 transition-colors hover:border-primary/50 hover:bg-surface-2">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-tight">{sponsor.name}</p>
          <div className="flex shrink-0 items-center gap-1">
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs font-bold",
                sponsor.fit.overall >= 85 ? "bg-success/15 text-success" : sponsor.fit.overall >= 65 ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
              )}
            >
              {sponsor.fit.overall}
            </span>
            <button
              onClick={handleDelete}
              disabled={pending}
              aria-label={`Remove ${sponsor.name}`}
              className="focus-ring rounded p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{sponsor.category}</p>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="font-display font-semibold text-primary">{formatCHF(sponsor.potentialValue)}</span>
          <span className="text-muted-foreground">{timeAgo(sponsor.lastActivityDate)}</span>
        </div>
        <p className="mt-2 line-clamp-2 rounded-lg bg-surface-2 px-2 py-1.5 text-[11px] text-muted-foreground">
          {sponsor.nextAction}
        </p>
      </Card>
    </Link>
  );
}
