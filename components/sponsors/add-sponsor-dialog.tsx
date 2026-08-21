"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addSponsor } from "@/lib/supabase/actions";
import { SWISS_CITIES } from "@/lib/data/seed";
import { SPONSOR_CATEGORIES } from "@/lib/agents/sponsorFinder";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding…" : "Add sponsor"}
    </Button>
  );
}

export function AddSponsorDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addSponsor, { ok: false });
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
        Add sponsor
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add a real sponsor prospect"
        description="Starts in PROSPECT with fit score pending — run the Researcher and Sponsor Finder logic on it once it's in."
      >
        <form ref={formRef} action={formAction} className="space-y-3">
          <div>
            <label htmlFor="sd-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Company name *
            </label>
            <Input id="sd-name" name="name" required placeholder="e.g. Migros" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sd-category" className="mb-1 block text-xs font-medium text-muted-foreground">
                Category *
              </label>
              <Select id="sd-category" name="category" required defaultValue="">
                <option value="" disabled>
                  Select a category
                </option>
                {SPONSOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="sd-city" className="mb-1 block text-xs font-medium text-muted-foreground">
                City *
              </label>
              <Select id="sd-city" name="city" required defaultValue="">
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
              <label htmlFor="sd-contact-name" className="mb-1 block text-xs font-medium text-muted-foreground">
                Contact name *
              </label>
              <Input id="sd-contact-name" name="contactName" required placeholder="Full name" />
            </div>
            <div>
              <label htmlFor="sd-contact-role" className="mb-1 block text-xs font-medium text-muted-foreground">
                Contact role
              </label>
              <Input id="sd-contact-role" name="contactRole" placeholder="e.g. Marketing Director" />
            </div>
          </div>
          <div>
            <label htmlFor="sd-contact-email" className="mb-1 block text-xs font-medium text-muted-foreground">
              Contact email *
            </label>
            <Input id="sd-contact-email" name="contactEmail" type="email" required placeholder="A real address — this is who Outreach will email" />
          </div>
          <div>
            <label htmlFor="sd-value" className="mb-1 block text-xs font-medium text-muted-foreground">
              Potential value (CHF)
            </label>
            <Input id="sd-value" name="potentialValue" type="number" min={0} step={500} defaultValue={5000} />
          </div>
          <div>
            <label htmlFor="sd-description" className="mb-1 block text-xs font-medium text-muted-foreground">
              Company description (optional)
            </label>
            <Textarea id="sd-description" name="description" rows={3} placeholder="What does this company do?" />
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
