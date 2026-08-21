// Booking Agent
// Detects buying intent in conversation text and simulates meeting
// scheduling. Real integration point: lib/integrations/calendar.ts.

const INTENT_PHRASES = [
  "let's discuss",
  "let's talk",
  "send a proposal",
  "can we hop on a call",
  "book a call",
  "schedule a call",
];

export function detectBuyingIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return INTENT_PHRASES.some((phrase) => lower.includes(phrase));
}

export const MOCK_AVAILABLE_SLOTS = [
  { day: "Tuesday", time: "10:00" },
  { day: "Wednesday", time: "14:00" },
  { day: "Thursday", time: "09:30" },
  { day: "Friday", time: "15:00" },
];
