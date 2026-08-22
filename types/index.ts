// ─────────────────────────────────────────────────────────────
// PANNA LEAGUE AI COMMAND CENTER — Core domain types
// ─────────────────────────────────────────────────────────────
// These types describe the shared shape of the data model used
// across mock data, AI agents, and UI. When real integrations
// (CRM, prospect DB, calendar, etc.) are connected later, the
// adapters in /lib/integrations should map external data into
// these same shapes so the rest of the app never has to change.

export type SwissCity =
  | "Lausanne"
  | "Geneva"
  | "Yverdon"
  | "Montreux"
  | "Vevey"
  | "Neuchâtel"
  | "Fribourg"
  | "Bern"
  | "Zurich"
  | "Basel";

// ── Players ─────────────────────────────────────────────────

export type PlayerStatus =
  | "IDENTIFIED"
  | "CONTACTED"
  | "INTERESTED"
  | "CONFIRMED"
  | "DECLINED";

export interface Player {
  id: string;
  name: string;
  age: number;
  city: SwissCity;
  club: string | null;
  position: "Attacker" | "Playmaker" | "Freestyler" | "Defender" | "All-Round" | "Unknown";
  playerScore: number; // 0-100
  scoreBreakdown: {
    technical: number;
    experience: number;
    streetRelevance: number;
    socialAudience: number;
    localRelevance: number;
    competitivePotential: number;
  };
  socialAudience: number;
  status: PlayerStatus;
  lastContact: string | null; // ISO date
  aiRecommendation: string;
  aiWhy: string;
  avatarSeed: string;
  // Public signup fields — populated only for real player-form/signal
  // submissions from the marketing site, null for AI-prospected or
  // manually-added players. Never fabricated when unknown.
  ageGroup: string | null; // raw self-reported bracket (e.g. "18-24") — exact age isn't collected on every form
  contactEmail: string | null;
  contactPhone: string | null;
  instagram: string | null;
  tiktok: string | null;
  signupNote: string | null; // "why should I be selected" free text
  signupSource: string | null; // which public form/channel, e.g. "site-register", "signal:lausanne01"
  positionNote: string | null; // raw free-text position when it didn't cleanly map to the enum above
  nominatedBy: string | null; // "Name (contact)" of the friend who nominated this player, when applicable
}

// ── Contacts ────────────────────────────────────────────────
// Up to 3 real people per club/sponsor. Exactly one is primary — the
// default recipient for outreach and the calendar-invite attendee. The
// legacy single contactName/contactEmail (Club) and
// research.contactPerson (Sponsor) fields always mirror the primary
// contact, so everywhere else in the app that reads them keeps working
// unchanged; contacts is the new source of truth going forward.

export interface Contact {
  name: string;
  email: string;
  role?: string;
  isPrimary: boolean;
}

// ── Clubs ───────────────────────────────────────────────────

export type ClubStatus =
  | "IDENTIFIED"
  | "CONTACTED"
  | "INTERESTED"
  | "PLAYERS_PROPOSED"
  | "CONFIRMED"
  | "PARTNER";

export type ClubPotential = "LOW" | "MEDIUM" | "HIGH";

export interface Club {
  id: string;
  name: string;
  city: SwissCity;
  contactName: string;
  contactEmail: string;
  // Up to 3 real contacts — see the Contact type above. Empty for clubs
  // added before this feature; contactName/contactEmail still work as
  // the single fallback contact in that case.
  contacts: Contact[];
  website: string;
  playersIdentified: number;
  status: ClubStatus;
  potential: ClubPotential;
  lastContact: string | null;
  engagementType: "PLAYER_RECRUITMENT" | "COMMERCIAL_PARTNERSHIP" | "BOTH";
  aiNote: string;
  // Public signup fields — populated only for real partnership-form
  // submissions from the marketing site, null otherwise.
  contactPhone: string | null;
  organisationType: string | null;
  instagram: string | null;
  tiktok: string | null;
  inquiryMessage: string | null;
  signupSource: string | null;
}

// ── Sponsors ────────────────────────────────────────────────

