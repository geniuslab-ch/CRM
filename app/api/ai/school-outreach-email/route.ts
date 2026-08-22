import { NextRequest, NextResponse } from "next/server";
import { getClubs } from "@/lib/supabase/repository";
import { generateSchoolOutreachEmail, isSchoolOutreachEmailConfigured } from "@/lib/agents/schoolOutreachEmail";
import { clubRegistrationUrl } from "@/lib/data/registration";

export async function POST(req: NextRequest) {
  if (!isSchoolOutreachEmailConfigured()) {
    return NextResponse.json({ error: "Claude isn't configured on this server — set ANTHROPIC_API_KEY." }, { status: 501 });
  }

  let body: { schoolId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.schoolId) {
    return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
  }

  const { data: clubs } = await getClubs();
  const school = clubs.find((c) => c.id === body.schoolId && c.kind === "SCHOOL");
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  try {
    const draft = await generateSchoolOutreachEmail(school, clubRegistrationUrl(school.name));
    return NextResponse.json(draft);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Email generation failed: ${detail}` }, { status: 502 });
  }
}
