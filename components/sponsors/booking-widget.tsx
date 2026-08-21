"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sponsor } from "@/types";
import { cn } from "@/lib/utils";

// Real Google Calendar free/busy + booking (Booking Agent). Falls back to
// mock slots when Google isn't configured; a mock booking never writes a
// real meeting record (see /api/calendar/book).

interface Slot {
  day: string;
  time: string;
  startISO: string;
  endISO: string;
}

export function BookingWidget({ sponsor }: { sponsor: Sponsor }) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [live, setLive] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [notes, setNotes] = useState(`Sponsorship discussion with ${sponsor.name}.`);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ mock: boolean; eventLink?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/calendar/slots")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setLoadError(data.error);
        } else {
          setSlots(data.slots ?? []);
          setLive(Boolean(data.live));
        }
      })
      .catch(() => !cancelled && setLoadError("Couldn't load calendar availability."));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleBook() {
    if (!selected) return;
    setBooking(true);
    setBookError(null);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: selected,
          withName: sponsor.research.contactPerson.name,
          notes,
          logAs: { organization: sponsor.name, category: "SPONSOR", relatedId: sponsor.id },
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Booking failed");
      const result = await res.json();
      setConfirmed({ mock: result.mock, eventLink: result.eventLink });
    } catch (err) {
      setBookError(err instanceof Error ? err.message : "Couldn't book — please try again.");
    } finally {
      setBooking(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Agent</CardTitle>
      </CardHeader>
      <CardContent>
        {loadError && <p className="text-sm text-danger">{loadError}</p>}

        {!loadError && slots === null && <p className="text-sm text-muted-foreground">Checking calendar availability…</p>}

        {!loadError && slots && slots.length === 0 && (
          <p className="text-sm text-muted-foreground">No open slots in the next 7 days.</p>
        )}

        {!loadError && slots && slots.length > 0 && !confirmed && (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Propose a slot to {sponsor.research.contactPerson.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s.startISO}
                    onClick={() => setSelected(s)}
                    className={cn(
                      "focus-ring rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                      selected?.startISO === s.startISO
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface-2 hover:bg-surface"
                    )}
                  >
                    {s.day} {s.time}
                  </button>
                ))}
              </div>
            </div>

            {selected && (
              <>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  placeholder="Meeting notes / agenda"
                />
                <Button size="sm" onClick={handleBook} disabled={booking}>
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                  {booking ? "Booking…" : `Book ${selected.day} ${selected.time}`}
                </Button>
                {!live && (
                  <p className="text-xs text-muted-foreground">
                    No Google Calendar connected — this will confirm a mock slot only, nothing gets booked for real.
                  </p>
                )}
              </>
            )}
            {bookError && <p className="text-sm text-danger">{bookError}</p>}
          </div>
        )}

        {confirmed && (
          <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="font-medium">{confirmed.mock ? "Mock booking confirmed" : "Meeting booked"}</p>
              <p className="text-xs text-muted-foreground">
                {confirmed.mock
                  ? "No calendar integration is connected, so nothing was actually added to a calendar."
                  : "Added to your Google Calendar and logged to the CRM."}
              </p>
              {confirmed.eventLink && (
                <a
                  href={confirmed.eventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View event <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
