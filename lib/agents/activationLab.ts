import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { ActivationConcept, ActivationDifficulty, Sponsor } from "@/types";

// The AI Activation Lab — replaces the old "generic cold email" Outreach
// Agent flow for sponsors. The AI is briefed to behave as a sponsorship
// strategist / guerrilla marketing creative director, not a sales-email
// generator: the core question is never "how do we convince this company
// to sponsor us", it's "what does this company already care about, and
// what would they want to own". Every prompt below encodes that
// discipline directly, including a same-idea-transplant-test ("could you
// swap in another sponsor's name and still use this idea? if yes, reject
// it") so ideas stay specific to the real, researched brand.

function isConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
export { isConfigured as isActivationLabConfigured };

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
function extractJsonObject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return {};
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
function str(v: Record<string, unknown>, key: string): string {
  const val = v[key];
  return typeof val === "string" ? val.trim() : "";
}
function strArray(v: Record<string, unknown>, key: string): string[] {
  const val = v[key];
  return Array.isArray(val) ? val.filter((x): x is string => typeof x === "string") : [];
}
function num(v: Record<string, unknown>, key: string, fallback: number): number {
  const val = v[key];
  return typeof val === "number" && Number.isFinite(val) ? Math.max(0, Math.min(100, Math.round(val))) : fallback;
}
function difficulty(v: Record<string, unknown>, key: string): ActivationDifficulty {
  const val = str(v, key).toUpperCase();
  return val === "LOW" || val === "MEDIUM" || val === "HIGH" ? val : "MEDIUM";
}

const PANNA_ASSETS = [
  "LIVE: 1v1 street football, panna challenges, tournaments, player battles, audience challenges, live MC, physical installations",
  "PEOPLE: players, football clubs, influencers, creators, coaches, football communities",
  "CONTENT: TikTok/Reels/Shorts, player stories, challenges, behind-the-scenes, tournament episodes, interviews, highlights",
  "PHYSICAL: panna cages, inflatable structures, branded installations, mobile activations, tournament venues, urban locations",
  "DIGITAL: social reach, voting, challenges, leaderboards, QR codes, competitions",
  "COMMUNITY: clubs, young players, grassroots football, local Swiss communities",
].join("\n");

const SAFETY_RULE =
  "Never recommend anything illegal, dangerous, disruptive to public safety, or that would need permission you can't assume. Every public activation assumes appropriate permits, venue permission and safety planning were obtained — never suggest bypassing that.";

const TONE_RULE =
  "Avoid corporate sponsorship jargon: never use synergy, mutually beneficial, leverage, exciting opportunity, we would be delighted, highly engaged audience, or unique sponsorship opportunity unless there is truly no better word.";

function conceptSchema(): string {
  return [
    `{"brandTerritory": string (what this company is known for — one sharp line, not a list),`,
    `"currentCampaign": string (their real, current or recent campaign/slogan/positioning — cite what you found),`,
    `"audience": string (who they're actually trying to reach),`,
    `"marketingObjective": string (what they're likely trying to achieve right now),`,
    `"pannaConnection": string (one sentence: how their brand territory bridges to a Panna League asset),`,
    `"activationName": string (a short, punchy name for the ONE selected concept, e.g. "UNBOX THE PANNA"),`,
    `"activationDescription": string (2-4 sentences, visual, concrete — the reader should be able to picture it),`,
    `"whyTheyWouldCare": string (ties directly to their real objective/campaign — not generic),`,
    `"whyPeopleWouldCare": string (why the public would actually want to participate),`,
    `"contentPotential": string (what content this naturally generates),`,
    `"deliverables": string[] (3-5 short, concrete items, e.g. "1 branded cage activation", "3 short-form episodes"),`,
    `"executionDifficulty": "LOW" | "MEDIUM" | "HIGH",`,
    `"sponsorshipFit": 0-100, "guerrillaPotential": 0-100,`,
    `"sources": string[] (URLs backing brandTerritory/currentCampaign/audience/marketingObjective — never invent one)}`,
  ].join(" ");
}

function toConcept(raw: Record<string, unknown>): ActivationConcept {
  return {
    brandTerritory: str(raw, "brandTerritory"),
    currentCampaign: str(raw, "currentCampaign"),
    audience: str(raw, "audience"),
    marketingObjective: str(raw, "marketingObjective"),
    pannaConnection: str(raw, "pannaConnection"),
    activationName: str(raw, "activationName") || "Untitled concept",
    activationDescription: str(raw, "activationDescription"),
    whyTheyWouldCare: str(raw, "whyTheyWouldCare"),
    whyPeopleWouldCare: str(raw, "whyPeopleWouldCare"),
    contentPotential: str(raw, "contentPotential"),
    deliverables: strArray(raw, "deliverables"),
    executionDifficulty: difficulty(raw, "executionDifficulty"),
    sponsorshipFit: num(raw, "sponsorshipFit", 50),
    guerrillaPotential: num(raw, "guerrillaPotential", 50),
    sources: strArray(raw, "sources"),
    generatedAt: new Date().toISOString(),
  };
}

