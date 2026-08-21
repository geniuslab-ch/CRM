import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AgentIcon } from "@/components/ui/agent-icon";
import { StatusDot } from "@/components/ui/status-dot";
import { getLiveAgents } from "@/lib/agents/liveTeam";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await getLiveAgents();

  return (
    <div>
      <PageHeader
        title="AI Team"
        description="One AI organization, eight specialists — all sharing the same Panna League memory: event details, audience, brand voice and messaging rules."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {agents.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.id}`}>
            <Card className="h-full p-5 transition-colors hover:border-primary/50 hover:bg-surface-2">
              <div className="mb-3 flex items-center justify-between">
                <AgentIcon agentId={agent.id} />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StatusDot status={agent.status} />
                  {agent.status}
                </div>
              </div>
              <p className="font-semibold">{agent.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{agent.role}</p>
              <CardContent className="mt-2 p-0">
                <p className="text-sm font-medium text-primary">{agent.headline}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
