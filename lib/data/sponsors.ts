import { Sponsor, SponsorCategory, SponsorStage } from "@/types";
import { makeRng, SWISS_CITIES } from "./seed";

// NOTE: Company names below are realistic Swiss-market brand examples used
// purely as DEMO DATA to illustrate the workflow. Contact details are
// placeholders (example.ch) — no real personal data is used or implied.
const COMPANIES: { name: string; category: SponsorCategory }[] = [
  { name: "Decathlon Switzerland", category: "Sporting Goods" },
  { name: "On Running", category: "Sportswear" },
  { name: "Puma Schweiz", category: "Sportswear" },
  { name: "Ochsner Sport", category: "Sporting Goods" },
  { name: "Swisscom", category: "Telecommunications" },
  { name: "Sunrise Sunlend", category: "Telecommunications" },
  { name: "Salt Mobile", category: "Telecommunications" },
  { name: "UBS", category: "Financial Services" },
  { name: "PostFinance", category: "Financial Services" },
  { name: "Zurich Insurance", category: "Insurance" },
  { name: "Baloise", category: "Insurance" },
  { name: "AXA Switzerland", category: "Insurance" },
  { name: "Red Bull Switzerland", category: "Youth Brands" },
  { name: "Monster Energy CH", category: "Youth Brands" },
  { name: "Migros", category: "Retail" },
  { name: "Coop", category: "Retail" },
  { name: "Manor", category: "Retail" },
  { name: "AMAG Group", category: "Automotive" },
  { name: "SEAT Switzerland", category: "Automotive" },
  { name: "Škoda Switzerland", category: "Automotive" },
  { name: "Mobility Carsharing", category: "Mobility" },
  { name: "SBB CFF FFS", category: "Mobility" },
  { name: "PubliBike", category: "Mobility" },
  { name: "Feldschlösschen", category: "Food & Beverage" },
  { name: "Rivella", category: "Food & Beverage" },
  { name: "Red Bull Racing Energy", category: "Food & Beverage" },
  { name: "Emmi", category: "Food & Beverage" },
  { name: "Logitech", category: "Technology" },
  { name: "Samsung Switzerland", category: "Technology" },
  { name: "Sonova Group", category: "Technology" },
  { name: "Alpiq", category: "Energy" },
  { name: "BKW Energie", category: "Energy" },
  { name: "Groupe E", category: "Energy" },
  { name: "Adidas Switzerland", category: "Sportswear" },
  { name: "Nike Switzerland", category: "Sportswear" },
  { name: "Intersport Schweiz", category: "Sporting Goods" },
  { name: "Raiffeisen", category: "Financial Services" },
  { name: "Julius Bär", category: "Financial Services" },
  { name: "Helvetia Insurance", category: "Insurance" },
  { name: "Generali Switzerland", category: "Insurance" },
  { name: "Volkswagen Switzerland", category: "Automotive" },
  { name: "BMW Switzerland", category: "Automotive" },
  { name: "Denner", category: "Retail" },
  { name: "Galaxus", category: "Retail" },
  { name: "Prime Video CH Sports", category: "Technology" },
  { name: "Blick Sport", category: "Technology" },
  { name: "Yallo", category: "Telecommunications" },
  { name: "Bell Food Group", category: "Food & Beverage" },
  { name: "Ricola", category: "Food & Beverage" },
  { name: "Lidl Schweiz", category: "Retail" },
  { name: "Volt Energy Drinks", category: "Youth Brands" },
];

const STAGE_FLOW: SponsorStage[] = [
  "PROSPECT", "RESEARCH", "CONTACTED", "REPLIED", "INTERESTED",
  "MEETING", "PROPOSAL", "NEGOTIATION", "WON", "LOST",
];

const CONTACT_FIRST = ["Sophie", "Marc", "Léa", "Daniel", "Anja", "Jonas", "Fabienne", "Simon", "Céline", "Reto", "Nadja", "Yves"];
const CONTACT_LAST = ["Brunner", "Roulet", "Frei", "Iten", "Steiner", "Marchand", "Zimmermann", "Girod", "Baumgartner", "Léger"];
const ROLES = ["Marketing Director", "Head of Brand Partnerships", "Sponsorship Manager", "CMO", "Brand Manager", "Head of Marketing Switzerland"];

