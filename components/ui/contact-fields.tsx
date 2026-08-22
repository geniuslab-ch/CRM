"use client";

import { Input } from "@/components/ui/input";
import { Contact } from "@/types";

// Up to 3 named contacts, one marked primary via a radio group. Field
// names (contactName0/contactEmail0[/contactRole0] .. 2, primaryContact)
// are read by lib/supabase/actions.ts's readContacts() helper — shared
// by the club and sponsor add/edit dialogs.
export function ContactFields({ defaultContacts, withRole }: { defaultContacts?: Contact[]; withRole: boolean }) {
  const primaryIndex = Math.max(
    0,
    defaultContacts?.findIndex((c) => c.isPrimary) ?? 0
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Contacts — up to 3. The one marked primary is the default for outreach and calendar invites; the first slot
        is required.
      </p>
      {[0, 1, 2].map((i) => {
        const c = defaultContacts?.[i];
        return (
          <div key={i} className="space-y-1.5 rounded-lg border border-border bg-surface-2 p-2.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <input
                type="radio"
                name="primaryContact"
                value={i}
                defaultChecked={i === primaryIndex}
                className="accent-primary"
              />
              Primary contact
            </label>
            <div className={withRole ? "grid grid-cols-3 gap-2" : "grid grid-cols-2 gap-2"}>
              <Input
                name={`contactName${i}`}
                placeholder={i === 0 ? "Full name *" : "Full name"}
                defaultValue={c?.name ?? ""}
                required={i === 0}
              />
              {withRole && <Input name={`contactRole${i}`} placeholder="Role" defaultValue={c?.role ?? ""} />}
              <Input
                name={`contactEmail${i}`}
                type="email"
                placeholder={i === 0 ? "Email *" : "Email"}
                defaultValue={c?.email ?? ""}
                required={i === 0}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
