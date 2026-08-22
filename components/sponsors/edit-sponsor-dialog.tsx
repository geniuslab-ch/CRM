"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateSponsor } from "@/lib/supabase/actions";
import { SWISS_CITIES } from "@/lib/data/seed";
import { SPONSOR_CATEGORIES } from "@/lib/agents/sponsorFinder";
import { STAGES } from "./sponsor-kanban";
import { Sponsor } from "@/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function EditSponsorDialog({ sponsor }: { sponsor: Sponsor }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(updateSponsor, { ok: false });
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
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit sponsor" description="Fix a placeholder contact, move the stage, or update the numbers.">
        <form ref={formRef} action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={sponsor.id} />
          <div>
            <label htmlFor="ed-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Company name *
            </label>
            <Input id="ed-name" name="name" required defaultValue={sponsor.name} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ed-category" className="mb-1 block text-xs font-medium text-muted-foreground">
                Category *
              </label>
              <Select id="ed-category" name="category" required defaultValue={sponsor.category}>
                {SPONSOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="ed-city" className="mb-1 block text-xs font-medium text-muted-foreground">
                City *
              </label>
              <Select id="ed-city" name="city" required defaultValue={sponsor.city}>
                {SWISS_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="ed-stage" className="mb-1 block text-xs font-medium text-muted-foreground">
              Pipeline stage
            </label>
            <Select id="ed-stage" name="stage" defaultValue={sponsor.stage}>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ed-contact-name" className="mb-1 block text-xs font-medium text-muted-foreground">
                Contact name *
              </label>
              <Input id="ed-contact-name" name="contactName" required defaultValue={sponsor.research.contactPerson.name} />
            </div>
            <div>
              <label htmlFor="ed-contact-role" className="mb-1 block text-xs font-medium text-muted-foreground">
                Contact role
              </label>
              <Input id="ed-contact-role" name="contactRole" defaultValue={sponsor.research.contactPerson.role} />
            </div>
          </div>
          <div>
            <label htmlFor="ed-contact-email" className="mb-1 block text-xs font-medium text-muted-foreground">
              Contact email *
            </label>
            <Input
              id="ed-contact-email"
              name="contactEmail"
              type="email"
              required
              defaultValue={sponsor.research.contactPerson.email}
            />
          </div>
          <div>
            <label htmlFor="ed-value" className="mb-1 block text-xs font-medium text-muted-foreground">
              Potential value (CHF)
            </label>
            <Input id="ed-value" name="potentialValue" type="number" min={0} step={500} defaultValue={sponsor.potentialValue} />
          </div>
          <div>
            <label htmlFor="ed-description" className="mb-1 block text-xs font-medium text-muted-foreground">
              Company description
            </label>
            <Textarea id="ed-description" name="description" rows={3} defaultValue={sponsor.research.companyDescription} />
          </div>
          <div>
            <label htmlFor="ed-fit-why" className="mb-1 block text-xs font-medium text-muted-foreground">
              &ldquo;Why Panna League&rdquo; pitch (shown to the sponsor — PDF &amp; outreach)
            </label>
            <Textarea id="ed-fit-why" name="fitWhy" rows={3} defaultValue={sponsor.fitWhy} />
          </div>
          <div>
            <label htmlFor="ed-deal-terms" className="mb-1 block text-xs font-medium text-muted-foreground">
              Deal terms — what was actually agreed (internal only, feeds AI content ideas)
            </label>
            <Textarea
              id="ed-deal-terms"
              name="dealTerms"
              rows={3}
              placeholder="e.g. 3 Instagram Reels during the event, logo on the panna cage, 2 winner interview clips…"
              defaultValue={sponsor.dealTerms ?? ""}
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
