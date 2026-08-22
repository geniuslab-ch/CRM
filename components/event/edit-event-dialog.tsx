"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { updateEventAction } from "@/lib/supabase/actions";
import { SWISS_CITIES } from "@/lib/data/seed";
import { PannaEvent } from "@/types";

const STATUSES: PannaEvent["status"][] = ["PRE_LAUNCH", "ANNOUNCED", "REGISTRATION_OPEN", "LIVE", "COMPLETED"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function EditEventDialog({ event }: { event: PannaEvent }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(updateEventAction, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Edit
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit event" description="Set the real date and venue once confirmed — this also feeds the marketing site.">
        <form ref={formRef} action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={event.id} />
          <div>
            <label htmlFor="eed-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Event name *
            </label>
            <Input id="eed-name" name="name" required defaultValue={event.name} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="eed-city" className="mb-1 block text-xs font-medium text-muted-foreground">
                City *
              </label>
              <Select id="eed-city" name="city" required defaultValue={event.city}>
                {SWISS_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="eed-status" className="mb-1 block text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select id="eed-status" name="status" defaultValue={event.status}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="eed-venue" className="mb-1 block text-xs font-medium text-muted-foreground">
                Venue
              </label>
              <Input id="eed-venue" name="venue" placeholder="Not confirmed yet" defaultValue={event.venue ?? ""} />
            </div>
            <div>
              <label htmlFor="eed-date" className="mb-1 block text-xs font-medium text-muted-foreground">
                Date
              </label>
              <Input id="eed-date" name="date" type="date" defaultValue={event.date ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="eed-player-target" className="mb-1 block text-xs font-medium text-muted-foreground">
                Player target
              </label>
              <Input id="eed-player-target" name="playerTarget" type="number" min={1} defaultValue={event.playerTarget} />
            </div>
            <div>
              <label htmlFor="eed-club-target" className="mb-1 block text-xs font-medium text-muted-foreground">
                Club target
              </label>
              <Input id="eed-club-target" name="clubTarget" type="number" min={0} defaultValue={event.clubTarget} />
            </div>
            <div>
              <label htmlFor="eed-sponsor-target" className="mb-1 block text-xs font-medium text-muted-foreground">
                Sponsor target
              </label>
              <Input id="eed-sponsor-target" name="sponsorTarget" type="number" min={0} defaultValue={event.sponsorTarget} />
            </div>
          </div>
          <div>
            <label htmlFor="eed-digital-target" className="mb-1 block text-xs font-medium text-muted-foreground">
              Digital audience target
            </label>
            <Input
              id="eed-digital-target"
              name="digitalAudienceTarget"
              type="number"
              min={0}
              defaultValue={event.digitalAudienceTarget}
            />
          </div>
          {state.error && <p className="text-sm text-danger">{state.error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Dialog>
    </>
  );
}
