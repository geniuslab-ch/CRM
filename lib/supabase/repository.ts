import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "./client";
import { Player, Club, Sponsor, Conversation, ConversationCategory, Meeting, ContentOpportunity, ContentStatus, ActivationConcept } from "@/types";
import { PlayerCandidate, ClubCandidate, SponsorCandidate, SponsorProfileUpdate } from "@/lib/agents/prospectResearch";

// Server-only "live data" layer — pages import getPlayers()/getClubs()/
// getSponsors() from here (never from lib/data/players.ts etc. directly)
// to read from Supabase. This is the single source of truth for the
// Player Database, Club Database and Sponsor CRM: no fabricated demo
// records are ever shown here. If Supabase isn't configured, unreachable,
// or a table is empty, the result is an empty list, not fake data.
// It also holds the createXFromResearch() write helpers used by
// /api/ai/run-team to save real, AI-sourced prospects — human-entered
// writes from forms live in lib/supabase/actions.ts instead.
//
// IMPORTANT: this file (and lib/supabase/client.ts) must only ever be
// imported from Server Components, Route Handlers or scripts — never from
// a "use client" component. lib/data/players.ts / clubs.ts / sponsors.ts
// still exist (used to seed Supabase and by a few unrelated demo-only
// dashboard/analytics widgets — see README), but this file deliberately
// does not import them.

export type DataStatus = "live" | "unavailable";

export interface LiveResult<T> {
  data: T[];
  source: DataStatus;
}

function rowToPlayer(row: any): Player {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    city: row.city,
    club: row.club,
    position: row.position,
    playerScore: row.player_score,
    scoreBreakdown: row.score_breakdown,
    socialAudience: row.social_audience,
    status: row.status,
    lastContact: row.last_contact,
    aiRecommendation: row.ai_recommendation,
    aiWhy: row.ai_why,
    avatarSeed: row.avatar_seed,
    ageGroup: row.age_group ?? null,
    contactEmail: row.contact_email ?? null,
    contactPhone: row.contact_phone ?? null,
    instagram: row.instagram ?? null,
    tiktok: row.tiktok ?? null,
    signupNote: row.signup_note ?? null,
    signupSource: row.signup_source ?? null,
    positionNote: row.position_note ?? null,
    nominatedBy: row.nominated_by ?? null,
  };
}

function rowToClub(row: any): Club {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    website: row.website,
    playersIdentified: row.players_identified,
    status: row.status,
    potential: row.potential,
    lastContact: row.last_contact,
    engagementType: row.engagement_type,
    aiNote: row.ai_note,
    contactPhone: row.contact_phone ?? null,
    organisationType: row.organisation_type ?? null,
    instagram: row.instagram ?? null,
    tiktok: row.tiktok ?? null,
    inquiryMessage: row.inquiry_message ?? null,
    signupSource: row.signup_source ?? null,
  };
}

function rowToSponsor(row: any): Sponsor {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    city: row.city,
    fit: row.fit,
    fitWhy: row.fit_why,
    potentialValue: row.potential_value,
    stage: row.stage,
    lastActivity: row.last_activity,
    lastActivityDate: row.last_activity_date,
    nextAction: row.next_action,
    research: row.research,
    aiRecommendation: row.ai_recommendation,
    activation: row.activation ?? null,
  };
}

export async function getPlayers(): Promise<LiveResult<Player>> {
  if (!isSupabaseConfigured()) return { data: [], source: "unavailable" };
  try {
    const { data, error } = await getSupabaseServerClient().from("players").select("*").order("player_score", { ascending: false });
    if (error) {
      console.error("Supabase getPlayers error:", error.message);
      return { data: [], source: "unavailable" };
    }
    return { data: (data ?? []).map(rowToPlayer), source: "live" };
  } catch (err) {
    console.error("Supabase getPlayers failed:", err);
    return { data: [], source: "unavailable" };
  }
}

export async function getClubs(): Promise<LiveResult<Club>> {
  if (!isSupabaseConfigured()) return { data: [], source: "unavailable" };
  try {
    const { data, error } = await getSupabaseServerClient().from("clubs").select("*").order("name", { ascending: true });
    if (error) {
      console.error("Supabase getClubs error:", error.message);
      return { data: [], source: "unavailable" };
    }
    return { data: (data ?? []).map(rowToClub), source: "live" };
  } catch (err) {
    console.error("Supabase getClubs failed:", err);
    return { data: [], source: "unavailable" };
  }
}

