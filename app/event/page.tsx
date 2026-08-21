import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { EventChecklist } from "@/components/event/checklist";
import { pannaEvent } from "@/lib/data/event";
import { formatCHF, formatNumber } from "@/lib/utils";
import { MapPin, Users, Shield, Handshake, Radio } from "lucide-react";

export default function EventPage() {
  const e = pannaEvent;

  return (
    <div className="space-y-6">
      <PageHeader title="Event Control Center" description="Everything needed to launch the first Panna League Switzerland event." />

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Event</p>
            <h2 className="font-display text-2xl font-bold">{e.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {e.city} · Venue: {e.venue ?? "TBD"} · Date: {e.date ?? "TBD"}
            </p>
          </div>
          <StatusBadge status={e.status} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat icon={Users} label="Players" value={`${e.playersConfirmed} / ${e.playerTarget}`} progress={(e.playersConfirmed / e.playerTarget) * 100} />
          <Stat icon={Shield} label="Clubs" value={String(e.clubsConfirmed)} progress={(e.clubsConfirmed / e.clubTarget) * 100} />
          <Stat icon={Handshake} label="Sponsors" value={String(e.sponsorsConfirmed)} progress={(e.sponsorsConfirmed / e.sponsorTarget) * 100} />
          <Stat
            icon={Radio}
            label="Digital audience target"
            value={formatNumber(e.digitalAudienceTarget)}
            progress={(e.estimatedReach / e.digitalAudienceTarget) * 100}
          />
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Commercial pipeline</p>
          <p className="font-display text-2xl font-bold text-primary">{formatCHF(e.commercialPipeline)}</p>
        </div>
      </Card>

      <EventChecklist items={e.checklist} />

      <Card>
        <CardHeader>
          <CardTitle>Launch readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {e.status === "PRE_LAUNCH"
              ? "Panna League Switzerland is in pre-launch — the AI team is actively filling the roster, sponsor pipeline and content calendar ahead of the venue and date announcement."
              : "Event is progressing toward launch."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  progress,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <Progress value={progress} className="mt-2" />
    </div>
  );
}
