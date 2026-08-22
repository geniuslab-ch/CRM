// Sponsor Finder agent
// Fit scoring model lives on Sponsor.fit (see types/index.ts).
// Weighting documented here for transparency / future tuning.

export const SPONSOR_FIT_WEIGHTS = {
  audienceFit: 0.28,
  activationFit: 0.22,
  swissPresence: 0.18,
  brandPositioning: 0.17,
  budgetPotential: 0.15,
};

export const SPONSOR_CATEGORIES = [
  "Sportswear",
  "Sporting Goods",
  "Financial Services",
  "Insurance",
  "Telecommunications",
  "Automotive",
  "Food & Beverage",
  "Technology",
  "Mobility",
  "Retail",
  "Energy",
  "Youth Brands",
] as const;

export function fitLabel(score: number): string {
  if (score >= 88) return "High-priority commercial prospect.";
  if (score >= 72) return "Strong commercial fit — prioritize outreach.";
  if (score >= 55) return "Moderate fit — pursue after top-tier prospects.";
  return "Low priority — revisit if budget allows.";
}
