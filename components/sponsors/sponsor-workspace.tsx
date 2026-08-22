"use client";

import { useState } from "react";
import { Sponsor, SponsorshipTier } from "@/types";
import { ActivationLab } from "@/components/sponsors/activation-lab";
import { ProposalGenerator } from "@/components/sponsors/proposal-generator";
import { BookingWidget } from "@/components/booking/booking-widget";

// Activation Lab leads: the first touch should sell a specific idea, not
// a generic pitch. The formal proposal (with pricing) is a later-funnel
// document, so it's kept but no longer the first thing in the workspace.
export function SponsorWorkspace({ sponsor }: { sponsor: Sponsor }) {
  const [proposalTier, setProposalTier] = useState<SponsorshipTier | null>(null);

  return (
    <>
      <ActivationLab sponsor={sponsor} proposalTier={proposalTier} />
      <ProposalGenerator sponsor={sponsor} onTierChange={setProposalTier} />
      <BookingWidget
        contactName={sponsor.research.contactPerson.name}
        contactEmail={sponsor.research.contactPerson.email}
        organization={sponsor.name}
        category="SPONSOR"
        relatedId={sponsor.id}
        bookingCategory="sponsor"
      />
    </>
  );
}
