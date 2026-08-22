import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { EventChecklist } from "@/components/event/checklist";
import { AddEventDialog } from "@/components/event/add-event-dialog";
import { EditEventDialog } from "@/components/event/edit-event-dialog";
import { DeleteEventButton } from "@/components/event/delete-event-button";
import { getEvents } from "@/lib/supabase/repository";
import { PannaEvent } from "@/types";
import { formatCHF, formatNumber } from "@/lib/utils";
import { MapPin, Users, Shield, Handshake, Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventPage() {
  const { data: events, source } = await getEvents();
  const primary = events.find((e) => e.isPrimary) ?? null;
  const others = events.filter((e) => !e.isPrimary);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Control Center"
        description="Everything needed to launch Panna League events — one city at a time."
        action={
          <div className="flex items-center gap-2">
            <DataSourceBadge source={source} />
            <AddEventDialog />
          </div>
        }
      />

      {!primary && others.length === 0 && (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            No event set up yet. Run the schema migration (creates the real Panna League First — Lausanne event), or
            add one above.
          </p>
        </Card>
      )}

      {primary && <PrimaryEventCard event={primary} />}
      {primary && <EventChecklist eventId={primary.id} items={primary.checklist} />}

      {others.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-bold">Other events</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((e) => (
              <SecondaryEventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PrimaryEventCard({ event: e }: { event: PannaEvent }) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Primary event{e.edition ? ` · Edition N°${e.edition}` : ""}
          </p>
          <h2 className="font-display text-2xl font-bold">{e.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {e.city} · Venue: {e.venue ?? "TBD"} · Date: {e.date ?? "TBD"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={e.status} />
          <EditEventDialog event={e} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={Users} label="Players" value={`${e.playersConfirmed} / ${e.playerTarget}`} progress={(e.playersConfirmed / e.playerTarget) * 100} />
        <Stat icon={Shield} label="Clubs" value={String(e.clubsConfirmed)} progress={(e.clubsConfirmed / e.clubTarget) * 100} />
        <Stat icon={Handshake} label="Sponsors" value={String(e.sponsorsConfirmed)} progress={(e.sponsorsConfirmed / e.sponsorTarget) * 100} />
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            Digital audience target
          </p>
          <p className="mt-1 text-lg font-semibold">{formatNumber(e.digitalAudienceTarget)}</p>
          <p className="mt-2 text-[11px] text-muted-foreground">Not yet tracked — no analytics source connected</p>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Player/club/sponsor recruitment isn&apos;t split per event yet — these are the whole shared pipeline&apos;s
        real numbers.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Commercial pipeline</p>
        <p className="font-display text-2xl font-bold text-primary">{formatCHF(e.commercialPipeline)}</p>
      </div>
    </Card>
  );
}

function SecondaryEventCard({ event: e }: { event: PannaEvent }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">
            {e.name}
            {e.edition && <span className="ml-1.5 font-normal text-muted-foreground">· Edition N°{e.edition}</span>}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {e.city} · {e.date ?? "Date TBD"}
          </p>
        </div>
        <StatusBadge status={e.status} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Target: {e.playerTarget} players · {e.clubTarget} clubs · {e.sponsorTarget} sponsors
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">Recruitment not started for this event yet.</p>
      <div className="mt-3 flex items-center gap-2">
        <EditEventDialog event={e} />
        <DeleteEventButton id={e.id} name={e.name} />
      </div>
    </Card>
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
