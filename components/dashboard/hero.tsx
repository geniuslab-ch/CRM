import Link from "next/link";
import { RunAITeamButton } from "./run-ai-team";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="relative px-6 py-12 sm:px-10 sm:py-16">
        <p className="mb-3 inline-flex items-center rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-muted-foreground">
          One human. An AI team.
        </p>
        <h1 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Your Panna League.
          <br />
          <span className="text-gradient">Powered by an AI team.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Recruit players. Find sponsors. Build partnerships. Create content. Fill your event —
          all from one command center.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <RunAITeamButton />
          <Link href="/sponsors">
            <Button size="lg" variant="secondary">
              VIEW PIPELINE
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