export type SponsorStage =
  | "PROSPECT"
  | "RESEARCH"
  | "CONTACTED"
  | "REPLIED"
  | "INTERESTED"
  | "MEETING"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type SponsorCategory =
  | "Sportswear"
  | "Sporting Goods"
  | "Financial Services"
  | "Insurance"
  | "Telecommunications"
  | "Automotive"
  | "Food & Beverage"
  | "Technology"
  | "Mobility"
  | "Retail"
  | "Energy"
  | "Youth Brands";

export interface SponsorFitScore {
  overall: number;
  audienceFit: number;
  activationFit: number;
  swissPresence: number;
  brandPositioning: number;
  budgetPotential: number;
}

export interface SponsorResearch {
  companyDescription: string;
  industry: SponsorCategory;
  swissPresence: string;
  targetAudience: string;
  recentMarketingActivity: string;
  existingSponsorships: string;
  reasonToSponsor: string;
  activationOpportunities: string[];
  suggestedPackage: string;
  contactPerson: {
    name: string;
    role: string;
    email: string;
  };
}

export interface Sponsor {
  id: string;
  name: string;
  category: SponsorCategory;
  city: SwissCity;
  fit: SponsorFitScore;
  fitWhy: string;
  // Up to 3 real contacts — see the Contact type above. Empty for
  // sponsors added before this feature; research.contactPerson still
  // works as the single fallback contact in that case.
  contacts: Contact[];
  potentialValue: number; // CHF
  stage: SponsorStage;
  lastActivity: string;
  lastActivityDate: string;
  nextAction: string;
  research: SponsorResearch;
  aiRecommendation: string;
  activation: ActivationConcept | null;
  // What was actually agreed with this sponsor, in the organizer's own
  // words — free text, never inferred from the generated proposal tier
  // (a real negotiation can drift from it). Feeds the "suggest content
  // ideas from this deal" AI action. Null until filled in.
  dealTerms: string | null;
}

// ── AI Activation Lab ────────────────────────────────────────
// A "brand territory → Panna asset → activation idea" concept, not a
// generic sponsorship pitch. Doubles as the internal "Sponsor
// Intelligence Card" and the sponsor-detail-page display data.

export type ActivationDifficulty = "LOW" | "MEDIUM" | "HIGH";

export interface ActivationConcept {
  brandTerritory: string;
  currentCampaign: string;
  audience: string;
  marketingObjective: string;
  pannaConnection: string;
  activationName: string;
  activationDescription: string;
  whyTheyWouldCare: string;
  whyPeopleWouldCare: string;
  contentPotential: string;
  deliverables: string[];
  executionDifficulty: ActivationDifficulty;
  sponsorshipFit: number; // 0-100
  guerrillaPotential: number; // 0-100
  sources: string[];
  generatedAt: string; // ISO timestamp
}

// ── Sponsorship opportunity / proposal ─────────────────────

export interface SponsorshipTier {
  id: string;
  name: string; // e.g. "Title Sponsor"
  tagline: string;
  benefits: string[];
  estimatedValue: number;
}

export interface SponsorOpportunity {
  id: string;
  sponsorId: string;
  tier: SponsorshipTier;
  status: "DRAFT" | "SENT" | "UNDER_REVIEW" | "ACCEPTED" | "DECLINED";
  createdAt: string;
}

// ── Conversations ───────────────────────────────────────────

export type ConversationCategory = "PLAYER" | "CLUB" | "SPONSOR" | "MEDIA";

export type ConversationClassification =
  | "AWAITING_REPLY"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "NEEDS_INFORMATION"
  | "SEND_PROPOSAL"
  | "CALL_REQUEST"
  | "OBJECTION"
  | "FOLLOW_UP_LATER"
  | "WRONG_PERSON";

export interface Message {
  id: string;
  from: "THEM" | "AI" | "ORGANIZER";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  contactName: string;
  // Real inbound sender address when known (set by the inbox poller) —
  // needed to actually send a reply back. Null for outbound-only threads.
  contactEmail: string | null;
  organization: string;
  category: ConversationCategory;
  relatedId: string; // player/club/sponsor id
  messages: Message[];
  lastMessagePreview: string;
  lastMessageAt: string;
  classification: ConversationClassification;
  recommendedAction: string;
  aiDraftResponse: string;
  unread: boolean;
}

