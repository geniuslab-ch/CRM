// Club Finder agent
// Pipeline: IDENTIFIED → CONTACTED → INTERESTED → PLAYERS_PROPOSED → CONFIRMED → PARTNER
// Rule: first-contact outreach is always framed as player recruitment, never
// as a commercial partnership ask — see engagementType in lib/data/clubs.ts.

export const CLUB_PIPELINE_ORDER = [
  "IDENTIFIED",
  "CONTACTED",
  "INTERESTED",
  "PLAYERS_PROPOSED",
  "CONFIRMED",
  "PARTNER",
] as const;

export function isCommercialReady(status: string): boolean {
  return status === "CONFIRMED" || status === "PARTNER";
}
