// Player Recruiter agent
// Scoring model lives in lib/data/players.ts (generatePlayers). This module
// documents the agent's decision logic so a real implementation can later
// replace the scoring function without touching the UI layer.

export const PLAYER_RECRUITER_WEIGHTS = {
  technical: 0.25,
  experience: 0.18,
  streetRelevance: 0.22,
  socialAudience: 0.15,
  localRelevance: 0.1,
  competitivePotential: 0.1,
};

export function priorityLabel(score: number): string {
  if (score >= 88) return "High-priority recruitment target.";
  if (score >= 75) return "Strong recruitment candidate.";
  if (score >= 60) return "Worth a follow-up call.";
  return "Low priority — monitor only.";
}
