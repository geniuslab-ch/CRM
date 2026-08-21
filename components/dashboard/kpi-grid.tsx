import { Users, Handshake, TrendingUp, Shield, CalendarCheck, Radio, Clapperboard, Zap } from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { getDashboardKpis } from "@/lib/data";
import { formatCHF, formatNumber } from "@/lib/utils";

export function KpiGrid() {
  const kpis = getDashboardKpis();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <KpiCard
        label="Players confirmed"
        value={`${kpis.playersConfirmed} / ${kpis.playerTarget}`}
        icon={Users}
        sublabel={`${kpis.playersTotal} in pipeline`}
      />
      <KpiCard label="Sponsors" value={String(kpis.sponsorsConfirmed)} icon={Handshake} sublabel={`${kpis.sponsorsTotal} prospects`} />
      <KpiCard label="Sponsor pipeline" value={formatCHF(kpis.sponsorPipeline)} icon={TrendingUp} sublabel="Open opportunities" />
      <KpiCard label="Club partners" value={String(kpis.clubPartners)} icon={Shield} sublabel={`${kpis.clubsTotal} identified`} />
      <KpiCard label="Meetings" value={String(kpis.meetings)} icon={CalendarCheck} sublabel="Booked this cycle" />
      <KpiCard
        label="Digital reach"
        value={formatNumber(kpis.digitalReach)}
        icon={Radio}
        sublabel={`Target ${formatNumber(kpis.digitalTarget)}`}
      />
      <KpiCard label="Content published" value={String(kpis.contentPublished)} icon={Clapperboard} sublabel="Across all platforms" />
      <KpiCard label="AI hours saved" value={String(kpis.aiHoursSaved)} icon={Zap} sublabel="Since project start" />
    </div>
  );
}