const ACTIVATIONS = [
  "On-site branded panna cage",
  "Product sampling at event entrance",
  "Co-branded social media takeover",
  "Athlete/player content collaboration",
  "Halftime activation zone",
  "Branded MVP award ceremony",
  "Livestream jersey placement",
  "Pop-up retail booth",
  "Influencer meet & greet",
  "Branded highlight reel series",
];

const PACKAGES = [
  "Title Sponsor — CHF 15,000+",
  "Co-Sponsor — CHF 8,000",
  "Activation Partner — CHF 5,000",
  "Digital Content Partner — CHF 6,500",
  "Category Exclusive Partner — CHF 12,000",
];

function reasonFor(name: string, category: SponsorCategory): string {
  const templates: Record<SponsorCategory, string> = {
    Sportswear: `${name} targets performance-driven, style-conscious youth — Panna League's street-football format and short-form content directly extend that positioning into a live, physical activation.`,
    "Sporting Goods": `${name} sells directly to the exact demographic Panna League draws — a live, high-energy football event is a natural retail and community activation surface.`,
    "Financial Services": `${name} is investing in youth and community relevance — sponsoring a modern, digitally-native football format signals cultural relevance beyond traditional banking sponsorships.`,
    Insurance: `${name} is expanding into lifestyle and youth-oriented sponsorships to shift brand perception from purely corporate to community-connected.`,
    Telecommunications: `${name} needs always-on content and live-streaming partners — Panna League's digital-first format is a ready-made 5G/streaming showcase.`,
    Automotive: `${name} is targeting a younger buyer profile and needs cultural touchpoints beyond traditional motorsport sponsorship.`,
    "Food & Beverage": `${name} thrives on high-energy, youth-culture moments — Panna League's live crowd and short-form content are a strong sampling and brand-awareness channel.`,
    Technology: `${name} is investing in youth engagement and content-rich sponsorships that generate authentic, shareable moments.`,
    Mobility: `${name} benefits from association with urban, community-first events that align with sustainable and youth-oriented mobility messaging.`,
    Retail: `${name} is looking for local community relevance and in-store/digital cross-promotion opportunities tied to youth culture.`,
    Energy: `${name} is building a modern, community-facing brand image alongside its core utility positioning.`,
    "Youth Brands": `${name}'s entire brand is built around youth culture and energy — Panna League is a near-perfect audience and content match.`,
  };
  return templates[category];
}

function marketingActivityFor(rng: ReturnType<typeof makeRng>): string {
  const options = [
    "Recently launched a youth sports sponsorship initiative across German-speaking Switzerland.",
    "Ran a national social-media campaign targeting Gen Z audiences last quarter.",
    "Sponsors a regional football club's youth academy.",
    "Increased digital ad spend on short-form video platforms by double digits this year.",
    "Recently rebranded with a more youth-focused visual identity.",
    "Active in grassroots sports sponsorship across French-speaking Switzerland.",
    "Launched a community-focused CSR campaign centered on urban youth.",
    "Currently sponsors a Swiss esports or streaming property.",
  ];
  return rng.pick(options);
}

