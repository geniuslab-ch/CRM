"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { addEvent } from "@/lib/supabase/actions";
import { SWISS_CITIES } from "@/lib/data/seed";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding…" : "Add event"}
    </Button>
  );
}

export function AddEventDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addEvent, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add event
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add a new event"
        description="Expand Panna League to another city — starts in pre-launch with no confirmed players/clubs/sponsors of its own yet."
      >
        <form ref={formRef} action={formAction} className="space-y-3">
          <div>
            <label htmlFor="ev-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Event name *
            </label>
            <Input id="ev-name" name="name" required placeholder="e.g. Panna League — Geneva" />
          </div>
          <div>
            <label htmlFor="ev-city" className="mb-1 block text-xs font-medium text-muted-foreground">
              City *
            </label>
            <Select id="ev-city" name="city" required defaultValue="">
              <option value="" disabled>
                Select a city
              </option>
              {SWISS_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ev-venue" className="mb-1 block text-xs font-medium text-muted-foreground">
                Venue
              </label>
              <Input id="ev-venue" name="venue" placeholder="Not confirmed yet" />
            </div>
            <div>
              <label htmlFor="ev-date" className="mb-1 block text-xs font-medium text-muted-foreground">
                Date
              </label>
              <Input id="ev-date" name="date" type="date" />
            </div>
          </div>
          <div>
            <label htmlFor="ev-edition" className="mb-1 block text-xs font-medium text-muted-foreground">
              Edition number
            </label>
            <Input id="ev-edition" name="edition" type="number" min={1} placeholder="e.g. 2 — leave blank if TBD" />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Shows as &quot;Edition N°X&quot; on the marketing site once this event is announced. Leave blank to
              show TBD.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="ev-player-target" className="mb-1 block text-xs font-medium text-muted-foreground">
                Player target
              </label>
              <Input id="ev-player-target" name="playerTarget" type="number" min={1} defaultValue={32} />
            </div>
            <div>
              <label htmlFor="ev-club-target" className="mb-1 block text-xs font-medium text-muted-foreground">
                Club target
              </label>
              <Input id="ev-club-target" name="clubTarget" type="number" min={0} defaultValue={10} />
            </div>
            <div>
              <label htmlFor="ev-sponsor-target" className="mb-1 block text-xs font-medium text-muted-foreground">
                Sponsor target
              </label>
              <Input id="ev-sponsor-target" name="sponsorTarget" type="number" min={0} defaultValue={8} />
            </div>
          </div>
          <div>
            <label htmlFor="ev-digital-target" className="mb-1 block text-xs font-medium text-muted-foreground">
              Digital audience target
            </label>
            <Input id="ev-digital-target" name="digitalAudienceTarget" type="number" min={0} defaultValue={10000} />
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
