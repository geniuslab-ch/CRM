import { Hero } from "@/components/dashboard/hero";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { EventSummary } from "@/components/dashboard/event-summary";
import { AiTeamPanel } from "@/components/dashboard/ai-team-panel";
import { DemoMode } from "@/components/dashboard/demo-mode";
import { getLiveDashboardKpis } from "@/lib/supabase/repository";

// KpiGrid and EventSummary now read live Supabase data — without this,
// Next.js would statically snapshot the dashboard at build time (as it
// briefly did) and serve that stale snapshot to every visitor forever.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const kpis = await getLiveDashboardKpis();

  return (
    <div className="space-y-6">
      <Hero />
      <KpiGrid kpis={kpis} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <EventSummary />
          <DemoMode
            playersConfirmed={kpis.playersConfirmed}
            playersTotal={kpis.playersTotal}
            sponsorPipeline={kpis.sponsorPipeline}
            meetingsBooked={kpis.meetingsBooked}
            contentPublished={kpis.contentPublished}
          />
        </div>
        <div className="lg:col-span-2">
          <AiTeamPanel />
        </div>
      </div>
    </div>
  );
}
