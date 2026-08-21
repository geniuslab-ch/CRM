"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { addPlayer } from "@/lib/supabase/actions";
import { SWISS_CITIES } from "@/lib/data/seed";

const POSITIONS = ["Attacker", "Playmaker", "Freestyler", "Defender", "All-Round"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding…" : "Add player"}
    </Button>
  );
}

export function AddPlayerDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addPlayer, { ok: false });
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
        Add player
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add a real player" description="Facts only — AI scoring runs later, not fabricated here.">
        <form ref={formRef} action={formAction} className="space-y-3">
          <div>
            <label htmlFor="pd-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Name *
            </label>
            <Input id="pd-name" name="name" required placeholder="Full name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pd-age" className="mb-1 block text-xs font-medium text-muted-foreground">
                Age
              </label>
              <Input id="pd-age" name="age" type="number" min={14} max={60} defaultValue={20} />
            </div>
            <div>
              <label htmlFor="pd-city" className="mb-1 block text-xs font-medium text-muted-foreground">
                City *
              </label>
              <Select id="pd-city" name="city" required defaultValue="">
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pd-position" className="mb-1 block text-xs font-medium text-muted-foreground">
                Position *
              </label>
              <Select id="pd-position" name="position" required defaultValue="">
                <option value="" disabled>
                  Select a position
                </option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="pd-club" className="mb-1 block text-xs font-medium text-muted-foreground">
                Club (optional)
              </label>
              <Input id="pd-club" name="club" placeholder="e.g. FC Lausanne" />
            </div>
          </div>
          <div>
            <label htmlFor="pd-social" className="mb-1 block text-xs font-medium text-muted-foreground">
              Social audience (followers)
            </label>
            <Input id="pd-social" name="socialAudience" type="number" min={0} defaultValue={0} />
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
