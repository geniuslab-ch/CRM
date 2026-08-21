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
  position: "Attacker" | "Playmaker" | "Freestyler" | "Defender" | "All-Round";
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
  website: string;
  playersIdentified: number;
  status: ClubStatus;
  potential: ClubPotential;
  lastContact: string | null;
  engagementType: "PLAYER_RECRUITMENT" | "COMMERCIAL_PARTNERSHIP" | "BOTH";
  aiNote: string;
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
  potentialValue: number; // CHF
  stage: SponsorStage;
  lastActivity: string;
  lastActivityDate: string;
  nextAction: string;
  research: SponsorResearch;
  aiRecommendation: string;
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
  tasksCompleted: number;
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

export interface PannaEvent {
  id: string;
  name: string;
  city: SwissCity;
  date: string | null;
  venue: string | null;
  status: "PRE_LAUNCH" | "ANNOUNCED" | "REGISTRATION_OPEN" | "LIVE" | "COMPLETED";
  playerTarget: number;
  playersConfirmed: number;
  clubTarget: number;
  clubsConfirmed: number;
  sponsorTarget: number;
  sponsorsConfirmed: number;
  digitalAudienceTarget: number;
  estimatedReach: number;
  commercialPipeline: number;
  checklist: EventChecklistItem[];
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

// ── AI Run simulation ────────────────────────────────────────

export interface AIRunLogEntry {
  timeSeconds: number;
  agentId: AgentId | "system";
  message: string;
}

export interface AIRunSummary {
  newProspects: number;
  qualifiedOpportunities: number;
  meetingsBooked: number;
  contentIdeas: number;
}
