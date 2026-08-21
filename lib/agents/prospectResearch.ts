import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Real prospecting — used by /api/ai/run-team. Unlike the outreach/
// classification agents in lib/ai/providers/claude.ts, this gives Claude
// the built-in web_search tool and asks it to find REAL people and
// organizations, citing sources. Nothing here is invented: the model is
// explicitly told to only report a contact detail it actually found
// published, and every candidate carries the source URLs it came from so
// a human can verify before ever contacting them.

export function isProspectingConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SWISS_CITIES = ["Lausanne", "Geneva", "Yverdon", "Montreux", "Vevey", "Neuchâtel", "Fribourg", "Bern", "Zurich", "Basel"];

function client(): Anthropic {
  return new Anthropic();
}

function model(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

function extractJsonArray(text: string): unknown[] {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function research(system: string, user: string): Promise<unknown[]> {
  const response = await client().messages.create({
    model: model(),
    max_tokens: 4000,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
    system,
    messages: [{ role: "user", content: user }],
  });
  return extractJsonArray(extractText(response));
}

export interface PlayerCandidate {
  name: string;
  age: number;
  city: string;
  club: string | null;
  position: string;
  playerScore: number;
  scoreBreakdown: {
    technical: number;
    experience: number;
    streetRelevance: number;
    socialAudience: number;
    localRelevance: number;
    competitivePotential: number;
  };
  socialAudience: number;
  contactEmail: string;
  aiWhy: string;
  sources: string[];
}

export async function researchPlayers(existingNames: string[], count = 3): Promise<PlayerCandidate[]> {
  const system = [
    "You are the Player Recruiter agent for Panna League Switzerland, a real street-football (panna / freestyle football)",
    "league being organized in Switzerland. Use the web_search tool to find REAL individual people who would be strong",
    "candidates to recruit — Swiss freestyle footballers, panna/street-football competitors, or content creators with a",
    "genuine, public street-football presence based in or connected to Switzerland (Instagram/TikTok/YouTube, event",
    "results, club rosters, news coverage, etc).",
    "Only include a person you can point to real search results for — never invent a name.",
    `Do not include anyone already tracked: ${existingNames.length ? existingNames.join(", ") : "(none yet)"}.`,
    "Only include contactEmail if you found one publicly listed (e.g. a business-inquiry email on their own site or",
    "profile) — otherwise return an empty string. Never guess or fabricate an email address.",
  ].join(" ");

  const user = [
    `Find up to ${count} real candidates. Return ONLY a JSON array (no markdown fences, no other text), each item shaped:`,
    `{"name": string, "age": number, "city": one of [${SWISS_CITIES.join(", ")}] (closest match),`,
    `"club": string or null, "position": one of ["Attacker","Playmaker","Freestyler","Defender","All-Round"],`,
    `"playerScore": 0-100, "scoreBreakdown": {"technical":0-100,"experience":0-100,"streetRelevance":0-100,"socialAudience":0-100,"localRelevance":0-100,"competitivePotential":0-100},`,
    `"socialAudience": number (approx follower count, 0 if unknown), "contactEmail": string (may be ""),`,
    `"aiWhy": string (2-3 sentences citing what you found), "sources": string[] (the URLs you found this from)}`,
    "If you cannot verify any real candidates, return an empty array [].",
  ].join(" ");

  const raw = await research(system, user);
  return raw.filter(isRecord).map((r) => ({
    name: str(r, "name"),
    age: num(r, "age", 22),
    city: str(r, "city") || "Zurich",
    club: str(r, "club") || null,
    position: str(r, "position") || "All-Round",
    playerScore: clamp(num(r, "playerScore", 50)),
    scoreBreakdown: {
      technical: clamp(num(get(r, "scoreBreakdown"), "technical", 50)),
      experience: clamp(num(get(r, "scoreBreakdown"), "experience", 50)),
      streetRelevance: clamp(num(get(r, "scoreBreakdown"), "streetRelevance", 50)),
      socialAudience: clamp(num(get(r, "scoreBreakdown"), "socialAudience", 50)),
      localRelevance: clamp(num(get(r, "scoreBreakdown"), "localRelevance", 50)),
      competitivePotential: clamp(num(get(r, "scoreBreakdown"), "competitivePotential", 50)),
    },
    socialAudience: num(r, "socialAudience", 0),
    contactEmail: str(r, "contactEmail"),
    aiWhy: str(r, "aiWhy") || "Identified via AI web research.",
    sources: strArray(r, "sources"),
  })).filter((c) => c.name);
}

export interface ClubCandidate {
  name: string;
  city: string;
  contactName: string;
  contactEmail: string;
  website: string;
  potential: "LOW" | "MEDIUM" | "HIGH";
  aiNote: string;
  sources: string[];
}

export async function researchClubs(existingNames: string[], count = 3): Promise<ClubCandidate[]> {
  const system = [
    "You are the Club Finder agent for Panna League Switzerland. Use the web_search tool to find REAL Swiss football clubs",
    "— official amateur, regional or youth clubs, verifiable via their own website or a Swiss football association listing —",
    "that would be good candidates to approach for player recruitment. Prefer clubs with an active youth/U21 squad.",
    `Do not include any club already tracked: ${existingNames.length ? existingNames.join(", ") : "(none yet)"}.`,
    "Only include contactName/contactEmail if you found them publicly listed on the club's own site (e.g. a president,",
    "coach, or general club email) — otherwise use contactName \"Club administration\" and contactEmail \"\". Never invent",
    "a contact detail. Only include website if you found the club's real, verifiable official site.",
  ].join(" ");

  const user = [
    `Find up to ${count} real clubs. Return ONLY a JSON array (no markdown fences, no other text), each item shaped:`,
    `{"name": string, "city": one of [${SWISS_CITIES.join(", ")}] (closest match), "contactName": string,`,
    `"contactEmail": string (may be ""), "website": string (may be ""), "potential": one of ["LOW","MEDIUM","HIGH"],`,
    `"aiNote": string (why this club, citing what you found), "sources": string[] (the URLs you found this from)}`,
    "If you cannot verify any real clubs, return an empty array [].",
  ].join(" ");

  const raw = await research(system, user);
  return raw.filter(isRecord).map((r) => ({
    name: str(r, "name"),
    city: str(r, "city") || "Zurich",
    contactName: str(r, "contactName") || "Club administration",
    contactEmail: str(r, "contactEmail"),
    website: str(r, "website"),
    potential: (["LOW", "MEDIUM", "HIGH"].includes(str(r, "potential")) ? str(r, "potential") : "MEDIUM") as ClubCandidate["potential"],
    aiNote: str(r, "aiNote") || "Identified via AI web research.",
    sources: strArray(r, "sources"),
  })).filter((c) => c.name);
}

export interface SponsorCandidate {
  name: string;
  category: string;
  city: string;
  potentialValue: number;
  fit: {
    overall: number;
    audienceFit: number;
    activationFit: number;
    swissPresence: number;
    brandPositioning: number;
    budgetPotential: number;
  };
  fitWhy: string;
  research: {
    companyDescription: string;
    swissPresence: string;
    targetAudience: string;
    recentMarketingActivity: string;
    existingSponsorships: string;
    reasonToSponsor: string;
    activationOpportunities: string[];
    suggestedPackage: string;
    contactPerson: { name: string; role: string; email: string };
  };
  aiRecommendation: string;
  sources: string[];
}

const SPONSOR_CATEGORIES = [
  "Sportswear", "Sporting Goods", "Financial Services", "Insurance", "Telecommunications",
  "Automotive", "Food & Beverage", "Technology", "Mobility", "Retail", "Energy", "Youth Brands",
];

export async function researchSponsors(existingNames: string[], count = 3): Promise<SponsorCandidate[]> {
  const system = [
    "You are the Sponsor Finder agent for Panna League Switzerland. Use the web_search tool to find REAL companies active",
    "in or selling into Switzerland that would be strong sponsorship prospects for a street-football / youth-culture",
    "brand — look for real, recent evidence (news, marketing campaigns, existing sponsorships) that shows genuine current",
    "relevance, not just a guess based on industry.",
    `Do not include any company already tracked: ${existingNames.length ? existingNames.join(", ") : "(none yet)"}.`,
    "Only include a contactPerson name/email if you found one publicly listed (e.g. a marketing contact on their site or",
    "a press page) — otherwise use contactPerson {\"name\":\"Marketing team\",\"role\":\"Marketing\",\"email\":\"\"}. Never",
    "invent a contact detail.",
  ].join(" ");

  const user = [
    `Find up to ${count} real companies. Return ONLY a JSON array (no markdown fences, no other text), each item shaped:`,
    `{"name": string, "category": one of [${SPONSOR_CATEGORIES.join(", ")}],`,
    `"city": one of [${SWISS_CITIES.join(", ")}] (closest match to their Swiss HQ/office), "potentialValue": number (CHF, realistic sponsorship budget estimate, 3000-30000),`,
    `"fit": {"overall":0-100,"audienceFit":0-100,"activationFit":0-100,"swissPresence":0-100,"brandPositioning":0-100,"budgetPotential":0-100},`,
    `"fitWhy": string, "research": {"companyDescription": string, "swissPresence": string, "targetAudience": string,`,
    `"recentMarketingActivity": string (must cite something you actually found), "existingSponsorships": string,`,
    `"reasonToSponsor": string, "activationOpportunities": string[3], "suggestedPackage": string,`,
    `"contactPerson": {"name": string, "role": string, "email": string (may be "")}},`,
    `"aiRecommendation": string (one sentence), "sources": string[] (the URLs you found this from)}`,
    "If you cannot verify any real companies, return an empty array [].",
  ].join(" ");

  const raw = await research(system, user);
  return raw.filter(isRecord).map((r) => {
    const researchBlock = get(r, "research");
    const contact = get(researchBlock, "contactPerson");
    return {
      name: str(r, "name"),
      category: SPONSOR_CATEGORIES.includes(str(r, "category")) ? str(r, "category") : "Youth Brands",
      city: str(r, "city") || "Zurich",
      potentialValue: num(r, "potentialValue", 5000),
      fit: {
        overall: clamp(num(get(r, "fit"), "overall", 50)),
        audienceFit: clamp(num(get(r, "fit"), "audienceFit", 50)),
        activationFit: clamp(num(get(r, "fit"), "activationFit", 50)),
        swissPresence: clamp(num(get(r, "fit"), "swissPresence", 50)),
        brandPositioning: clamp(num(get(r, "fit"), "brandPositioning", 50)),
        budgetPotential: clamp(num(get(r, "fit"), "budgetPotential", 50)),
      },
      fitWhy: str(r, "fitWhy") || "Identified via AI web research.",
      research: {
        companyDescription: str(researchBlock, "companyDescription"),
        swissPresence: str(researchBlock, "swissPresence"),
        targetAudience: str(researchBlock, "targetAudience"),
        recentMarketingActivity: str(researchBlock, "recentMarketingActivity"),
        existingSponsorships: str(researchBlock, "existingSponsorships"),
        reasonToSponsor: str(researchBlock, "reasonToSponsor"),
        activationOpportunities: strArray(researchBlock, "activationOpportunities"),
        suggestedPackage: str(researchBlock, "suggestedPackage") || "TBD",
        contactPerson: {
          name: str(contact, "name") || "Marketing team",
          role: str(contact, "role") || "Marketing",
          email: str(contact, "email"),
        },
      },
      aiRecommendation: str(r, "aiRecommendation") || "Identified via AI web research — review before contacting.",
      sources: strArray(r, "sources"),
    };
  }).filter((c) => c.name);
}

export interface SponsorProfileUpdate {
  companyDescription: string;
  swissPresence: string;
  targetAudience: string;
  recentMarketingActivity: string;
  existingSponsorships: string;
  reasonToSponsor: string;
  activationOpportunities: string[];
  suggestedPackage: string;
  aiRecommendation: string;
  sources: string[];
}

// The Researcher agent — a deep-dive on ONE already-tracked sponsor
// (unlike researchSponsors above, which discovers new ones). Used by the
// "Research this company" button on the sponsor detail page.
export async function researchSponsorProfile(sponsor: { name: string; city: string; category: string }): Promise<SponsorProfileUpdate> {
  const system = [
    "You are the Researcher agent for Panna League Switzerland. Use the web_search tool to build a deep, genuinely",
    `researched company brief for ${sponsor.name} (${sponsor.category}, based in or active around ${sponsor.city}, Switzerland).`,
    "Search their official site, recent news, marketing campaigns, sponsorships and anything showing real current",
    "relevance to a street-football / youth-culture sponsorship pitch. Be specific and cite what you find — never",
    "invent a fact you can't point to a source for. If you can't verify something, say so plainly rather than guessing.",
  ].join(" ");

  const user = [
    "Return ONLY a JSON object (no markdown fences, no other text), shaped:",
    `{"companyDescription": string, "swissPresence": string, "targetAudience": string,`,
    `"recentMarketingActivity": string (must cite something you actually found), "existingSponsorships": string,`,
    `"reasonToSponsor": string, "activationOpportunities": string[3], "suggestedPackage": string,`,
    `"aiRecommendation": string (one sentence), "sources": string[] (the URLs you found this from)}`,
  ].join(" ");

  const response = await client().messages.create({
    model: model(),
    max_tokens: 14000,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
    system,
    messages: [{ role: "user", content: user }],
  });

  const raw = extractJsonObject(extractText(response));
  return {
    companyDescription: str(raw, "companyDescription"),
    swissPresence: str(raw, "swissPresence"),
    targetAudience: str(raw, "targetAudience"),
    recentMarketingActivity: str(raw, "recentMarketingActivity"),
    existingSponsorships: str(raw, "existingSponsorships"),
    reasonToSponsor: str(raw, "reasonToSponsor"),
    activationOpportunities: strArray(raw, "activationOpportunities"),
    suggestedPackage: str(raw, "suggestedPackage") || "TBD",
    aiRecommendation: str(raw, "aiRecommendation") || "Researched via AI web search — review before contacting.",
    sources: strArray(raw, "sources"),
  };
}

// ── small untyped-JSON helpers ──────────────────────────────

function extractJsonObject(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return {};
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return {};
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function get(v: unknown, key: string): unknown {
  return isRecord(v) ? v[key] : undefined;
}
function str(v: unknown, key: string): string {
  const val = get(v, key);
  return typeof val === "string" ? val.trim() : "";
}
function num(v: unknown, key: string, fallback: number): number {
  const val = get(v, key);
  return typeof val === "number" && Number.isFinite(val) ? val : fallback;
}
function strArray(v: unknown, key: string): string[] {
  const val = get(v, key);
  return Array.isArray(val) ? val.filter((x): x is string => typeof x === "string") : [];
}
function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
