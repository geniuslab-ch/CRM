import "server-only";
import { Agent } from "@/types";
import { agents as staticAgents } from "@/lib/data/agents";
import { getPlayers, getClubs, getSponsors, getConversations } from "@/lib/supabase/repository";

// Real AI Team stats — used by the Dashboard panel, the Agents list and
// agent detail pages. lib/data/agents.ts still supplies the illustrative,
// non-numeric copy (role descriptions, "AI reasoning" examples, accent
// color) for each agent, but every number and status here is computed
// live from Supabase. tasksCompleted and recentActivity are always
// null/empty: there is no real per-agent action log yet, so rather than
// show a fabricated count or a fake timestamped history, the UI is told
// there's nothing tracked instead.

export async function getLiveAgents(): Promise<Agent[]> {
  const [players, clubs, sponsors, conversations] = await Promise.all([
    getPlayers(),
    getClubs(),
    getSponsors(),
    getConversations(),
  ]);

  const researchedSponsors = sponsors.data.filter((s) => s.stage !== "PROSPECT").length;
  const avgSponsorScore = sponsors.data.length
    ? Math.round(sponsors.data.reduce((sum, s) => sum + s.fit.overall, 0) / sponsors.data.length)
    : undefined;
  const avgPlayerScore = players.data.length
    ? Math.round(players.data.reduce((sum, p) => sum + p.playerScore, 0) / players.data.length)
    : undefined;
  const potentialPipeline = sponsors.data.length
    ? sponsors.data.filter((s) => s.stage !== "LOST").reduce((sum, s) => sum + s.potentialValue, 0)
    : undefined;

  const overrides: Record<string, Partial<Agent>> = {
    "player-recruiter": {
      status: players.data.length ? "ACTIVE" : "WAITING",
      headline: `${players.data.length} prospects analyzed`,
      metricValue: String(players.data.length),
      averageScore: avgPlayerScore,
    },
    "club-finder": {
      status: clubs.data.length ? "ACTIVE" : "WAITING",
      headline: `${clubs.data.length} clubs identified`,
      metricValue: String(clubs.data.length),
    },
    "sponsor-finder": {
      status: sponsors.data.length ? "ACTIVE" : "WAITING",
      headline: `${sponsors.data.length} prospects found`,
      metricValue: String(sponsors.data.length),
      averageScore: avgSponsorScore,
      potentialPipeline,
    },
    "sponsor-researcher": {
      status: researchedSponsors ? "ACTIVE" : "WAITING",
      headline: `${researchedSponsors} companies researched`,
      metricValue: String(researchedSponsors),
    },
    outreach: {
      status: conversations.data.length ? "ACTIVE" : "WAITING",
      headline: `${conversations.data.length} messages sent`,
      metricLabel: "Messages sent",
      metricValue: String(conversations.data.length),
    },
    "conversation-manager": {
      status: "WAITING", // no inbound-reply integration yet — see README
      headline: `${conversations.data.length} conversations tracked`,
      metricValue: String(conversations.data.length),
    },
    booking: {
      status: "IDLE",
      headline: "Not tracked yet — no meetings data source connected",
      metricLabel: "Meetings booked",
      metricValue: "—",
    },
    content: {
      status: "IDLE",
      headline: "Not tracked yet — no content pipeline connected",
      metricLabel: "Content ideas",
      metricValue: "—",
    },
  };

  return staticAgents.map((a) => ({
    ...a,
    ...overrides[a.id],
    tasksCompleted: null,
    recentActivity: [],
  }));
}
