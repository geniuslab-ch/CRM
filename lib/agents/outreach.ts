// Outreach Agent
// Never sends generic messages — always composes from research + role +
// Panna League positioning + brand voice. See lib/ai/providers/mock.ts
// for the actual message generation (generateOutreach).

export interface OutreachDraft {
  researchInsight: string;
  personalizationAngle: string;
  message: string;
}

export function buildResearchInsight(recentMarketingActivity: string): string {
  return recentMarketingActivity;
}

export function buildPersonalizationAngle(industry: string): string {
  return `Connect Panna League to ${industry.toLowerCase()}'s audience and brand goals.`;
}
