// Conversation Manager agent
// Classifies inbound replies and recommends the next action.
// Real-time classification for the "reply simulator" uses
// lib/ai/providers/mock.ts → classifyReply(). This module holds the
// static label metadata shared across the Conversation Center UI.

import { ConversationClassification } from "@/types";

export const CLASSIFICATION_LABELS: Record<ConversationClassification, string> = {
  AWAITING_REPLY: "Awaiting reply",
  INTERESTED: "Interested",
  NOT_INTERESTED: "Not interested",
  NEEDS_INFORMATION: "Needs information",
  SEND_PROPOSAL: "Send proposal",
  CALL_REQUEST: "Call request",
  OBJECTION: "Objection",
  FOLLOW_UP_LATER: "Follow up later",
  WRONG_PERSON: "Wrong person",
};

export const CLASSIFICATION_TONE: Record<ConversationClassification, "success" | "danger" | "warning" | "info"> = {
  AWAITING_REPLY: "info",
  INTERESTED: "success",
  NOT_INTERESTED: "danger",
  NEEDS_INFORMATION: "info",
  SEND_PROPOSAL: "success",
  CALL_REQUEST: "info",
  OBJECTION: "warning",
  FOLLOW_UP_LATER: "warning",
  WRONG_PERSON: "danger",
};
