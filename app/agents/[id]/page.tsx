import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentIcon } from "@/components/ui/agent-icon";
import { StatusDot } from "@/components/ui/status-dot";
import { KpiCard } from "@/components/ui/kpi-card";
import { agents } from "@/lib/data/agents";
import { formatCHF, timeAgo } from "@/lib/utils";
import { ListChecks, Target, TrendingUp } from "lucide-react";

export function generateStaticParams() {
  return agents.map((a) => ({ id: a.id }));
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Tasks completed" value={String(agent.tasksCompleted)} icon={ListChecks} />
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
            {agent.recentActivity.map((task) => (
              <div key={task.id} className="rounded-xl border border-border bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{task.summary}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(task.timestamp)}</span>
                </div>
                {task.reasoning && <p className="mt-1 text-xs text-muted-foreground">{task.reasoning}</p>}
              </div>
            ))}
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
