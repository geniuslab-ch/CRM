import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "./client";
import { Player, Club, Sponsor, Conversation, ConversationCategory } from "@/types";
import { PlayerCandidate, ClubCandidate, SponsorCandidate } from "@/lib/agents/prospectResearch";

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
}

// Real counts derived from the same live tables the CRM pages read —
// used by the Dashboard so its KPI cards reflect actual data instead of
// the bundled demo numbers. Only covers what a live table exists for
// today (players/clubs/sponsors); meetings/content/digital-reach stay
// illustrative until those get their own tables (see README §18).
export async function getLiveDashboardKpis(): Promise<LiveDashboardKpis> {
  const [players, clubs, sponsors] = await Promise.all([getPlayers(), getClubs(), getSponsors()]);

  const anyLive = players.source === "live" || clubs.source === "live" || sponsors.source === "live";

  return {
    source: anyLive ? "live" : "unavailable",
    playersConfirmed: players.data.filter((p) => p.status === "CONFIRMED").length,
    playersTotal: players.data.length,
    sponsorsWon: sponsors.data.filter((s) => s.stage === "WON").length,
    sponsorsTotal: sponsors.data.length,
    sponsorPipeline: sponsors.data.filter((s) => !["WON", "LOST"].includes(s.stage)).reduce((sum, s) => sum + s.potentialValue, 0),
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
      fit_why: withSources(c.fitWhy, c.sources),
      potential_value: c.potentialValue,
      stage: "PROSPECT",
      last_activity: "Identified by the Sponsor Finder agent via live web research",
      last_activity_date: new Date().toISOString(),
      next_action: "Review AI research, verify contact details, then move to outreach.",
      research: c.research,
      ai_recommendation: c.aiRecommendation,
    });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
