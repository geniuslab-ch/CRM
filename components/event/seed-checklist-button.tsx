"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedEventChecklist } from "@/lib/supabase/actions";

// A realistic launch-readiness template — venue/date, recruitment
// targets, promo, day-of logistics — offered as a starting point so the
// organizer isn't staring at a blank list. Every item starts unchecked;
// this is a real task list to work through, not a claim anything is done.
const SUGGESTED_CHECKLIST = [
  "Confirm venue and lock in the event date",
  "Reach player recruitment target",
  "Confirm club partners for the player pipeline",
  "Close at least one sponsor deal",
  "Set entry pricing (if any)",
  "Announce the event publicly (status → ANNOUNCED)",
  "Open registration (status → REGISTRATION_OPEN)",
  "Confirm referees / bracket format",
  "Plan event-day content (filming, socials)",
  "Plan post-event recap (highlights, thank-yous)",
];

export function SeedChecklistButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await seedEventChecklist(eventId, SUGGESTED_CHECKLIST);
      if (!result.ok) setError(result.error ?? "Couldn't add the suggested checklist.");
    });
  }

  return (
    <div className="mb-3">
      <Button size="sm" variant="secondary" onClick={handleClick} disabled={pending}>
        <Sparkles className={pending ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} aria-hidden="true" />
        {pending ? "Adding…" : "Use suggested checklist"}
      </Button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
