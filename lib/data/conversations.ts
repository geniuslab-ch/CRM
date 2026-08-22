import { Conversation, ConversationCategory, ConversationClassification, Message } from "@/types";
import { makeRng } from "./seed";
import { players } from "./players";
import { clubs } from "./clubs";
import { sponsors } from "./sponsors";

const CLASSIFICATIONS: ConversationClassification[] = [
  "INTERESTED", "NOT_INTERESTED", "NEEDS_INFORMATION", "SEND_PROPOSAL",
  "CALL_REQUEST", "OBJECTION", "FOLLOW_UP_LATER", "WRONG_PERSON",
];

const RECOMMENDED_ACTION: Record<ConversationClassification, string> = {
  AWAITING_REPLY: "No reply yet — follow up if you don't hear back in a few days.",
  INTERESTED: "Move to next stage and propose a concrete next step.",
  NOT_INTERESTED: "Log as declined and archive — revisit next season.",
  NEEDS_INFORMATION: "Send sponsorship deck + propose a 15-minute call.",
  SEND_PROPOSAL: "Generate and send tailored sponsorship proposal.",
  CALL_REQUEST: "Offer available time slots via Booking Agent.",
  OBJECTION: "Address concern directly, then re-offer a smaller package.",
  FOLLOW_UP_LATER: "Schedule automatic follow-up in 2 weeks.",
  WRONG_PERSON: "Ask for the correct contact and re-route outreach.",
};

const THEM_MESSAGES: Record<ConversationClassification, string[]> = {
  AWAITING_REPLY: [],
  INTERESTED: [
    "This looks great, we'd love to be involved.",
    "Sounds like a great fit for us, tell me more about next steps.",
  ],
  NOT_INTERESTED: [
    "Thanks, but this isn't something we're pursuing right now.",
    "Not the right fit for our brand this year, sorry.",
  ],
  NEEDS_INFORMATION: [
    "Interesting. Can you send me more information?",
    "Do you have a deck with more details on audience and pricing?",
  ],
  SEND_PROPOSAL: [
    "This could work — can you send over a formal proposal?",
    "We're ready to see numbers. Send the proposal when you can.",
  ],
  CALL_REQUEST: [
    "Can we hop on a quick call to discuss this?",
    "Let's talk — do you have 15 minutes this week?",
  ],
  OBJECTION: [
    "The budget you're proposing feels high for a first-year event.",
    "We already sponsor a similar type of event, not sure we need another.",
  ],
  FOLLOW_UP_LATER: [
    "Can you check back with us in a few weeks? Budget season isn't until then.",
    "Good timing isn't right now, circle back in Q4.",
  ],
  WRONG_PERSON: [
    "I'm not the right contact for this, you'll want our events team.",
    "This isn't my department, let me pass this along.",
  ],
};

const AI_DRAFTS: Record<ConversationClassification, string[]> = {
  AWAITING_REPLY: [],
  INTERESTED: [
    "Fantastic to hear! I'll send over our partnership overview and grab time on your calendar this week.",
  ],
  NOT_INTERESTED: [
    "Totally understood — thank you for the quick reply. I'll keep the door open for next season.",
  ],
  NEEDS_INFORMATION: [
    "Of course — attaching our sponsorship deck now. Would a 15-minute call this week help walk through the numbers?",
  ],
  SEND_PROPOSAL: [
    "Great — putting together a tailored proposal now based on our conversation. You'll have it within 24 hours.",
  ],
  CALL_REQUEST: [
    "Happy to jump on a call — I have Tuesday 10:00 or Wednesday 14:00 open. Which works better?",
  ],
  OBJECTION: [
    "Fair point — we can scale the package to your budget. Would a smaller activation-only tier work better?",
  ],
  FOLLOW_UP_LATER: [
    "No problem at all — I'll follow up in a few weeks. In the meantime, here's a one-pager for your team.",
  ],
  WRONG_PERSON: [
    "Thanks for letting me know — could you point me to the right contact, or forward this along?",
  ],
};

interface ContactSource {
  name: string;
  organization: string;
  category: ConversationCategory;
  relatedId: string;
}

function buildContactPool(): ContactSource[] {
  const pool: ContactSource[] = [];
  for (const p of players.filter((p) => p.status === "CONTACTED" || p.status === "INTERESTED" || p.status === "CONFIRMED")) {
    pool.push({ name: p.name, organization: p.club ?? "Independent", category: "PLAYER", relatedId: p.id });
  }
  for (const c of clubs.filter((c) => c.status !== "IDENTIFIED")) {
    pool.push({ name: c.contactName, organization: c.name, category: "CLUB", relatedId: c.id });
  }
  for (const s of sponsors.filter((s) => s.stage !== "PROSPECT" && s.stage !== "RESEARCH")) {
    pool.push({ name: s.research.contactPerson.name, organization: s.name, category: "SPONSOR", relatedId: s.id });
  }
  pool.push(
    { name: "Elise Fournier", organization: "RTS Sport", category: "MEDIA", relatedId: "media-1" },
    { name: "Marco Fasel", organization: "Blick Sport", category: "MEDIA", relatedId: "media-2" },
    { name: "Nina Wyss", organization: "20 Minuten", category: "MEDIA", relatedId: "media-3" },
    { name: "Julien Roch", organization: "Radio Lac", category: "MEDIA", relatedId: "media-4" },
  );
  return pool;
}

export function generateConversations(count = 20): Conversation[] {
  const rng = makeRng(9911);
  const pool = rng.pickMultiple(buildContactPool(), Math.min(count, buildContactPool().length));
  const conversations: Conversation[] = [];

  for (let i = 0; i < count; i++) {
    const contact = pool[i % pool.length];
    const classification = rng.pick(CLASSIFICATIONS);
    const themText = rng.pick(THEM_MESSAGES[classification]);
    const aiDraft = rng.pick(AI_DRAFTS[classification]);

    const messages: Message[] = [
      {
        id: `${i}-m1`,
        from: "AI",
        text: `Hi ${contact.name.split(" ")[0]}, reaching out about Panna League Switzerland — a live street-football format with strong digital reach. Would love to explore a fit with ${contact.organization}.`,
        timestamp: rng.daysAgoISO(20, 10),
      },
      {
        id: `${i}-m2`,
        from: "THEM",
        text: themText,
        timestamp: rng.daysAgoISO(9, 1),
      },
    ];

    conversations.push({
      id: `conv-${i + 1}`,
      contactName: contact.name,
      contactEmail: null,
      organization: contact.organization,
      category: contact.category,
      relatedId: contact.relatedId,
      messages,
      lastMessagePreview: themText,
      lastMessageAt: messages[1].timestamp,
      classification,
      recommendedAction: RECOMMENDED_ACTION[classification],
      aiDraftResponse: aiDraft,
      unread: rng.bool(0.35),
    });
  }

  return conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export const conversations = generateConversations(20);
