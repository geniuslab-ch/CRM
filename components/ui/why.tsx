import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Why({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-2 rounded-xl border border-border bg-surface-2 p-3 text-sm", className)}>
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <div>
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why?</p>
        <p className="text-foreground/90">{children}</p>
      </div>
    </div>
  );
}