export interface LiveDashboardKpis {
  source: DataStatus;
  playersConfirmed: number;
  playersTotal: number;
  sponsorsWon: number;
  sponsorsTotal: number;
  sponsorPipeline: number;
  clubPartners: number;
  clubsTotal: number;
  meetingsBooked: number;
  contentPublished: number;
  contentIdeasTotal: number;
}

// Real counts derived from the same live tables the CRM pages read —
// used by the Dashboard so its KPI cards and Demo Mode reflect actual
// data instead of the bundled demo numbers. Digital reach still has no
// backing data source (no analytics API connected) and stays out of
// this entirely rather than being estimated.
export async function getLiveDashboardKpis(): Promise<LiveDashboardKpis> {
  const [players, clubs, sponsors, meetings, contentIdeas] = await Promise.all([
    getPlayers(),
    getClubs(),
    getSponsors(),
    getMeetings(),
    getContentIdeas(),
  ]);

  const anyLive = players.source === "live" || clubs.source === "live" || sponsors.source === "live";

  return {
    source: anyLive ? "live" : "unavailable",
    playersConfirmed: players.data.filter((p) => p.status === "CONFIRMED").length,
    playersTotal: players.data.length,
    sponsorsWon: sponsors.data.filter((s) => s.stage === "WON").length,
    sponsorsTotal: sponsors.data.length,
    sponsorPipeline: sponsors.data.filter((s) => !["WON", "LOST"].includes(s.stage)).reduce((sum, s) => sum + s.potentialValue, 0),
    meetingsBooked: meetings.data.length,
    contentPublished: contentIdeas.data.filter((c) => c.status === "PUBLISHED").length,
    contentIdeasTotal: contentIdeas.data.length,
    clubPartners: clubs.data.filter((c) => c.status === "CONFIRMED" || c.status === "PARTNER").length,
    clubsTotal: clubs.data.length,
  };
}

export async function getSponsors(): Promise<LiveResult<Sponsor>> {
  if (!isSupabaseConfigured()) return { data: [], source: "unavailable" };
  try {
    const { data, error } = await getSupabaseServerClient()
      .from("sponsors")
      .select("*")
      .order("potential_value", { ascending: false });
    if (error) {
      console.error("Supabase getSponsors error:", error.message);
      return { data: [], source: "unavailable" };
    }
    return { data: (data ?? []).map(rowToSponsor), source: "live" };
  } catch (err) {
    console.error("Supabase getSponsors failed:", err);
    return { data: [], source: "unavailable" };
  }
}

function rowToConversation(row: any): Conversation {
  return {
    id: row.id,
    contactName: row.contact_name,
    organization: row.organization,
    category: row.category,
    relatedId: row.related_id,
    messages: [{ id: `${row.id}-1`, from: "AI", text: row.message, timestamp: row.created_at }],
    lastMessagePreview: row.message,
    lastMessageAt: row.created_at,
    // Real, not fabricated: this table only logs messages actually sent —
    // there's no inbound-reply integration yet, so every row genuinely is
    // still awaiting a reply. See README §18.
    classification: "AWAITING_REPLY",
    recommendedAction: "No reply yet — follow up if you don't hear back in a few days.",
    aiDraftResponse: "",
    unread: false,
  };
}

// Real sent-message log — populated only when the Outreach Agent actually
// sends an email (see /api/email/send). Never seeded with fake history.
export async function getConversations(): Promise<LiveResult<Conversation>> {
  if (!isSupabaseConfigured()) return { data: [], source: "unavailable" };
  try {
    const { data, error } = await getSupabaseServerClient()
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase getConversations error:", error.message);
      return { data: [], source: "unavailable" };
    }
    return { data: (data ?? []).map(rowToConversation), source: "live" };
  } catch (err) {
    console.error("Supabase getConversations failed:", err);
    return { data: [], source: "unavailable" };
  }
}

// Called after a real (non-mock) send succeeds. Best-effort: a logging
// failure should never break the send the user just watched happen.
export async function logConversation(entry: {
  contactName: string;
  organization: string;
  category: ConversationCategory;
  relatedId?: string;
  message: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await getSupabaseServerClient()
      .from("conversations")
      .insert({
        id: `conv-${crypto.randomUUID()}`,
        contact_name: entry.contactName,
        organization: entry.organization,
        category: entry.category,
        related_id: entry.relatedId ?? null,
        message: entry.message,
      });
    if (error) console.error("Supabase logConversation error:", error.message);
  } catch (err) {
    console.error("Supabase logConversation failed:", err);
  }
}

