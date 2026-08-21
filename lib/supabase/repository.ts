import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "./client";
import { players as demoPlayers } from "@/lib/data/players";
import { clubs as demoClubs } from "@/lib/data/clubs";
import { sponsors as demoSponsors } from "@/lib/data/sponsors";
import { Player, Club, Sponsor } from "@/types";

// Server-only "live data" layer — pages import getPlayers()/getClubs()/
// getSponsors() from here (never from lib/data/players.ts etc. directly)
// to read from Supabase. Falls back to the bundled demo data whenever
// Supabase isn't configured, unreachable, or the table is empty, so a
// page never breaks regardless of database state.
//
// IMPORTANT: this file (and lib/supabase/client.ts) must only ever be
// imported from Server Components, Route Handlers or scripts — never from
// a "use client" component. lib/data/players.ts / clubs.ts / sponsors.ts
// stay plain and dependency-free on purpose: several client components
// (analytics charts, demo mode) import derived data that traces back to
// those files, and pulling Supabase into that chain would break the
// client bundle.

export interface LiveResult<T> {
  data: T[];
  source: "live" | "demo";
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
  if (!isSupabaseConfigured()) return { data: demoPlayers, source: "demo" };
  try {
    const { data, error } = await getSupabaseServerClient().from("players").select("*");
    if (error) {
      console.error("Supabase getPlayers returned an error, falling back to demo data:", error.message);
      return { data: demoPlayers, source: "demo" };
    }
    if (!data || data.length === 0) return { data: demoPlayers, source: "demo" };
    return { data: data.map(rowToPlayer), source: "live" };
  } catch (err) {
    console.error("Supabase getPlayers failed, falling back to demo data:", err);
    return { data: demoPlayers, source: "demo" };
  }
}

export async function getClubs(): Promise<LiveResult<Club>> {
  if (!isSupabaseConfigured()) return { data: demoClubs, source: "demo" };
  try {
    const { data, error } = await getSupabaseServerClient().from("clubs").select("*");
    if (error) {
      console.error("Supabase getClubs returned an error, falling back to demo data:", error.message);
      return { data: demoClubs, source: "demo" };
    }
    if (!data || data.length === 0) return { data: demoClubs, source: "demo" };
    return { data: data.map(rowToClub), source: "live" };
  } catch (err) {
    console.error("Supabase getClubs failed, falling back to demo data:", err);
    return { data: demoClubs, source: "demo" };
  }
}

export async function getSponsors(): Promise<LiveResult<Sponsor>> {
  if (!isSupabaseConfigured()) return { data: demoSponsors, source: "demo" };
  try {
    const { data, error } = await getSupabaseServerClient().from("sponsors").select("*");
    if (error) {
      console.error("Supabase getSponsors returned an error, falling back to demo data:", error.message);
      return { data: demoSponsors, source: "demo" };
    }
    if (!data || data.length === 0) return { data: demoSponsors, source: "demo" };
    return { data: data.map(rowToSponsor), source: "live" };
  } catch (err) {
    console.error("Supabase getSponsors failed, falling back to demo data:", err);
    return { data: demoSponsors, source: "demo" };
  }
}
