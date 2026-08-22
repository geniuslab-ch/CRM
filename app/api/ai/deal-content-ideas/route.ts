import { NextRequest, NextResponse } from "next/server";
import { getSponsors } from "@/lib/supabase/repository";
import { generateContentIdeasFromDeal, isDealContentIdeasConfigured } from "@/lib/agents/dealContentIdeas";

export async function POST(req: NextRequest) {
  if (!isDealContentIdeasConfigured()) {
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
    const ideas = await generateContentIdeasFromDeal(sponsor);
    return NextResponse.json({ ideas });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}