export async function generateActivation(sponsor: Sponsor): Promise<ActivationConcept> {
  const system = [
    "You are a sponsorship strategist, guerrilla marketing creative director, brand strategist, sports marketing expert",
    "and sales strategist working for Panna League Switzerland (live street-football, 1v1 panna challenges, tournaments).",
    "You are NOT a generic sponsorship-email generator. Never start from 'how do we convince this company to sponsor us'.",
    "Always start from: 'what does this company already care about, and how could Panna League create something they",
    "would genuinely want to OWN' — the result should feel like [their existing brand idea] + [Panna League] = a new",
    "marketing activation, never like [Panna League] + [their logo] = a sponsorship.",
    "Use the web_search tool to establish real facts: brand territory, current/recent campaigns and slogans, existing",
    "sports/youth/cultural sponsorships, target audience, and likely current marketing objective. Cite what you find —",
    "never invent a campaign, slogan or sponsorship.",
    `Panna League can offer:\n${PANNA_ASSETS}`,
    "Internally generate three distinct activation concepts and score each 0-100 on: brand fit, Panna fit, audience fit,",
    "originality, guerrilla potential, content potential, practicality, commercial potential. Pick the strongest one —",
    "report only that one, not all three.",
    "Before finalizing, test the selected idea: (1) Could you swap in a different sponsor's name and still use this exact",
    "idea? If yes, reject it and make it more specific to THIS company. (2) Does it use something the company already",
    "owns (a campaign, slogan, product, audience, sponsorship, brand behavior)? If not, ground it in something real.",
    "(3) Does Panna genuinely make the idea better, or is Panna just a logo placement? If just a logo, reject it.",
    "(4) Would people actually want to participate? (5) Would it create real social content? (6) Is it realistically",
    "executable? (7) Can the sponsor measure something concrete (participants, views, QR scans, mentions, trial)?",
    "Keep the internal three-concept comparison and the quality-test check brief (a short mental pass, not a written-out",
    "essay) — spend your effort on making the final JSON excellent, not on narrating your process.",
    SAFETY_RULE,
  ].join(" ");

  const user = [
    `Company: ${sponsor.name}, ${sponsor.category}, based in or active around ${sponsor.city}, Switzerland.`,
    "Build one activation concept for this company specifically. Return ONLY a JSON object (no markdown fences, no",
    "other text), shaped:",
    conceptSchema(),
  ].join(" ");

  // Streamed rather than a plain create(): the SDK refuses a non-streaming
  // call at this max_tokens size ("Streaming is required for operations
  // that may take longer than 10 minutes"), and this deep a research +
  // ideation pass genuinely can take a while.
  const response = await client()
    .messages.stream({
      model: model(),
      max_tokens: 26000,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
      system,
      messages: [{ role: "user", content: user }],
    })
    .finalMessage();

  const concept = toConcept(extractJsonObject(extractText(response)));
  if (!concept.activationName || concept.activationName === "Untitled concept" || !concept.activationDescription) {
    throw new Error(
      response.stop_reason === "max_tokens"
        ? "The research ran out of room before finishing — try again."
        : "Couldn't parse a usable activation concept from the AI response — try again."
    );
  }
  return concept;
}

export type ActivationDirection = "regenerate" | "guerrilla" | "cheaper" | "bigger" | "social" | "premium" | "sporting";

const DIRECTION_INSTRUCTION: Record<ActivationDirection, string> = {
  regenerate:
    "Generate a genuinely DIFFERENT concept from the current one, using the same real brand facts. Don't just reword — find a different angle on the same brand territory.",
  guerrilla:
    "Push the concept toward surprise, public interaction, an unexpected location, spectacle and social sharing — make it feel like something people stumble into and can't stop filming.",
  cheaper:
    "Redesign this as a low-budget MVP version: replace any large build/installation with the simplest version that still delivers the core moment (e.g. a large structure becomes printed modular panels or a simple panna field with one camera and one MC).",
  bigger:
    "Scale this up: a city activation, a multi-city tour, a tournament integration, a content campaign, or an influencer challenge — think bigger reach and bigger production, still grounded in the same brand facts.",
  social:
    "Turn this into a repeatable social content format — an episodic series (Episode 1, Episode 2, ...) rather than a single one-off moment.",
  premium:
    "Make this feel premium and high-production: elevate the execution, staging and exclusivity while staying true to the same brand insight.",
  sporting:
    "Make this feel more like a real sporting competition — leaning into performance, ranking, athletic stakes and Panna League's competitive format rather than pure spectacle.",
};

