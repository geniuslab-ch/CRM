"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ContactFields } from "@/components/ui/contact-fields";
import { addClub } from "@/lib/supabase/actions";
import { SWISS_CITIES } from "@/lib/data/seed";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding…" : "Add club"}
    </Button>
  );
}

export function AddClubDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addClub, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<"CLUB" | "SCHOOL">("CLUB");

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setKind("CLUB");
      setOpen(false);
    }
  }, [state]);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add club or school
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={kind === "SCHOOL" ? "Add a real school" : "Add a real club"}
        description="Starts at IDENTIFIED, player-recruitment framing — matches the agent's outreach rules."
      >
        <form ref={formRef} action={formAction} className="space-y-3">
          <div>
            <p className="mb-1 block text-xs font-medium text-muted-foreground">Kind *</p>
            <div className="flex gap-2">
              {(["CLUB", "SCHOOL"] as const).map((k) => (
                <label
                  key={k}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="kind"
                    value={k}
                    checked={kind === k}
                    onChange={() => setKind(k)}
                    className="accent-primary"
                  />
                  {k === "CLUB" ? "Football club" : "School"}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="cd-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              {kind === "SCHOOL" ? "School name *" : "Club name *"}
            </label>
            <Input id="cd-name" name="name" required placeholder={kind === "SCHOOL" ? "e.g. Collège de Béthusy" : "e.g. FC Lausanne-Sport"} />
          </div>
          <div>
            <label htmlFor="cd-city" className="mb-1 block text-xs font-medium text-muted-foreground">
              City *
            </label>
            <Select id="cd-city" name="city" required defaultValue="">
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
          <ContactFields withRole={false} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cd-website" className="mb-1 block text-xs font-medium text-muted-foreground">
                Website
              </label>
              <Input id="cd-website" name="website" placeholder="https://" />
            </div>
            <div>
              <label htmlFor="cd-players" className="mb-1 block text-xs font-medium text-muted-foreground">
                Players identified
              </label>
              <Input id="cd-players" name="playersIdentified" type="number" min={0} defaultValue={0} />
            </div>
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
