import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AgentIcon } from "@/components/ui/agent-icon";
import { StatusDot } from "@/components/ui/status-dot";
import { getLiveAgents } from "@/lib/agents/liveTeam";
import { ChevronRight } from "lucide-react";

export async function AiTeamPanel() {
  const agents = await getLiveAgents();

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">AI Team</h2>
          <p className="text-xs text-muted-foreground">One AI organization, eight specialists — all sharing the same memory.</p>
        </div>
        <Link href="/agents" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          View all agents
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <ol className="space-y-1">
        {agents.map((agent, idx) => (
          <li key={agent.id}>
            <Link
              href={`/agents/${agent.id}`}
              className="focus-ring flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-2"
            >
              <div className="flex items-center gap-3">
                <AgentIcon agentId={agent.id} />
                <div>
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.headline}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                  {agent.status === "IDLE" ? "Not tracked" : agent.status === "WAITING" ? "Waiting" : "Active"}
                </span>
                <StatusDot status={agent.status} />
              </div>
            </Link>
            {idx < agents.length - 1 && <div className="ml-6 h-3 w-px bg-border" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </Card>
  );
}
