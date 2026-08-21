import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { pannaEvent } from "@/lib/data/event";
import { getLiveDashboardKpis } from "@/lib/supabase/repository";
import { formatCHF } from "@/lib/utils";

export async function EventSummary() {
  const e = pannaEvent;
  const kpis = await getLiveDashboardKpis();

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Event</p>
          <h2 className="text-lg font-semibold">{e.name}</h2>
        </div>
        <StatusBadge status={e.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric
          label="Players"
          value={`${kpis.playersConfirmed} / ${e.playerTarget}`}
          progress={(kpis.playersConfirmed / e.playerTarget) * 100}
        />
        <Metric
          label="Clubs"
          value={`${kpis.clubPartners} confirmed`}
          progress={(kpis.clubPartners / e.clubTarget) * 100}
        />
        <Metric
          label="Sponsors"
          value={`${kpis.sponsorsWon} confirmed`}
          progress={(kpis.sponsorsWon / e.sponsorTarget) * 100}
        />
        <div>
          <p className="text-xs text-muted-foreground">Digital reach</p>
          <p className="mt-0.5 text-sm font-semibold text-muted-foreground">Not yet tracked</p>
          <p className="mt-2 text-[11px] text-muted-foreground">No analytics source connected yet</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
        <p className="text-sm text-muted-foreground">Commercial pipeline</p>
        <p className="font-display text-lg font-bold text-primary">{formatCHF(kpis.sponsorPipeline)}</p>
      </div>
    </Card>
  );
}

function Metric({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
      <Progress value={progress} className="mt-2" />
    </div>
  );
}