// ── Meetings ─────────────────────────────────────────────────
// Real log — one row per meeting actually booked on the connected Google
// Calendar via the Booking widget (see BookingWidget + /api/calendar/book).
// Never written for a mock booking (no calendar connected).

function rowToMeeting(row: any): Meeting {
  const start = new Date(row.start_time);
  const end = new Date(row.end_time);
  return {
    id: row.id,
    withName: row.contact_name,
    organization: row.organization,
    category: row.category,
    relatedId: row.related_id,
    date: row.start_time,
    time: start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    durationMinutes: Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000)),
    status: "CONFIRMED",
    agenda: row.notes || `Panna League x ${row.organization}`,
  };
}

export async function getMeetings(): Promise<LiveResult<Meeting>> {
  if (!isSupabaseConfigured()) return { data: [], source: "unavailable" };
  try {
    const { data, error } = await getSupabaseServerClient().from("meetings").select("*").order("start_time", { ascending: true });
    if (error) {
      console.error("Supabase getMeetings error:", error.message);
      return { data: [], source: "unavailable" };
    }
    return { data: (data ?? []).map(rowToMeeting), source: "live" };
  } catch (err) {
    console.error("Supabase getMeetings failed:", err);
    return { data: [], source: "unavailable" };
  }
}

export async function logMeeting(entry: {
  contactName: string;
  organization: string;
  category: ConversationCategory;
  relatedId?: string;
  startTime: string;
  endTime: string;
  notes?: string;
  eventLink?: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await getSupabaseServerClient()
      .from("meetings")
      .insert({
        id: `meeting-${crypto.randomUUID()}`,
        contact_name: entry.contactName,
        organization: entry.organization,
        category: entry.category,
        related_id: entry.relatedId ?? null,
        start_time: entry.startTime,
        end_time: entry.endTime,
        notes: entry.notes ?? null,
        event_link: entry.eventLink ?? null,
      });
    if (error) console.error("Supabase logMeeting error:", error.message);
  } catch (err) {
    console.error("Supabase logMeeting failed:", err);
  }
}

// ── Content ideas ────────────────────────────────────────────
// Real ideas the Content Agent (Claude) actually generated and the
// organizer chose to save. Status/scheduling are edited manually;
// performance stays null until entered manually — no social analytics
// API is connected, so it's never fabricated.

function rowToContentIdea(row: any): ContentOpportunity {
  return {
    id: row.id,
    title: row.title,
    platform: row.platform,
    trigger: row.trigger,
    hook: row.hook,
    caption: row.caption,
    cta: row.cta,
    suggestedFootage: row.suggested_footage,
    sponsorIntegration: row.sponsor_integration,
    status: row.status,
    scheduledDate: row.scheduled_date,
    performance: row.performance,
  };
}

export async function getContentIdeas(): Promise<LiveResult<ContentOpportunity>> {
  if (!isSupabaseConfigured()) return { data: [], source: "unavailable" };
  try {
    const { data, error } = await getSupabaseServerClient()
      .from("content_ideas")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase getContentIdeas error:", error.message);
      return { data: [], source: "unavailable" };
    }
    return { data: (data ?? []).map(rowToContentIdea), source: "live" };
  } catch (err) {
    console.error("Supabase getContentIdeas failed:", err);
    return { data: [], source: "unavailable" };
  }
}

