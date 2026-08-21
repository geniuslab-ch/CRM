"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardKpis } from "@/lib/data";
import { pannaEvent } from "@/lib/data/event";
import { formatCHF } from "@/lib/utils";

const kpis = getDashboardKpis();

const STEPS = [
  { label: `${pannaEvent.playerTarget} player target`, value: `${pannaEvent.playersConfirmed} confirmed` },
  { label: "Sponsor pipeline", value: formatCHF(kpis.sponsorPipeline) },
  { label: "Meetings", value: `${kpis.meetings} booked` },
  { label: "Content", value: `${kpis.contentPublished} published` },
  { label: "Event readiness", value: "Pre-launch — on track" },
];

export function DemoMode() {
  const [step, setStep] = useState(STEPS.length);

  function start() {
    setStep(0);
    STEPS.forEach((_, idx) => {
      setTimeout(() => setStep(idx + 1), (idx + 1) * 500);
    });
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Demo Mode</h2>
          <p className="text-xs text-muted-foreground">
            Walk through the full ecosystem in seconds — built for investor &amp; partner demos.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={start}>
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          START DEMO
        </Button>
      </div>

      <div className="space-y-1">
        {STEPS.map((s, idx) => (
          <div key={s.label}>
            <AnimatePresence>
              {idx < step && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-2.5"
                >
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="font-display text-sm font-bold text-primary">{s.value}</span>
                </motion.div>
              )}
            </AnimatePresence>
            {idx < STEPS.length - 1 && idx < step - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
