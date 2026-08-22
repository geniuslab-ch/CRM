"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationCategory } from "@/types";
import { cn } from "@/lib/utils";

interface Slot {
  day: string;
  time: string;
  startISO: string;
  endISO: string;
}

export function PublicBookingWidget({
  organization,
  category,
  relatedId,
  defaultName,
}: {
  organization: string;
  category: ConversationCategory;
  relatedId: string;
  defaultName: string;
}) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [live, setLive] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [name, setName] = useState(defaultName);
  const [notes, setNotes] = useState("");
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
      .catch(() => !cancelled && setLoadError("Couldn't load availability."));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleBook() {
    if (!selected || !name.trim()) return;
    setBooking(true);
    setBookError(null);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: selected,
          withName: name.trim(),
          notes: notes || `Booked directly by ${organization} via their booking link.`,
          logAs: { organization, category, relatedId },
          bookedBy: "CONTACT",
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
    <Card className="w-full max-w-lg p-6 sm:p-8">
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-display text-lg font-black text-primary-foreground">
          P
        </div>
        <p className="text-sm font-bold tracking-tight">PANNA LEAGUE</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Book a time with the team</p>
      </div>

      {loadError && <p className="text-sm text-danger">{loadError}</p>}
      {!loadError && slots === null && <p className="text-center text-sm text-muted-foreground">Checking availability…</p>}
      {!loadError && slots && slots.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No open slots in the next 7 days — reach out directly instead.</p>
      )}

      {!loadError && slots && slots.length > 0 && !confirmed && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pick a time</p>
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
              <div>
                <label htmlFor="pb-name" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Your name
                </label>
                <Input id="pb-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="What would you like to discuss? (optional)"
                className="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
              <Button className="w-full" onClick={handleBook} disabled={booking || !name.trim()}>
                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                {booking ? "Booking…" : `Book ${selected.day} ${selected.time}`}
              </Button>
              {!live && (
                <p className="text-center text-xs text-muted-foreground">
                  This will confirm a placeholder slot only — nothing is actually booked yet.
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
            <p className="font-medium">{confirmed.mock ? "Placeholder confirmed" : "You're booked!"}</p>
            <p className="text-xs text-muted-foreground">
              {confirmed.mock
                ? "No calendar integration is connected on our end yet — nothing was actually added to a calendar."
                : "We've added this to our calendar and you should receive a calendar invite."}
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
    </Card>
  );
}
