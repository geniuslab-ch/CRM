import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { Sponsor, ContentPlatform } from "@/types";
import { brandVoice } from "@/lib/data/brand";

// Content Agent — "suggest content ideas from this deal". Grounded only in
// what the organizer actually typed into a sponsor's dealTerms field
// (never the generated proposal tier, which can drift from what a real
// negotiation settled on, and never invented deliverables beyond that
// text). Same gate as every other real AI feature: ANTHROPIC_API_KEY.

function isConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
export { isConfigured as isDealContentIdeasConfigured };

function client(): Anthropic {
  return new Anthropic();
}
function model(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
}
function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
function extractJsonArray(text: string): Record<string, unknown>[] {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "object" && x !== null) : [];
  } catch {
    return [];
  }
}
function str(v: Record<string, unknown>, key: string): string {
  const val = v[key];
  return typeof val === "string" ? val.trim() : "";
}

const PLATFORMS: ContentPlatform[] = ["Instagram", "TikTok", "YouTube", "LinkedIn"];

export interface DealContentIdea {
  title: string;
  platform: ContentPlatform;
  hook: string;
  caption: string;
  cta: string;
  suggestedFootage: string;
  sponsorIntegration: string | null;
}

export async function generateContentIdeasFromDeal(sponsor: Sponsor): Promise<DealContentIdea[]> {
  if (!sponsor.dealTerms?.trim()) {
    throw new Error("Add what was actually agreed with this sponsor first.");
  }

  const system = [
    `You are an AI teammate working for ${brandVoice.company}.`,
    brandVoice.description,
    `Tone: ${brandVoice.tone.join(", ")}. Avoid: ${brandVoice.avoid.join(", ")}.`,
    "You are the Content Agent. Given the real, already-agreed deal terms for a confirmed sponsor, generate exactly 3",
    "distinct, concrete content ideas that fulfill or naturally extend that specific agreement — never invent a",
    "deliverable, format or platform the agreement didn't mention or clearly imply. Ground sponsorIntegration in the",
    "sponsor's real name, not a generic placeholder.",
  ].join(" ");

  const user = [
    `Sponsor: ${sponsor.name} (${sponsor.category}).`,
    `What was actually agreed: ${sponsor.dealTerms}`,
    "Return ONLY a JSON array (no markdown fences, no other text) of exactly 3 objects, each shaped:",
    `{"title": string, "platform": one of [${PLATFORMS.join(", ")}], "hook": string, "caption": string, "cta": string,`,
    `"suggestedFootage": string, "sponsorIntegration": string}`,
  ].join(" ");

  const response = await client().messages.create({
    model: model(),
    max_tokens: 1800,
    system,
    messages: [{ role: "user", content: user }],
  });

  const raw = extractJsonArray(extractText(response));
  const ideas = raw
    .map((v) => ({
      title: str(v, "title"),
      platform: (PLATFORMS as string[]).includes(str(v, "platform")) ? (str(v, "platform") as ContentPlatform) : "Instagram",
      hook: str(v, "hook"),
      caption: str(v, "caption"),
      cta: str(v, "cta"),
      suggestedFootage: str(v, "suggestedFootage"),
      sponsorIntegration: str(v, "sponsorIntegration") || null,
    }))
    .filter((i) => i.title && i.caption);

  if (ideas.length === 0) {
    throw new Error("Couldn't generate usable content ideas from this deal — try again.");
  }
  return ideas;
}
