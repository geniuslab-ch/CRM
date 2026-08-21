// One-time (safe to re-run) seed: pushes the app's demo players, clubs and
// sponsors into Supabase. Run this AFTER pasting lib/supabase/schema.sql
// into the Supabase SQL Editor and running it once.
//
// Usage:
//   npm run supabase:seed

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { players } from "../lib/data/players";
import { clubs } from "../lib/data/clubs";
import { sponsors } from "../lib/data/sponsors";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log(`Seeding ${players.length} players...`);
  const { error: playersError } = await supabase.from("players").upsert(
    players.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      city: p.city,
      club: p.club,
      position: p.position,
      player_score: p.playerScore,
      score_breakdown: p.scoreBreakdown,
      social_audience: p.socialAudience,
      status: p.status,
      last_contact: p.lastContact,
      ai_recommendation: p.aiRecommendation,
      ai_why: p.aiWhy,
      avatar_seed: p.avatarSeed,
    }))
  );
  if (playersError) throw playersError;

  console.log(`Seeding ${clubs.length} clubs...`);
  const { error: clubsError } = await supabase.from("clubs").upsert(
    clubs.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      contact_name: c.contactName,
      contact_email: c.contactEmail,
      website: c.website,
      players_identified: c.playersIdentified,
      status: c.status,
      potential: c.potential,
      last_contact: c.lastContact,
      engagement_type: c.engagementType,
      ai_note: c.aiNote,
    }))
  );
  if (clubsError) throw clubsError;

  console.log(`Seeding ${sponsors.length} sponsors...`);
  const { error: sponsorsError } = await supabase.from("sponsors").upsert(
    sponsors.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      city: s.city,
      fit: s.fit,
      fit_why: s.fitWhy,
      potential_value: s.potentialValue,
      stage: s.stage,
      last_activity: s.lastActivity,
      last_activity_date: s.lastActivityDate,
      next_action: s.nextAction,
      research: s.research,
      ai_recommendation: s.aiRecommendation,
    }))
  );
  if (sponsorsError) throw sponsorsError;

  console.log("Done — players, clubs and sponsors are now in Supabase.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
