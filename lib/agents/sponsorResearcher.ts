// Sponsor Researcher agent
// Builds the "WHY THIS COMPANY?" narrative + package suggestion for every
// sponsor prospect. Full research payload lives on Sponsor.research
// (see types/index.ts). This module exposes the "why" formatter
// used across the Sponsor Detail page and CRM cards.

import { Sponsor } from "@/types";

export function whyPannaLeague(sponsor: Sponsor): string[] {
  const reasons = [
    "Football audience",
    "Young demographic",
    "Physical activation",
    "Digital content",
    "Swiss market",
    "Community engagement",
  ];
  if (sponsor.fit.audienceFit >= 85) reasons.push("Best-in-class audience overlap");
  return reasons;
}
