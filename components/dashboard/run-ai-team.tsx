"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgentIcon } from "@/components/ui/agent-icon";
import { AgentId } from "@/types";

// Real prospecting run — POSTs to /api/ai/run-team, which uses Claude's
// web_search tool to find real player/club/sponsor candidates and saves
// verified ones to Supabase, streaming one NDJSON line per step. Nothing
// here is scripted: an idle run (0 new leads) is a normal, honest outcome,
// not an error.

interface LogLine {
  agentId: AgentId;
  message: string;
  at: string;
}

interface Summary {
  newPlayers: number;
  newClubs: number;
  newSponsors: number;
}

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

function timeNow(): string {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function RunAITeamModal({ onClose }: { onClose: () => void }) {
  const [log, setLog] = useState<LogLine[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(true);
  const started = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  if (!started.current) {
    started.current = true;
    runTeam();
  }

  async function runTeam() {
    try {
      const res = await fetch("/api/ai/run-team", { method: "POST" });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? `Request failed (${res.status})`);
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === "log") {
            setLog((prev) => [...prev, { agentId: event.agentId, message: event.message, at: timeNow() }]);
            queueMicrotask(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }));
          } else if (event.type === "error") {
            setError(event.message);
          } else if (event.type === "done") {
            setSummary(event.summary);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The run failed unexpectedly.");
    } finally {
      setRunning(false);
    }
  }

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
              <p className="text-xs text-muted-foreground">
                Player Recruiter, Club Finder and Sponsor Finder searching the real web for new leads.
              </p>
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
            {log.map((entry, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">{entry.at}</span>
                <AgentIcon agentId={entry.agentId} className="h-6 w-6 shrink-0" />
                <span className="text-foreground/90">{entry.message}</span>
              </motion.div>
            ))}
            <div ref={logEndRef} />

            {running && (
              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary [animation-delay:0.4s]" />
                </span>
                researching…
              </div>
            )}
          </div>

          <AnimatePresence>
            {error && !running && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-t border-border bg-surface-2 p-5"
              >
                <div className="mb-2 flex items-center gap-2 text-danger">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <p className="text-sm font-semibold">RUN FAILED</p>
                </div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <div className="mt-4 flex justify-end">
                  <Button variant="secondary" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </motion.div>
            )}

            {summary && !running && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-t border-border bg-surface-2 p-5"
              >
                <div className="mb-3 flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <p className="text-sm font-semibold">AI RUN COMPLETE</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <SummaryStat value={summary.newPlayers} label="New players" />
                  <SummaryStat value={summary.newClubs} label="New clubs" />
                  <SummaryStat value={summary.newSponsors} label="New sponsors" />
                </div>
                {summary.newPlayers + summary.newClubs + summary.newSponsors === 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    No new leads this run — every candidate the agents could verify was already in your CRM, or nothing
                    verifiable turned up. That&apos;s a normal outcome, not an error.
                  </p>
                )}
                {summary.newPlayers + summary.newClubs + summary.newSponsors > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Every new lead is saved as an unconfirmed prospect with its AI reasoning and source links — review
                    and verify contact details on the Players/Clubs/Sponsors pages before reaching out.
                  </p>
                )}
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
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <p className="font-display text-xl font-bold text-primary">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
