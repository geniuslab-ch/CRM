import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSponsors, updateSponsorActivation } from "@/lib/supabase/repository";
import { generateActivation, transformActivation, isActivationLabConfigured, ActivationDirection } from "@/lib/agents/activationLab";

const DIRECTIONS: ActivationDirection[] = ["regenerate", "guerrilla", "cheaper", "bigger", "social", "premium", "sporting"];

export async function POST(req: NextRequest) {
  if (!isActivationLabConfigured()) {
    return NextResponse.json({ error: "Claude isn't configured on this server — set ANTHROPIC_API_KEY." }, { status: 501 });
  }

  let body: { sponsorId?: string; direction?: string };
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
    let concept;
    if (!body.direction) {
      concept = await generateActivation(sponsor);
    } else {
      if (!DIRECTIONS.includes(body.direction as ActivationDirection)) {
        return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
      }
      if (!sponsor.activation) {
        return NextResponse.json({ error: "Generate an activation first before transforming it." }, { status: 400 });
      }
      concept = await transformActivation(sponsor, sponsor.activation, body.direction as ActivationDirection);
    }

    const result = await updateSponsorActivation(sponsor.id, concept);
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Failed to save activation" }, { status: 500 });
    }
    revalidatePath(`/sponsors/${sponsor.id}`);
    return NextResponse.json({ activation: concept });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Activation generation failed: ${detail}` }, { status: 502 });
  }
}
