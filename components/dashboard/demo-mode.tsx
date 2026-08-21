"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCHF } from "@/lib/utils";

interface DemoModeProps {
  playersConfirmed: number;
  playersTotal: number;
  sponsorPipeline: number;
  meetingsBooked: number;
  contentPublished: number;
}

export function DemoMode({ playersConfirmed, playersTotal, sponsorPipeline, meetingsBooked, contentPublished }: DemoModeProps) {
  const [step, setStep] = useState(0);

  const activity = playersTotal + sponsorPipeline + meetingsBooked + contentPublished;
  const readiness = activity === 0 ? "Just getting started" : playersConfirmed > 0 ? "Building momentum" : "Pipeline in progress";

  const steps = [
    { label: "Players in pipeline", value: `${playersConfirmed} confirmed of ${playersTotal}` },
    { label: "Sponsor pipeline", value: formatCHF(sponsorPipeline) },
    { label: "Meetings", value: `${meetingsBooked} booked` },
    { label: "Content", value: `${contentPublished} published` },
    { label: "Status", value: readiness },
  ];

  function start() {
    setStep(0);
    steps.forEach((_, idx) => {
      setTimeout(() => setStep(idx + 1), (idx + 1) * 500);
    });
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Live Walkthrough</h2>
          <p className="text-xs text-muted-foreground">
            A real, live summary of the ecosystem so far — built for investor &amp; partner demos.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={start}>
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          START
        </Button>
      </div>

      <div className="space-y-1">
        {steps.map((s, idx) => (
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
            {idx < steps.length - 1 && idx < step - 1 && (
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
