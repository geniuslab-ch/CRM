import { Badge } from "./badge";
import { cn } from "@/lib/utils";

type Tone = "default" | "primary" | "accent" | "success" | "warning" | "danger" | "info" | "outline";

const STATUS_TONE: Record<string, Tone> = {
  IDENTIFIED: "outline",
  CONTACTED: "info",
  INTERESTED: "primary",
  CONFIRMED: "success",
  DECLINED: "danger",
  PLAYERS_PROPOSED: "warning",
  PARTNER: "success",
  PROSPECT: "outline",
  RESEARCH: "info",
  REPLIED: "info",
  MEETING: "primary",
  PROPOSAL: "primary",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "danger",
  NOT_INTERESTED: "danger",
  NEEDS_INFORMATION: "info",
  SEND_PROPOSAL: "primary",
  CALL_REQUEST: "info",
  OBJECTION: "warning",
  FOLLOW_UP_LATER: "warning",
  WRONG_PERSON: "danger",
  ACTIVE: "success",
  IDLE: "outline",
  WAITING: "warning",
  RUNNING: "primary",
  IDEA: "outline",
  READY: "info",
  SCHEDULED: "warning",
  PUBLISHED: "success",
  PROPOSED: "outline",
  COMPLETED: "success",
  CANCELLED: "danger",
  PRE_LAUNCH: "warning",
  ANNOUNCED: "info",
  REGISTRATION_OPEN: "primary",
  LIVE: "success",
  DRAFT: "outline",
  SENT: "info",
  UNDER_REVIEW: "warning",
  ACCEPTED: "success",
  LOW: "outline",
  MEDIUM: "warning",
  HIGH: "success",
};

function toLabel(status: string): string {
  return status
    .split("_")
    .map((s) => s.charAt(0) + s.slice(1).toLowerCase())
    .join(" ");
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? "default";
  return (
    <Badge variant={tone} className={cn("uppercase tracking-wide", className)}>
      {toLabel(status)}
    </Badge>
  );
}
