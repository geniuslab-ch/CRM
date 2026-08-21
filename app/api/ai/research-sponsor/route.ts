import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSponsors, updateSponsorResearch } from "@/lib/supabase/repository";
import { researchSponsorProfile, isProspectingConfigured } from "@/lib/agents/prospectResearch";

// The Researcher agent, made real — "Research this company" on the
// sponsor detail page calls this to deepen an existing sponsor's brief
// via Claude + live web search, then saves it back to Supabase.

export async function POST(req: NextRequest) {
  if (!isProspectingConfigured()) {
    return NextResponse.json({ error: "Claude isn't configured on this server — set ANTHROPIC_API_KEY." }, { status: 501 });
  }

  let body: { sponsorId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.sponsorId) {
    return NextResponse.json({ error: "Missing sponsorId" }, { status: 400 });
  }

  const { data: sponsors } = await getSponsors();
  const sponsor = sponsors.find((s) => s.id === body.sponsorId);
  if (!sponsor) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }

  try {
    const profile = await researchSponsorProfile(sponsor);
    const result = await updateSponsorResearch(sponsor.id, profile);
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Failed to save research" }, { status: 500 });
    }
    revalidatePath(`/sponsors/${sponsor.id}`);
    revalidatePath("/sponsors");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Research failed: ${detail}` }, { status: 502 });
  }
}
