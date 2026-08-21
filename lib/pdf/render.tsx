import "server-only";
import * as React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { Sponsor, SponsorshipTier } from "@/types";
import { ProposalDocument } from "./proposal-document";

export async function renderProposalPdf(sponsor: Sponsor, tier: SponsorshipTier): Promise<Buffer> {
  return renderToBuffer(<ProposalDocument sponsor={sponsor} tier={tier} />);
}
