import { cn } from "@/lib/utils";
import { AgentStatus } from "@/types";

const COLOR: Record<AgentStatus, string> = {
  ACTIVE: "bg-success",
  RUNNING: "bg-primary",
  WAITING: "bg-warning",
  IDLE: "bg-muted-foreground",
};

export function StatusDot({ status, className }: { status: AgentStatus; className?: string }) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      {(status === "ACTIVE" || status === "RUNNING") && (
        <span className={cn("absolute inline-flex h-full w-full animate-pulse-dot rounded-full opacity-75", COLOR[status])} />
      )}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", COLOR[status])} />
    </span>
  );
}
