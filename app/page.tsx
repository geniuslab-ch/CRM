import { Hero } from "@/components/dashboard/hero";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { EventSummary } from "@/components/dashboard/event-summary";
import { AiTeamPanel } from "@/components/dashboard/ai-team-panel";
import { DemoMode } from "@/components/dashboard/demo-mode";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Hero />
      <KpiGrid />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <EventSummary />
          <DemoMode />
        </div>
        <div className="lg:col-span-2">
          <AiTeamPanel />
        </div>
      </div>
    </div>
  );
}