export function generateSponsors(count = 50): Sponsor[] {
  const rng = makeRng(4242);
  const sponsors: Sponsor[] = [];
  const pool = [...COMPANIES];

  for (let i = 0; i < count; i++) {
    const base = pool[i % pool.length];
    const name = i < pool.length ? base.name : `${base.name} (${rng.pick(SWISS_CITIES)})`;
    const category = base.category;

    const audienceFit = rng.int(55, 99);
    const activationFit = rng.int(50, 98);
    const swissPresence = rng.int(60, 99);
    const brandPositioning = rng.int(50, 97);
    const budgetPotential = rng.int(45, 96);
    const overall = Math.round(
      audienceFit * 0.28 +
        activationFit * 0.22 +
        swissPresence * 0.18 +
        brandPositioning * 0.17 +
        budgetPotential * 0.15
    );

    const stageIdx = Math.min(
      STAGE_FLOW.length - 2, // reserve WON/LOST for weighted pick below
      Math.floor(Math.pow(rng.next(), 1.7) * (STAGE_FLOW.length - 2))
    );
    let stage = STAGE_FLOW[stageIdx];
    if (rng.bool(0.08)) stage = "WON";
    if (stage !== "WON" && rng.bool(0.06)) stage = "LOST";

    const potentialValue = Math.round((5000 + rng.int(0, 45000)) / 500) * 500;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const contactName = `${rng.pick(CONTACT_FIRST)} ${rng.pick(CONTACT_LAST)}`;

    const nextActionByStage: Record<SponsorStage, string> = {
      PROSPECT: "Assign to Researcher for company deep-dive.",
      RESEARCH: "Identify contact person and prepare outreach.",
      CONTACTED: "Await reply — schedule follow-up in 5 days.",
      REPLIED: "Classify reply and determine next step.",
      INTERESTED: "Send sponsorship deck and propose call.",
      MEETING: "Prepare meeting brief and tailored proposal.",
      PROPOSAL: "Follow up on sponsorship proposal.",
      NEGOTIATION: "Finalize package terms and contract.",
      WON: "Kick off activation planning.",
      LOST: "Log reason and revisit next season.",
    };

    sponsors.push({
      id: `sponsor-${i + 1}`,
      name,
      category,
      city: rng.pick([...SWISS_CITIES]),
      fit: { overall, audienceFit, activationFit, swissPresence, brandPositioning, budgetPotential },
      fitWhy: reasonFor(name, category),
      potentialValue,
      stage,
      lastActivity:
        stage === "PROSPECT"
          ? "Identified by Sponsor Finder"
          : stage === "RESEARCH"
          ? "Company research completed"
          : stage === "CONTACTED"
          ? "Outreach message sent"
          : stage === "REPLIED"
          ? "Prospect replied to outreach"
          : stage === "INTERESTED"
          ? "Prospect expressed interest"
          : stage === "MEETING"
          ? "Meeting scheduled"
          : stage === "PROPOSAL"
          ? "Sponsorship proposal sent"
          : stage === "NEGOTIATION"
          ? "Negotiating package terms"
          : stage === "WON"
          ? "Signed as confirmed sponsor"
          : "Marked as not pursuing this cycle",
      lastActivityDate: rng.daysAgoISO(40, 0),
      nextAction: nextActionByStage[stage],
      research: {
        companyDescription: `${name} is a ${category.toLowerCase()} company with an established presence across Switzerland, serving a broad consumer and B2B audience.`,
        industry: category,
        swissPresence: `${rng.int(8, 200)}+ points of presence / retail or service locations across Switzerland.`,
        targetAudience: "Young adults, sports fans, and urban consumers aged 16–35.",
        recentMarketingActivity: marketingActivityFor(rng),
        existingSponsorships: rng.pick([
          "Sponsors a Swiss Super League club's youth program.",
          "No current grassroots football sponsorships identified.",
          "Active sponsor of a regional running or cycling event.",
          "Recently ended a multi-year esports sponsorship.",
          "Sponsors a national youth sports federation.",
        ]),
        reasonToSponsor: reasonFor(name, category),
        activationOpportunities: rng.pickMultiple(ACTIVATIONS, 3),
        suggestedPackage: rng.pick(PACKAGES),
        contactPerson: {
          name: contactName,
          role: rng.pick(ROLES),
          email: `marketing@${slug || "company"}.example.ch`,
        },
      },
      aiRecommendation:
        overall >= 88
          ? "High-priority commercial prospect."
          : overall >= 72
          ? "Strong commercial fit — prioritize outreach."
          : overall >= 55
          ? "Moderate fit — pursue after top-tier prospects."
          : "Low priority — revisit if budget allows.",
    });
  }

  return sponsors.sort((a, b) => b.fit.overall - a.fit.overall);
}

export const sponsors = generateSponsors(50);
