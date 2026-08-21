import { Users, Handshake, TrendingUp, Shield, CalendarCheck, Radio, Clapperboard } from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { getLiveDashboardKpis } from "@/lib/supabase/repository";
import { formatCHF } from "@/lib/utils";

export async function KpiGrid() {
  const kpis = await getLiveDashboardKpis();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <KpiCard
        label="Players confirmed"
        value={`${kpis.playersConfirmed}`}
        icon={Users}
        sublabel={`${kpis.playersTotal} in pipeline`}
      />
      <KpiCard label="Sponsors" value={String(kpis.sponsorsWon)} icon={Handshake} sublabel={`${kpis.sponsorsTotal} prospects`} />
      <KpiCard label="Sponsor pipeline" value={formatCHF(kpis.sponsorPipeline)} icon={TrendingUp} sublabel="Open opportunities" />
      <KpiCard label="Club partners" value={String(kpis.clubPartners)} icon={Shield} sublabel={`${kpis.clubsTotal} identified`} />
      <KpiCard label="Meetings" value="—" icon={CalendarCheck} sublabel="No live meetings table yet" />
      <KpiCard label="Digital reach" value="—" icon={Radio} sublabel="No analytics source connected" />
      <KpiCard label="Content published" value="—" icon={Clapperboard} sublabel="No live content table yet" />
    </div>
  );
}
