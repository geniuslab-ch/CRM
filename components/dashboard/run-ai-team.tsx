"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgentIcon } from "@/components/ui/agent-icon";
import { AI_RUN_LOG, AI_RUN_SUMMARY, AI_RUN_TOTAL_SECONDS } from "@/lib/ai/runSimulation";
import { AgentId } from "@/types";
import { cn } from "@/lib/utils";

const AGENT_LABELS: Record<AgentId, string> = {
  "player-recruiter": "Player Recruiter",
  "club-finder": "Club Finder",
  "sponsor-finder": "Sponsor Finder",
  "sponsor-researcher": "Researcher",
  outreach: "Outreach",
  "conversation-manager": "Conversation Manager",
  booking: "Booking Agent",
  content: "Content Agent",
};

export function RunAITeamButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)} className="group">
        <Play className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
        RUN AI TEAM
      </Button>
      <AnimatePresence>{open && <RunAITeamModal onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function RunAITeamModal({ onClose }: { onClose: () => void }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scheduled: ReturnType<typeof setTimeout>[] = [];
    AI_RUN_LOG.forEach((entry, idx) => {
      scheduled.push(
        setTimeout(() => {
          setVisibleCount(idx + 1);
        }, entry.timeSeconds * 220)
      );
    });
    scheduled.push(setTimeout(() => setDone(true), AI_RUN_TOTAL_SECONDS * 220 + 400));

    return () => {
      scheduled.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="AI Team run"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="w-full max-w-2xl"
      >
        <Card className="max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <p className="text-sm font-semibold">AI Team — Live Run</p>
              <p className="text-xs text-muted-foreground">Simulating your 8 specialist agents at work.</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[50vh] space-y-2 overflow-y-auto p-5 font-mono text-sm">
            {AI_RUN_LOG.slice(0, visibleCount).map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                  {String(Math.floor(entry.timeSeconds / 60)).padStart(2, "0")}:
                  {String(entry.timeSeconds % 60).padStart(2, "0")}
                </span>
                {entry.agentId !== "system" && <AgentIcon agentId={entry.agentId} className="h-6 w-6 shrink-0" />}
                <span className="text-foreground/90">{entry.message}</span>
              </motion.div>
            ))}
            <div ref={logEndRef} />

            {!done && visibleCount < AI_RUN_LOG.length && (
              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary [animation-delay:0.4s]" />
                </span>
                working…
              </div>
            )}
          </div>

          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-t border-border bg-surface-2 p-5"
              >
                <div className="mb-3 flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <p className="text-sm font-semibold">AI RUN COMPLETE</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <SummaryStat value={AI_RUN_SUMMARY.newProspects} label="New prospects" />
                  <SummaryStat value={AI_RUN_SUMMARY.qualifiedOpportunities} label="Qualified opportunities" />
                  <SummaryStat value={AI_RUN_SUMMARY.meetingsBooked} label="Meetings" />
                  <SummaryStat value={AI_RUN_SUMMARY.contentIdeas} label="Content ideas" />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function SummaryStat({ value, label }: { value: number; label: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-3 text-center")}>
      <p className="font-display text-xl font-bold text-primary">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export { AGENT_LABELS };
