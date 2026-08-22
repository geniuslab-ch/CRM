"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ContactFields } from "@/components/ui/contact-fields";
import { updateClub } from "@/lib/supabase/actions";
import { SWISS_CITIES } from "@/lib/data/seed";
import { Club } from "@/types";

const STATUSES = ["IDENTIFIED", "CONTACTED", "INTERESTED", "PLAYERS_PROPOSED", "CONFIRMED", "PARTNER"];
const POTENTIALS = ["LOW", "MEDIUM", "HIGH"];
const ENGAGEMENTS = [
  { value: "PLAYER_RECRUITMENT", label: "Player recruitment" },
  { value: "COMMERCIAL_PARTNERSHIP", label: "Commercial partnership" },
  { value: "BOTH", label: "Recruitment + partnership" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function EditClubDialog({ club }: { club: Club }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(updateClub, { ok: false });

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Edit ${club.name}`}
        className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit club" description="Fix a contact detail or move it through the pipeline.">
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={club.id} />
          <div>
            <label htmlFor="ecd-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Club name *
            </label>
            <Input id="ecd-name" name="name" required defaultValue={club.name} />
          </div>
          <div>
            <label htmlFor="ecd-city" className="mb-1 block text-xs font-medium text-muted-foreground">
              City *
            </label>
            <Select id="ecd-city" name="city" required defaultValue={club.city}>
              {SWISS_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <ContactFields defaultContacts={club.contacts} withRole={false} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ecd-website" className="mb-1 block text-xs font-medium text-muted-foreground">
                Website
              </label>
              <Input id="ecd-website" name="website" defaultValue={club.website} />
            </div>
            <div>
              <label htmlFor="ecd-players" className="mb-1 block text-xs font-medium text-muted-foreground">
                Players identified
              </label>
              <Input id="ecd-players" name="playersIdentified" type="number" min={0} defaultValue={club.playersIdentified} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ecd-status" className="mb-1 block text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select id="ecd-status" name="status" defaultValue={club.status}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="ecd-potential" className="mb-1 block text-xs font-medium text-muted-foreground">
                Potential
              </label>
              <Select id="ecd-potential" name="potential" defaultValue={club.potential}>
                {POTENTIALS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="ecd-engagement" className="mb-1 block text-xs font-medium text-muted-foreground">
              Engagement type
            </label>
            <Select id="ecd-engagement" name="engagementType" defaultValue={club.engagementType}>
              {ENGAGEMENTS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </Select>
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
