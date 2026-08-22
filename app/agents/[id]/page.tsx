import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentIcon } from "@/components/ui/agent-icon";
import { StatusDot } from "@/components/ui/status-dot";
import { KpiCard } from "@/components/ui/kpi-card";
import { getLiveAgents } from "@/lib/agents/liveTeam";
import { formatCHF, timeAgo } from "@/lib/utils";
import { ListChecks, Target, TrendingUp } from "lucide-react";

// No generateStaticParams — agent stats are computed live from Supabase,
// so this can't be snapshotted at build time (see sponsors/[id] for the
// same reasoning).
export const dynamic = "force-dynamic";

// None of these agents have an in-place "run task" button here — each one's
// real work happens on the record it acts on (a player, club, sponsor or
// conversation), not on this summary page. This tells people where that is.
const WHERE_TO_ACT: Record<string, { text: string; href: string; linkLabel: string }> = {
  "player-recruiter": {
    text: "Add, score and move players through the pipeline from the Players page.",
    href: "/players",
    linkLabel: "Go to Players",
  },
  "club-finder": {
    text: "Add clubs and run outreach from a club's detail page.",
    href: "/clubs",
    linkLabel: "Go to Clubs",
  },
  "sponsor-finder": {
    text: "Add sponsor prospects and track fit scoring from the Sponsors page.",
    href: "/sponsors",
    linkLabel: "Go to Sponsors",
  },
  "sponsor-researcher": {
    text: "Open a sponsor's detail page and use the Research panel to generate a company brief.",
    href: "/sponsors",
    linkLabel: "Go to Sponsors",
  },
  outreach: {
    text: "Send outreach from a sponsor's or club's detail page — that's where messages actually go out.",
    href: "/sponsors",
    linkLabel: "Go to Sponsors",
  },
  "conversation-manager": {
    text: "Real replies land in the Inbox automatically (polled every 15 min) — review and reply from there.",
    href: "/conversations",
    linkLabel: "Go to Conversations",
  },
  booking: {
    text: "There's no standalone booking task here — book a real meeting from a sponsor's or club's detail page, or copy their self-serve booking link so they can pick a slot themselves.",
    href: "/sponsors",
    linkLabel: "Go to Sponsors",
  },
  content: {
    text: "Generate content ideas from a sponsor's confirmed deal terms on their detail page, or browse the Content board.",
    href: "/content",
    linkLabel: "Go to Content",
  },
};

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const agents = await getLiveAgents();
  const agent = agents.find((a) => a.id === params.id);
  if (!agent) notFound();

  return (
    <div className="space-y-6">
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to AI Team
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AgentIcon agentId={agent.id} className="h-14 w-14 [&>svg]:h-6 [&>svg]:w-6" />
            <div>
              <h1 className="font-display text-2xl font-bold">{agent.name}</h1>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium">
            <StatusDot status={agent.status} />
            {agent.status}
          </div>
        </div>
      </Card>

      {WHERE_TO_ACT[agent.id] && (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-primary/30 bg-primary/5 p-4">
          <p className="text-sm text-foreground">{WHERE_TO_ACT[agent.id].text}</p>
          <Link
            href={WHERE_TO_ACT[agent.id].href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {WHERE_TO_ACT[agent.id].linkLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {agent.tasksCompleted !== null && (
          <KpiCard label="Tasks completed" value={String(agent.tasksCompleted)} icon={ListChecks} />
        )}
        <KpiCard label={agent.metricLabel} value={agent.metricValue} icon={Target} />
        {agent.averageScore !== undefined && <KpiCard label="Average score" value={String(agent.averageScore)} icon={TrendingUp} />}
        {agent.potentialPipeline !== undefined && (
          <KpiCard label="Potential pipeline" value={formatCHF(agent.potentialPipeline)} icon={Sparkles} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agent.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No per-agent activity log yet — see the metric above and the Dashboard/CRM pages for this agent&apos;s real output.
              </p>
            ) : (
              agent.recentActivity.map((task) => (
                <div key={task.id} className="rounded-xl border border-border bg-surface-2 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{task.summary}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(task.timestamp)}</span>
                  </div>
                  {task.reasoning && <p className="mt-1 text-xs text-muted-foreground">{task.reasoning}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI reasoning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agent.reasoningExamples.map((r, idx) => (
              <div key={idx} className="flex gap-2.5 rounded-xl border border-border bg-surface-2 p-3 text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <p>{r}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
