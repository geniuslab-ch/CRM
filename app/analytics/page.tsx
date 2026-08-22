import { PageHeader } from "@/components/layout/page-header";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { AgentProductivityChart } from "@/components/analytics/agent-productivity-chart";
import { ContentPerformanceChart } from "@/components/analytics/content-performance-chart";
import { getPlayers, getClubs, getSponsors, getMeetings, getContentIdeas } from "@/lib/supabase/repository";
import { getLiveAgents } from "@/lib/agents/liveTeam";
import { Player, Club, Sponsor } from "@/types";

export const dynamic = "force-dynamic";

function playerFunnel(players: Player[]) {
  return [
    { stage: "Identified", count: players.length },
    { stage: "Contacted", count: players.filter((p) => p.status !== "IDENTIFIED").length },
    { stage: "Interested", count: players.filter((p) => ["INTERESTED", "CONFIRMED"].includes(p.status)).length },
    { stage: "Confirmed", count: players.filter((p) => p.status === "CONFIRMED").length },
  ];
}

function clubFunnel(clubs: Club[]) {
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

function sponsorFunnel(sponsors: Sponsor[]) {
  const order = ["PROSPECT", "RESEARCH", "CONTACTED", "REPLIED", "INTERESTED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON"];
  return [
    { stage: "Prospects", count: sponsors.length },
    { stage: "Contacted", count: sponsors.filter((s) => order.indexOf(s.stage) >= order.indexOf("CONTACTED")).length },
    { stage: "Replied", count: sponsors.filter((s) => order.indexOf(s.stage) >= order.indexOf("REPLIED")).length },
    { stage: "Meetings", count: sponsors.filter((s) => order.indexOf(s.stage) >= order.indexOf("MEETING")).length },
    { stage: "Deals won", count: sponsors.filter((s) => s.stage === "WON").length },
  ];
}

export default async function AnalyticsPage() {
  const [players, clubs, sponsors, meetings, contentIdeas, agents] = await Promise.all([
    getPlayers(),
    getClubs(),
    getSponsors(),
    getMeetings(),
    getContentIdeas(),
    getLiveAgents(),
  ]);

  const anyLive = [players, clubs, sponsors, meetings, contentIdeas].some((r) => r.source === "live");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Recruitment funnels, sponsor pipeline conversion, content performance and AI team output — all real, all from what's actually in the CRM."
        action={<DataSourceBadge source={anyLive ? "live" : "unavailable"} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FunnelChart title="Player recruitment funnel" data={playerFunnel(players.data)} />
        <FunnelChart title="Club recruitment funnel" data={clubFunnel(clubs.data)} />
        <FunnelChart title="Sponsor funnel" data={sponsorFunnel(sponsors.data)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ContentPerformanceChart ideas={contentIdeas.data} />
        <AgentProductivityChart agents={agents} />
      </div>

      <p className="text-xs text-muted-foreground">
        {meetings.data.length} meetings booked to date · {sponsors.data.filter((s) => s.stage === "WON").length} sponsors closed.
      </p>
    </div>
  );
}
