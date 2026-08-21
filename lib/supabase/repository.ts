import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "./client";
import { Player, Club, Sponsor } from "@/types";

// Server-only "live data" layer — pages import getPlayers()/getClubs()/
// getSponsors() from here (never from lib/data/players.ts etc. directly)
// to read from Supabase. This is the single source of truth for the
// Player Database, Club Database and Sponsor CRM: no fabricated demo
// records are ever shown here. If Supabase isn't configured, unreachable,
// or a table is empty, the result is an empty list, not fake data.
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
