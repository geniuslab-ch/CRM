import { PageHeader } from "@/components/layout/page-header";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { AgentProductivityChart } from "@/components/analytics/agent-productivity-chart";
import { ContentPerformanceChart } from "@/components/analytics/content-performance-chart";
import { players } from "@/lib/data/players";
import { clubs } from "@/lib/data/clubs";
import { sponsors } from "@/lib/data/sponsors";
import { meetings } from "@/lib/data/meetings";

function playerFunnel() {
  return [
    { stage: "Identified", count: players.length },
    { stage: "Contacted", count: players.filter((p) => p.status !== "IDENTIFIED").length },
    { stage: "Interested", count: players.filter((p) => ["INTERESTED", "CONFIRMED"].includes(p.status)).length },
    { stage: "Confirmed", count: players.filter((p) => p.status === "CONFIRMED").length },
  ];
}

function clubFunnel() {
  return [
    { stage: "Identified", count: clubs.length },
    { stage: "Contacted", count: clubs.filter((c) => c.status !== "IDENTIFIED").length },
    {
      stage: "Interested",
      count: clubs.filter((c) => ["INTERESTED", "PLAYERS_PROPOSED", "CONFIRMED", "PARTNER"].includes(c.status)).length,
    },
    { stage: "Confirmed", count: clubs.filter((c) => ["CONFIRMED", "PARTNER"].includes(c.status)).length },
  ];
}

function sponsorFunnel() {
  const order = ["PROSPECT", "RESEARCH", "CONTACTED", "REPLIED", "INTERESTED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON"];
  return [
    { stage: "Prospects", count: sponsors.length },
    { stage: "Contacted", count: sponsors.filter((s) => order.indexOf(s.stage) >= order.indexOf("CONTACTED")).length },
    { stage: "Replied", count: sponsors.filter((s) => order.indexOf(s.stage) >= order.indexOf("REPLIED")).length },
    { stage: "Meetings", count: sponsors.filter((s) => order.indexOf(s.stage) >= order.indexOf("MEETING")).length },
    { stage: "Deals won", count: sponsors.filter((s) => s.stage === "WON").length },
  ];
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Recruitment funnels, sponsor pipeline conversion, content performance and AI productivity — all in one view."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FunnelChart title="Player recruitment funnel" data={playerFunnel()} />
        <FunnelChart title="Club recruitment funnel" data={clubFunnel()} />
        <FunnelChart title="Sponsor funnel" data={sponsorFunnel()} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ContentPerformanceChart />
        <AgentProductivityChart />
      </div>

      <p className="text-xs text-muted-foreground">
        {meetings.length} meetings booked to date · {sponsors.filter((s) => s.stage === "WON").length} sponsors closed.
      </p>
    </div>
  );
}
