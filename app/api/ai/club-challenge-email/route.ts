import { NextRequest, NextResponse } from "next/server";
import { getClubs } from "@/lib/supabase/repository";
import { generateClubChallengeEmail, isClubChallengeEmailConfigured } from "@/lib/agents/clubChallengeEmail";
import { clubRegistrationUrl } from "@/lib/data/registration";

export async function POST(req: NextRequest) {
  if (!isClubChallengeEmailConfigured()) {
    return NextResponse.json({ error: "Claude isn't configured on this server — set ANTHROPIC_API_KEY." }, { status: 501 });
  }

  let body: { clubId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.clubId) {
    return NextResponse.json({ error: "Missing clubId" }, { status: 400 });
  }

  const { data: clubs } = await getClubs();
  const club = clubs.find((c) => c.id === body.clubId);
  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  try {
    const draft = await generateClubChallengeEmail(club, clubRegistrationUrl(club.name));
    return NextResponse.json(draft);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Email generation failed: ${detail}` }, { status: 502 });
  }
}
