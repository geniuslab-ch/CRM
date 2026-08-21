import {
  UserSearch,
  Shield,
  Target,
  Microscope,
  Send,
  MessagesSquare,
  CalendarCheck,
  Clapperboard,
  LucideIcon,
} from "lucide-react";
import { AgentId } from "@/types";
import { cn } from "@/lib/utils";

export const AGENT_ICONS: Record<AgentId, LucideIcon> = {
  "player-recruiter": UserSearch,
  "club-finder": Shield,
  "sponsor-finder": Target,
  "sponsor-researcher": Microscope,
  outreach: Send,
  "conversation-manager": MessagesSquare,
  booking: CalendarCheck,
  content: Clapperboard,
};

export const AGENT_COLORS: Record<AgentId, string> = {
  "player-recruiter": "text-primary bg-primary/15",
  "club-finder": "text-accent bg-accent/15",
  "sponsor-finder": "text-primary bg-primary/15",
  "sponsor-researcher": "text-info bg-info/15",
  outreach: "text-accent bg-accent/15",
  "conversation-manager": "text-warning bg-warning/15",
  booking: "text-success bg-success/15",
  content: "text-info bg-info/15",
};

export function AgentIcon({ agentId, className }: { agentId: AgentId; className?: string }) {
  const Icon = AGENT_ICONS[agentId];
  return (
    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", AGENT_COLORS[agentId], className)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </div>
  );
}