export async function transformActivation(
  sponsor: Sponsor,
  current: ActivationConcept,
  direction: ActivationDirection
): Promise<ActivationConcept> {
  const system = [
    "You are the same sponsorship strategist / guerrilla marketing creative director for Panna League Switzerland.",
    "You are reshaping an existing, already-researched activation concept — do not invent new brand facts, reuse the",
    "given brandTerritory, currentCampaign, audience, marketingObjective and sources exactly as given.",
    DIRECTION_INSTRUCTION[direction],
    "Re-apply the same discipline: it must stay specific to this company (not swappable to another sponsor), Panna",
    "must genuinely improve the idea (not just a logo), and it should be something people would want to participate in",
    "and share.",
    SAFETY_RULE,
    TONE_RULE,
  ].join(" ");

  const user = [
    `Company: ${sponsor.name} (${sponsor.category}, ${sponsor.city}).`,
    `Current concept: ${JSON.stringify({
      brandTerritory: current.brandTerritory,
      currentCampaign: current.currentCampaign,
      audience: current.audience,
      marketingObjective: current.marketingObjective,
      pannaConnection: current.pannaConnection,
      activationName: current.activationName,
      activationDescription: current.activationDescription,
    })}.`,
    "Return ONLY a JSON object (no markdown fences, no other text), shaped:",
    conceptSchema(),
    "Keep brandTerritory, currentCampaign, audience, marketingObjective and sources the same as the current concept",
    "unless the direction genuinely requires reframing marketingObjective.",
  ].join(" ");

  const response = await client().messages.create({
    model: model(),
    max_tokens: 6000,
    system,
    messages: [{ role: "user", content: user }],
  });

  const result = toConcept(extractJsonObject(extractText(response)));
  if (!result.activationName || result.activationName === "Untitled concept" || !result.activationDescription) {
    throw new Error("Couldn't parse a usable activation concept from the AI response — try again.");
  }
  // Preserve grounded research facts/sources exactly if the model omitted them.
  return {
    ...result,
    brandTerritory: result.brandTerritory || current.brandTerritory,
    currentCampaign: result.currentCampaign || current.currentCampaign,
    audience: result.audience || current.audience,
    marketingObjective: result.marketingObjective || current.marketingObjective,
    sources: result.sources.length ? result.sources : current.sources,
  };
}

export type EmailKind = "first" | "followup1" | "followup2" | "followup3";

const EMAIL_KIND_BRIEF: Record<EmailKind, string> = {
  first:
    "This is the FIRST email. Goal: get a reply, not close the sponsorship. Do not mention price, sponsorship tiers, logo placement, audience statistics, or attach a PDF description — none of that belongs in a first email.",
  followup1:
    "This is FOLLOW-UP 1 (no reply yet). Add value — mention that you've sketched the idea into a one-page concept, or offer something concrete, without being pushy.",
  followup2:
    "This is FOLLOW-UP 2 (still no reply). Create curiosity — hint that there's an even more interesting version of the idea, to re-open the conversation.",
  followup3:
    "This is FOLLOW-UP 3 (still no reply). Close politely — this is the last outreach on this thread, leave the door open, never sound like spam.",
};

export interface EmailDraft {
  subject: string;
  body: string;
}

export async function generateActivationEmail(sponsor: Sponsor, activation: ActivationConcept, kind: EmailKind): Promise<EmailDraft> {
  const system = [
    "You write short, human, confident, creative outreach emails for Panna League Switzerland — never generic",
    "sponsorship-request emails. The email SELLS THE IDEA, not the event. Never write 'we are looking for sponsors' —",
    "instead the tone is 'I have an idea specifically for [Company]'.",
    "Target 100-180 words for the body. Subject line should create curiosity (e.g. 'An idea for [Brand] × Panna',",
    "'Something I think [Brand] could own', 'Not a sponsorship proposal') — never lead with 'Sponsorship Opportunity'.",
    "Structure: (1) opening — mention ONE specific brand insight, 1-2 sentences max; (2) transition connecting that",
    "insight to Panna; (3) name the concept ('THE CONCEPT: [NAME]') and describe it visually in 2-4 sentences; (4) why",
    "it makes sense for them (audience/activation/content/objective, briefly); (5) a soft CTA asking for a short call",
    "or offering to send a one-pager — never 'can you sponsor us'.",
    TONE_RULE,
    EMAIL_KIND_BRIEF[kind],
  ].join(" ");

  const user = [
    `Company: ${sponsor.name}. Contact: ${sponsor.research.contactPerson.name} (${sponsor.research.contactPerson.role}).`,
    `Brand insight to use: ${activation.currentCampaign || activation.brandTerritory}.`,
    `Concept: ${activation.activationName} — ${activation.activationDescription}`,
    `Why it makes sense: ${activation.whyTheyWouldCare}`,
    'Return ONLY a JSON object (no markdown fences, no other text), shaped: {"subject": string, "body": string}.',
    "body should NOT include a greeting name placeholder — start directly with the opening line.",
  ].join(" ");

  const response = await client().messages.create({
    model: model(),
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: user }],
  });

  const raw = extractJsonObject(extractText(response));
  const body = str(raw, "body");
  if (!body) {
    throw new Error("Couldn't generate the email body — try again.");
  }
  return {
    subject: str(raw, "subject") || `An idea for ${sponsor.name} × Panna`,
    body,
  };
}
