import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { getEvents } from "@/lib/supabase/repository";
import { formatCHF } from "@/lib/utils";

export async function EventSummary() {
  const { data: events } = await getEvents();
  const e = events.find((ev) => ev.isPrimary) ?? events[0] ?? null;

  if (!e) {
    return (
      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          No event set up yet — create one in the Event Control Center.
        </p>
      </Card>
    );
  }

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
          value={`${e.playersConfirmed} / ${e.playerTarget}`}
          progress={(e.playersConfirmed / e.playerTarget) * 100}
        />
        <Metric label="Clubs" value={`${e.clubsConfirmed} confirmed`} progress={(e.clubsConfirmed / e.clubTarget) * 100} />
        <Metric
          label="Sponsors"
          value={`${e.sponsorsConfirmed} confirmed`}
          progress={(e.sponsorsConfirmed / e.sponsorTarget) * 100}
        />
        <div>
          <p className="text-xs text-muted-foreground">Digital reach</p>
          <p className="mt-0.5 text-sm font-semibold text-muted-foreground">Not yet tracked</p>
          <p className="mt-2 text-[11px] text-muted-foreground">No analytics source connected yet</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
        <p className="text-sm text-muted-foreground">Commercial pipeline</p>
        <p className="font-display text-lg font-bold text-primary">{formatCHF(e.commercialPipeline)}</p>
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
