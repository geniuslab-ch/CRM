import { AIRunLogEntry, AIRunSummary } from "@/types";

export const AI_RUN_LOG: AIRunLogEntry[] = [
  { timeSeconds: 0, agentId: "player-recruiter", message: "Player Recruiter started" },
  { timeSeconds: 1, agentId: "player-recruiter", message: "Identifying potential players…" },
  { timeSeconds: 3, agentId: "player-recruiter", message: "27 players identified" },
  { timeSeconds: 4, agentId: "club-finder", message: "Club Finder started" },
  { timeSeconds: 6, agentId: "club-finder", message: "12 clubs identified" },
  { timeSeconds: 8, agentId: "sponsor-finder", message: "Sponsor Finder started" },
  { timeSeconds: 10, agentId: "sponsor-finder", message: "42 sponsor opportunities identified" },
  { timeSeconds: 12, agentId: "sponsor-researcher", message: "Researcher started" },
  { timeSeconds: 15, agentId: "sponsor-researcher", message: "8 prospects researched" },
  { timeSeconds: 17, agentId: "outreach", message: "Outreach Agent generated 12 personalized messages" },
  { timeSeconds: 20, agentId: "conversation-manager", message: "Conversation Manager analyzed 4 replies" },
  { timeSeconds: 22, agentId: "booking", message: "Booking Agent qualified 2 opportunities" },
  { timeSeconds: 24, agentId: "content", message: "Content Agent generated 8 content opportunities" },
];

export const AI_RUN_SUMMARY: AIRunSummary = {
  newProspects: 12,
  qualifiedOpportunities: 4,
  meetingsBooked: 2,
  contentIdeas: 8,
};

export const AI_RUN_TOTAL_SECONDS = 25;