// ── Meetings / bookings ─────────────────────────────────────

export type MeetingStatus = "PROPOSED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type MeetingBookedBy = "ORGANIZER" | "CONTACT";

export interface Meeting {
  id: string;
  withName: string;
  organization: string;
  category: ConversationCategory;
  relatedId: string;
  date: string; // ISO date
  time: string; // HH:mm
  durationMinutes: number;
  status: MeetingStatus;
  agenda: string;
  // Who actually booked it: the organizer from a sponsor/club detail page,
  // or the contact themselves via their own public booking link.
  bookedBy: MeetingBookedBy;
}

// ── Content ─────────────────────────────────────────────────

export type ContentPlatform = "Instagram" | "TikTok" | "YouTube" | "LinkedIn";

export type ContentStatus = "IDEA" | "READY" | "SCHEDULED" | "PUBLISHED";

export interface ContentOpportunity {
  id: string;
  title: string;
  platform: ContentPlatform;
  trigger: string; // e.g. "Player wins", "Sponsor activation"
  hook: string;
  caption: string;
  cta: string;
  suggestedFootage: string;
  sponsorIntegration: string | null;
  status: ContentStatus;
  scheduledDate: string | null;
  performance: {
    views: number;
    engagementRate: number;
  } | null;
}

// ── AI Agents ───────────────────────────────────────────────

export type AgentId =
  | "player-recruiter"
  | "club-finder"
  | "sponsor-finder"
  | "sponsor-researcher"
  | "outreach"
  | "conversation-manager"
  | "booking"
  | "content";

export type AgentStatus = "ACTIVE" | "IDLE" | "WAITING" | "RUNNING";

export interface AgentTask {
  id: string;
  agentId: AgentId;
  summary: string;
  timestamp: string;
  reasoning?: string;
}

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  status: AgentStatus;
  headline: string; // e.g. "27 prospects analyzed"
  tasksCompleted: number | null; // null = not tracked yet (no real event log for this agent)
  metricLabel: string;
  metricValue: string;
  averageScore?: number;
  potentialPipeline?: number;
  recentActivity: AgentTask[];
  reasoningExamples: string[];
  color: string; // tailwind color token accent
}

// ── Event ───────────────────────────────────────────────────

export interface EventChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export type EventStatus = "PRE_LAUNCH" | "ANNOUNCED" | "REGISTRATION_OPEN" | "LIVE" | "COMPLETED";

export interface PannaEvent {
  id: string;
  name: string;
  city: string;
  date: string | null; // ISO date, real once set — never a placeholder
  venue: string | null;
  status: EventStatus;
  playerTarget: number;
  clubTarget: number;
  sponsorTarget: number;
  digitalAudienceTarget: number;
  checklist: EventChecklistItem[];
  // Real edition number in the Panna League series (e.g. 1 for the
  // Lausanne pilot). Null until the organizer sets it — never inferred.
  edition: number | null;
  // True for exactly one event — recruitment isn't split per event yet
  // (one shared player/club/sponsor pipeline), so confirmed-count and
  // commercial-pipeline stats are only computed for this one; any other
  // event honestly starts at zero rather than reusing or guessing numbers.
  isPrimary: boolean;
  // Only populated for the primary event — see above.
  playersConfirmed: number;
  clubsConfirmed: number;
  sponsorsConfirmed: number;
  commercialPipeline: number;
}

// ── Campaign (outreach campaigns grouping) ──────────────────

export interface Campaign {
  id: string;
  name: string;
  category: ConversationCategory;
  targetsTotal: number;
  targetsContacted: number;
  targetsConverted: number;
  startedAt: string;
}

// ── Brand voice / AI memory ─────────────────────────────────

export interface BrandVoice {
  company: string;
  description: string;
  tone: string[];
  avoid: string[];
  preferredCta: string;
}

export interface AIMemoryEntry {
  key: string;
  label: string;
  value: string;
}

