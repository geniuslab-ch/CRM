import { NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Isolated round-trip check: insert a throwaway row, immediately read it
// back by id, count the table before/after, then delete the row again.
// Exists purely to tell "insert never really commits" apart from "insert
// commits but something else hides it" without any of the AI/dedupe
// complexity in /api/ai/run-team.

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 501 });
  }

  const supabase = getSupabaseServerClient();
  const id = `debug-test-${Date.now()}`;

  const { count: countBefore } = await supabase.from("players").select("*", { count: "exact", head: true });

  const insertPayload = {
    id,
    name: "__DEBUG_TEST__",
    age: 1,
    city: "Zurich",
    club: null,
    position: "All-Round",
    player_score: 1,
    score_breakdown: { technical: 1, experience: 1, streetRelevance: 1, socialAudience: 1, localRelevance: 1, competitivePotential: 1 },
    social_audience: 0,
    status: "IDENTIFIED",
    last_contact: null,
    ai_recommendation: "debug",
    ai_why: "debug",
    avatar_seed: id,
  };

  const insertResult = await supabase.from("players").insert(insertPayload);

  const { count: countAfterInsert } = await supabase.from("players").select("*", { count: "exact", head: true });

  const selectResult = await supabase.from("players").select("*").eq("id", id).maybeSingle();

  const deleteResult = await supabase.from("players").delete().eq("id", id);

  const { count: countAfterDelete } = await supabase.from("players").select("*", { count: "exact", head: true });

  return NextResponse.json({
    id,
    countBefore,
    insertError: insertResult.error ? { message: insertResult.error.message, code: insertResult.error.code, details: insertResult.error.details } : null,
    countAfterInsert,
    foundBySelect: Boolean(selectResult.data),
    selectError: selectResult.error ? selectResult.error.message : null,
    deleteError: deleteResult.error ? deleteResult.error.message : null,
    countAfterDelete,
  });
}
