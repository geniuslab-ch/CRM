"use client";

import { useState } from "react";
import { Sponsor, SponsorshipTier } from "@/types";
import { ProposalGenerator } from "@/components/sponsors/proposal-generator";
import { OutreachComposer } from "@/components/sponsors/outreach-composer";

export function SponsorWorkspace({ sponsor }: { sponsor: Sponsor }) {
  const [proposalTier, setProposalTier] = useState<SponsorshipTier | null>(null);

  return (
    <>
      <ProposalGenerator sponsor={sponsor} onTierChange={setProposalTier} />
      <OutreachComposer sponsor={sponsor} proposalTier={proposalTier} />
    </>
  );
}
