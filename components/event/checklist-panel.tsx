"use client";

import { useState } from "react";
import { EventChecklist } from "@/components/event/checklist";
import { SeedChecklistButton } from "@/components/event/seed-checklist-button";
import { PannaEvent } from "@/types";

// Lets the organizer pick which event's checklist to work on — not just
// the primary/featured one. `events` comes fresh from the server on
// every mutation (checklist actions revalidate "/event"), so re-deriving
// the selected event from that prop on every render keeps this in sync
// without holding its own copy of the data.
export function EventChecklistPanel({ events, defaultEventId }: { events: PannaEvent[]; defaultEventId: string }) {
  const [selectedId, setSelectedId] = useState(defaultEventId);
  const selected = events.find((e) => e.id === selectedId) ?? events[0];
  if (!selected) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <label htmlFor="checklist-event" className="text-sm font-medium text-muted-foreground">
          Checklist for
        </label>
        <select
          id="checklist-event"
          value={selected.id}
          onChange={(e) => setSelectedId(e.target.value)}
          className="focus-ring rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} — {e.city}
              {e.isPrimary ? " (primary)" : ""}
            </option>
          ))}
        </select>
      </div>
      {selected.checklist.length === 0 && <SeedChecklistButton eventId={selected.id} />}
      <EventChecklist key={selected.id} eventId={selected.id} items={selected.checklist} />
    </div>
  );
}
