import { NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isProspectingConfigured } from "@/lib/agents/prospectResearch";
import { isGoogleConfigured } from "@/lib/integrations/google-client";

// Read-only self-check — sits behind the same passcode-gated middleware
// as every other route in this app. Shows configuration state and real
// row counts per table so you can tell "not configured", "wrong
// project/key", and "genuinely empty table" apart without needing to
// share any secret with anyone.

export const dynamic = "force-dynamic";

const TABLES = ["players", "clubs", "sponsors", "conversations", "meetings", "content_ideas"] as const;

export async function GET() {
  const supabaseConfigured = isSupabaseConfigured();

  let projectRef: string | null = null;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (rawUrl) {
    try {
      projectRef = new URL(rawUrl).hostname.split(".")[0];
    } catch {
      projectRef = "(unparseable URL)";
    }
  }

  const tables: Record<string, { count: number | null; error: string | null }> = {};
  if (supabaseConfigured) {
    const supabase = getSupabaseServerClient();
    for (const table of TABLES) {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
      tables[table] = { count: count ?? null, error: error?.message ?? null };
    }
  }

  return NextResponse.json({
    supabase: {
      configured: supabaseConfigured,
      projectRef, // e.g. "ivzllgqimpcpjmxirqnl" — compare this to the project you see in the Supabase dashboard URL
      tables,
    },
    anthropic: { configured: isProspectingConfigured() },
    google: { configured: isGoogleConfigured() },
    hint:
      supabaseConfigured && Object.values(tables).every((t) => t.count === 0 && !t.error)
        ? "Every table reads 0 rows with no error. If you know rows exist, SUPABASE_SERVICE_ROLE_KEY is very likely set to the anon key's value instead of the service_role key's value (RLS silently returns 0 rows for anon, not an error) — or NEXT_PUBLIC_SUPABASE_URL points at a different project than the one you're viewing in the Supabase dashboard. Re-copy both from Supabase → Settings → API and compare projectRef above to your dashboard URL."
        : null,
  });
}
