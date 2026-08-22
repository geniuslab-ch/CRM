import { NextRequest, NextResponse } from "next/server";
import { getSponsors } from "@/lib/supabase/repository";
import { generateActivationEmail, isActivationLabConfigured, EmailKind } from "@/lib/agents/activationLab";

const KINDS: EmailKind[] = ["first", "followup1", "followup2", "followup3"];

export async function POST(req: NextRequest) {
  if (!isActivationLabConfigured()) {
    return NextResponse.json({ error: "Claude isn't configured on this server — set ANTHROPIC_API_KEY." }, { status: 501 });
  }

  let body: { sponsorId?: string; kind?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.sponsorId || !body.kind || !KINDS.includes(body.kind as EmailKind)) {
    return NextResponse.json({ error: "Missing sponsorId or invalid kind" }, { status: 400 });
  }

  const { data: sponsors } = await getSponsors();
  const sponsor = sponsors.find((s) => s.id === body.sponsorId);
  if (!sponsor) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }
  if (!sponsor.activation) {
    return NextResponse.json({ error: "Generate an activation concept first." }, { status: 400 });
  }

  try {
    const draft = await generateActivationEmail(sponsor, sponsor.activation, body.kind as EmailKind);
    return NextResponse.json(draft);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Email generation failed: ${detail}` }, { status: 502 });
  }
}
