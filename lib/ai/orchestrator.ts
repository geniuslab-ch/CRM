// AI Orchestrator
// ─────────────────────────────────────────────────────────────
// Decides which specialist agent acts next, given an event in the
// system. This is the seam where a real task queue / workflow engine
// would plug in later — for the prototype it's a deterministic state
// machine that also powers the "Run AI Team" simulation timeline.
//
// Flow for a new sponsor prospect:
//   Sponsor Finder → Researcher → Outreach → Conversation Manager
//     → (objection-handling logic inside Conversation Manager)
//     → Booking Agent → CRM stage update
//
// Flow for a new club:
//   Club Finder → Outreach (player recruitment framing) → Conversation Manager
//
// Flow for event activity:
//   (player win / milestone) → Content Agent → Content Command Center

import { AgentId } from "@/types";

export type OrchestratorEvent =
  | { type: "SPONSOR_PROSPECT_FOUND"; sponsorId: string }
  | { type: "SPONSOR_RESEARCHED"; sponsorId: string }
  | { type: "OUTREACH_SENT"; sponsorId: string }
  | { type: "REPLY_RECEIVED"; conversationId: string }
  | { type: "BUYING_INTENT_DETECTED"; conversationId: string }
  | { type: "CLUB_IDENTIFIED"; clubId: string }
  | { type: "EVENT_MILESTONE"; milestone: string };

interface OrchestratorStep {
  nextAgent: AgentId;
  action: string;
}

export function nextStep(event: OrchestratorEvent): OrchestratorStep {
  switch (event.type) {
    case "SPONSOR_PROSPECT_FOUND":
      return { nextAgent: "sponsor-researcher", action: "Research company background and fit" };
    case "SPONSOR_RESEARCHED":
      return { nextAgent: "outreach", action: "Generate personalized outreach message" };
    case "OUTREACH_SENT":
      return { nextAgent: "conversation-manager", action: "Monitor for a reply" };
    case "REPLY_RECEIVED":
      return { nextAgent: "conversation-manager", action: "Classify reply and recommend next action" };
    case "BUYING_INTENT_DETECTED":
      return { nextAgent: "booking", action: "Qualify opportunity and propose meeting slots" };
    case "CLUB_IDENTIFIED":
      return { nextAgent: "outreach", action: "Generate player-recruitment-first outreach" };
    case "EVENT_MILESTONE":
      return { nextAgent: "content", action: "Generate a content opportunity from this milestone" };
  }
}

// The canonical pipeline order shown in the UI's "AI Team" panel.
export const AGENT_PIPELINE: AgentId[] = [
  "player-recruiter",
  "club-finder",
  "sponsor-finder",
  "sponsor-researcher",
  "outreach",
  "conversation-manager",
  "booking",
  "content",
];