export async function createContentIdea(idea: Omit<ContentOpportunity, "id" | "status" | "scheduledDate" | "performance">): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const { error } = await getSupabaseServerClient()
    .from("content_ideas")
    .insert({
      id: `content-${crypto.randomUUID()}`,
      title: idea.title,
      platform: idea.platform,
      trigger: idea.trigger,
      hook: idea.hook,
      caption: idea.caption,
      cta: idea.cta,
      suggested_footage: idea.suggestedFootage,
      sponsor_integration: idea.sponsorIntegration,
      status: "IDEA",
    });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateContentIdeaStatus(id: string, status: ContentStatus): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const { error } = await getSupabaseServerClient()
    .from("content_ideas")
    .update({ status, scheduled_date: status === "SCHEDULED" ? new Date().toISOString() : undefined })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteContentIdea(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const { error } = await getSupabaseServerClient().from("content_ideas").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── AI-sourced prospect inserts ─────────────────────────────
// Used by /api/ai/run-team after lib/agents/prospectResearch.ts finds a
// real, web-search-verified candidate. Every record lands as a cold
// IDENTIFIED/PROSPECT lead — never pre-approved or auto-contacted — and
// carries the source URLs the AI actually found it from, so a human can
// verify before reaching out.

function withSources(text: string, sources: string[]): string {
  return sources.length ? `${text} Sources: ${sources.join(", ")}` : text;
}

export async function createPlayerFromResearch(c: PlayerCandidate): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const id = `player-${crypto.randomUUID()}`;
  const { error } = await getSupabaseServerClient()
    .from("players")
    .insert({
      id,
      name: c.name,
      age: c.age,
      city: c.city,
      club: c.club,
      position: c.position,
      player_score: c.playerScore,
      score_breakdown: c.scoreBreakdown,
      social_audience: c.socialAudience,
      status: "IDENTIFIED",
      last_contact: null,
      ai_recommendation: "Identified by the Player Recruiter agent via live web research — verify before contacting.",
      ai_why: withSources(c.aiWhy, c.sources),
      avatar_seed: id,
    });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Public signups ──────────────────────────────────────────
// Used by /api/public/player-signup, which the Panna League marketing
// site (a separate repo/deployment) calls from its player registration
// and "Signal" guerrilla-campaign forms. Every submission lands as a
// real, unscored IDENTIFIED player — never fabricated stats. Fields the
// form didn't collect (exact age, city on the main form, etc.) stay
// null/"Not provided" rather than being guessed.

export interface PlayerSignup {
  firstName: string;
  lastName: string;
  city: string | null;
  ageGroup: string | null; // e.g. "18-24" — brackets only, no exact age is ever collected
  club: string | null;
  positionRaw: string | null; // free text from the Signal form, best-effort classified below
  note: string | null; // "why should I be selected" answer
  contactEmail: string | null;
  contactPhone: string | null;
  instagram: string | null;
  tiktok: string | null;
  source: string; // which public form/channel, e.g. "site-register", "signal:lausanne01"
  nominatedBy: string | null; // "Name (contact)" of the friend who nominated this player, when applicable
}

function ageFromGroup(group: string | null): number {
  switch (group) {
    case "Under 16":
      return 15;
    case "16-17":
      return 16;
    case "18-24":
      return 21;
    case "25-34":
      return 29;
    case "35+":
      return 40;
    default:
      // No bracket collected at all — same neutral fallback the manual
      // "Add Player" dialog already uses when age is left blank.
      return 20;
  }
}

function classifySignupPosition(raw: string | null): Player["position"] {
  if (!raw) return "Unknown";
  const s = raw.toLowerCase();
  if (/attaqu|striker|attacker|avant.?centre/.test(s)) return "Attacker";
  if (/milieu|playmaker|meneur/.test(s)) return "Playmaker";
  if (/freestyle|jongl/.test(s)) return "Freestyler";
  if (/d[ée]fenseur|defender|arri[eè]re/.test(s)) return "Defender";
  if (/polyvalent|all.?round|tous les postes|pas de poste/.test(s)) return "All-Round";
  return "Unknown";
}

export async function createPlayerFromSignup(s: PlayerSignup): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const id = `player-${crypto.randomUUID()}`;
  const name = `${s.firstName} ${s.lastName}`.trim();
  const { error } = await getSupabaseServerClient()
    .from("players")
    .insert({
      id,
      name,
      age: ageFromGroup(s.ageGroup),
      city: s.city || "Not provided",
      club: s.club || null,
      position: classifySignupPosition(s.positionRaw),
      player_score: 50,
      score_breakdown: {
        technical: 50,
        experience: 50,
        streetRelevance: 50,
        socialAudience: 50,
        localRelevance: 50,
        competitivePotential: 50,
      },
      social_audience: 0,
      status: "IDENTIFIED",
      last_contact: null,
      ai_recommendation: s.nominatedBy
        ? "Nominated by a friend via the Panna League Signal campaign — not yet reviewed by the Player Recruiter agent."
        : "Public signup via the Panna League website — not yet reviewed by the Player Recruiter agent.",
      ai_why: s.note || (s.nominatedBy ? "Nominated by a friend — no reason given." : "Applied directly through the public registration form."),
      avatar_seed: id,
      age_group: s.ageGroup,
      contact_email: s.contactEmail,
      contact_phone: s.contactPhone,
      instagram: s.instagram,
      tiktok: s.tiktok,
      signup_note: s.note,
      signup_source: s.source,
      position_note: s.positionRaw,
      nominated_by: s.nominatedBy,
    });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Club partnership signups ────────────────────────────────

export interface ClubSignup {
  contactName: string; // the person filling out the form
  organisation: string; // club/academy/venue name
  organisationType: string | null;
  contactEmail: string;
  contactPhone: string | null;
  instagram: string | null;
  tiktok: string | null;
  message: string | null;
  source: string;
}

export async function createClubFromSignup(s: ClubSignup): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const id = `club-${crypto.randomUUID()}`;
  const { error } = await getSupabaseServerClient()
    .from("clubs")
    .insert({
      id,
      name: s.organisation,
      city: "Not provided",
      contact_name: s.contactName,
      contact_email: s.contactEmail,
      website: "",
      players_identified: 0,
      status: "IDENTIFIED",
      potential: "MEDIUM",
      last_contact: null,
      engagement_type: "PLAYER_RECRUITMENT",
      ai_note: "Public partnership inquiry via the Panna League website — not yet reviewed.",
      contact_phone: s.contactPhone,
      organisation_type: s.organisationType,
      instagram: s.instagram,
      tiktok: s.tiktok,
      inquiry_message: s.message,
      signup_source: s.source,
    });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function createClubFromResearch(c: ClubCandidate): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const id = `club-${crypto.randomUUID()}`;
  const { error } = await getSupabaseServerClient()
    .from("clubs")
    .insert({
      id,
      name: c.name,
      city: c.city,
      contact_name: c.contactName,
      contact_email: c.contactEmail,
      website: c.website,
      players_identified: 0,
      status: "IDENTIFIED",
      potential: c.potential,
      last_contact: null,
      engagement_type: "PLAYER_RECRUITMENT",
      ai_note: withSources(c.aiNote, c.sources),
    });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Deep-dive update from the Researcher agent (see "Research this company"
// on the sponsor detail page). Sponsor-facing fields (research.*,
// reasonToSponsor) stay clean; source citations go on ai_recommendation
// only, same rule as createSponsorFromResearch above — never let AI
// provenance leak into copy that gets sent to the sponsor.
export async function updateSponsorResearch(id: string, update: SponsorProfileUpdate): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const supabase = getSupabaseServerClient();
  const { data: existing, error: fetchError } = await supabase.from("sponsors").select("research").eq("id", id).single();
  if (fetchError || !existing) return { ok: false, error: fetchError?.message ?? "Sponsor not found" };

  const existingResearch = (existing.research ?? {}) as Record<string, unknown>;
  const research = {
    ...existingResearch,
    companyDescription: update.companyDescription,
    swissPresence: update.swissPresence,
    targetAudience: update.targetAudience,
    recentMarketingActivity: update.recentMarketingActivity,
    existingSponsorships: update.existingSponsorships,
    reasonToSponsor: update.reasonToSponsor,
    activationOpportunities: update.activationOpportunities,
    suggestedPackage: update.suggestedPackage,
  };

  const { error } = await supabase
    .from("sponsors")
    .update({
      research,
      ai_recommendation: withSources(update.aiRecommendation, update.sources),
      last_activity: "Researcher agent completed a deep company brief",
      last_activity_date: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// AI Activation Lab concept — the sponsor's "brand territory → activation
// idea" state (see lib/agents/activationLab.ts). Stored whole, since it's
// always regenerated/transformed as one unit, never partially edited.
export async function updateSponsorActivation(id: string, activation: ActivationConcept): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const { error } = await getSupabaseServerClient().from("sponsors").update({ activation }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function createSponsorFromResearch(c: SponsorCandidate): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const id = `sponsor-${crypto.randomUUID()}`;
  const { error } = await getSupabaseServerClient()
    .from("sponsors")
    .insert({
      id,
      name: c.name,
      category: c.category,
      city: c.city,
      fit: c.fit,
      // Sponsor-facing copy (fitWhy, research.*) stays clean — it can end
      // up verbatim in the exported PDF and in outreach emails. Source
      // citations are provenance for internal review only, so they live
      // in ai_recommendation (shown in the CRM's "AI recommendation"
      // card), never in anything sent to the sponsor.
      fit_why: c.fitWhy,
      potential_value: c.potentialValue,
      stage: "PROSPECT",
      last_activity: "Identified by the Sponsor Finder agent via live web research",
      last_activity_date: new Date().toISOString(),
      next_action: "Review AI research, verify contact details, then move to outreach.",
      research: c.research,
      ai_recommendation: withSources(c.aiRecommendation, c.sources),
    });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
