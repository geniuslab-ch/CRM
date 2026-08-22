import "server-only";
import * as React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { Club, Sponsor, SponsorshipTier } from "@/types";
import { ProposalDocument } from "./proposal-document";
import { ClubPosterDocument } from "./club-poster-document";
import { qrCodeDataUrl } from "./qr";
import { clubRegistrationUrl } from "@/lib/data/registration";

export async function renderProposalPdf(sponsor: Sponsor, tier: SponsorshipTier): Promise<Buffer> {
  return renderToBuffer(<ProposalDocument sponsor={sponsor} tier={tier} />);
}

export async function renderClubPosterPdf(club: Club): Promise<Buffer> {
  const qrDataUrl = await qrCodeDataUrl(clubRegistrationUrl(club.name));
  return renderToBuffer(<ClubPosterDocument club={club} qrDataUrl={qrDataUrl} />);
}
