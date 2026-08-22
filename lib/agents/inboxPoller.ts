import "server-only";
import { google, gmail_v1 } from "googleapis";
import { getGoogleAuth, isGoogleConfigured } from "@/lib/integrations/google-client";
import { getAIProvider } from "@/lib/ai";
import { getSponsors, getClubs, logConversation, getLastPolledAt, setLastPolledAt } from "@/lib/supabase/repository";
import { ConversationCategory } from "@/types";

// Conversation Manager's real inbound-reply ingestion. Polled by
// app/api/cron/poll-inbox on a schedule (see vercel.json) rather than
// Gmail push notifications — no Pub/Sub topic/webhook to stand up and
// maintain, at the cost of a few minutes of latency, which is fine for a
// single-organizer tool. Only matches messages from an email address
// already on file for a real sponsor or club (never players — they aren't
// an outreach channel); anything else is left alone, not logged.

interface KnownContact {
  contactName: string;
  organization: string;
  category: ConversationCategory;
  relatedId: string;
}

async function buildContactLookup(): Promise<Map<string, KnownContact>> {
  const [sponsors, clubs] = await Promise.all([getSponsors(), getClubs()]);
  const map = new Map<string, KnownContact>();
  for (const s of sponsors.data) {
    const email = s.research.contactPerson.email?.toLowerCase().trim();
    if (email) {
      map.set(email, { contactName: s.research.contactPerson.name, organization: s.name, category: "SPONSOR", relatedId: s.id });
    }
  }
  for (const c of clubs.data) {
    const email = c.contactEmail?.toLowerCase().trim();
    if (email) {
      map.set(email, { contactName: c.contactName, organization: c.name, category: "CLUB", relatedId: c.id });
    }
  }
  return map;
}

function headerValue(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function extractSenderEmail(fromHeader: string): string {
  const match = fromHeader.match(/<([^>]+)>/);
  return (match ? match[1] : fromHeader).toLowerCase().trim();
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

// Recursively hunts a Gmail message payload for the first text/plain part.
function extractPlainText(part: gmail_v1.Schema$MessagePart | undefined): string {
  if (!part) return "";
  if (part.mimeType === "text/plain" && part.body?.data) return decodeBase64Url(part.body.data);
  for (const child of part.parts ?? []) {
    const found = extractPlainText(child);
    if (found) return found;
  }
  return "";
}

export interface PollResult {
  polled: boolean;
  reason?: string;
  messagesScanned: number;
  repliesLogged: number;
}

export async function pollInbox(): Promise<PollResult> {
  if (!isGoogleConfigured()) {
    return { polled: false, reason: "Google/Gmail isn't configured — set GOOGLE_REFRESH_TOKEN.", messagesScanned: 0, repliesLogged: 0 };
  }

  const pollStartedAt = new Date();
  const lastPolledAt = await getLastPolledAt();
  const afterSeconds = Math.floor(new Date(lastPolledAt).getTime() / 1000);

  const gmail = google.gmail({ version: "v1", auth: getGoogleAuth() });
  const { data: list } = await gmail.users.messages.list({
    userId: "me",
    q: `in:inbox -in:sent after:${afterSeconds}`,
    maxResults: 50,
  });

  const messageRefs = list.messages ?? [];
  if (messageRefs.length === 0) {
    await setLastPolledAt(pollStartedAt.toISOString());
    return { polled: true, messagesScanned: 0, repliesLogged: 0 };
  }

  const contacts = await buildContactLookup();
  const ai = getAIProvider();
  let repliesLogged = 0;

  for (const ref of messageRefs) {
    if (!ref.id) continue;
    const { data: msg } = await gmail.users.messages.get({ userId: "me", id: ref.id, format: "full" });

    const fromEmail = extractSenderEmail(headerValue(msg.payload?.headers, "From"));
    const contact = contacts.get(fromEmail);
    if (!contact) continue; // not a known sponsor/club contact — ignore

    const bodyText = extractPlainText(msg.payload) || msg.snippet || "";
    if (!bodyText.trim()) continue;

    const result = await ai.classifyReply(bodyText);

    // gmail_message_id has a unique constraint — a duplicate insert (e.g.
    // this message already logged on a previous overlapping poll) fails
    // silently via logConversation's own error handling, which is exactly
    // the dedupe behavior we want here.
    await logConversation({
      contactName: contact.contactName,
      organization: contact.organization,
      category: contact.category,
      relatedId: contact.relatedId,
      message: bodyText.trim().slice(0, 4000),
      direction: "INBOUND",
      fromEmail,
      gmailMessageId: msg.id ?? undefined,
      gmailThreadId: msg.threadId ?? undefined,
      classification: result.classification,
      recommendedAction: result.recommendedAction,
      aiDraftResponse: result.draftResponse,
      unread: true,
    });
    repliesLogged++;
  }

  await setLastPolledAt(pollStartedAt.toISOString());
  return { polled: true, messagesScanned: messageRefs.length, repliesLogged };
}
