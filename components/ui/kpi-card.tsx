import { LucideIcon } from "lucide-react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && (
          <div className="rounded-lg bg-surface-2 p-1.5">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight font-display">{value}</p>
      {(sublabel || trend) && (
        <p className="mt-1 text-xs text-muted-foreground">
          {sublabel}
          {trend && <span className="ml-1 text-success">{trend}</span>}
        </p>
      )}
    </Card>
  );
}
