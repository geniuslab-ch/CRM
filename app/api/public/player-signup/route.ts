import { NextResponse } from "next/server";
import { createPlayerFromSignup } from "@/lib/supabase/repository";

// Public, unauthenticated lead-intake endpoint — called cross-origin from
// the Panna League marketing site (geniuslab-ch/panna-league, a separate
// deployment) after its player registration form and Signal-campaign
// application form submit to Formspree. This is a best-effort mirror so
// real signups also become real Player rows here, not a replacement for
// Formspree (which stays the audited record of every raw submission).
// Excluded from the passcode gate in middleware.ts.
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function field(formData: FormData, key: string, max: number): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission" }, { status: 400, headers: CORS_HEADERS });
  }

  // Honeypot, mirroring the hidden _gotcha field already on every public
  // form — a filled one means a bot, not a real applicant. Report success
  // so a bot doesn't learn to adapt, but write nothing.
  if (field(formData, "_gotcha", 200)) {
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  }

  const firstName = field(formData, "first_name", 100);
  const lastName = field(formData, "last_name", 100);
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "first_name and last_name are required" }, { status: 400, headers: CORS_HEADERS });
  }

  // The main register form sends a dedicated "email" (+ "phone") field;
  // the Signal application form sends one combined "contact" field that
  // can be either — classify it by shape rather than guessing which.
  let contactEmail: string | null = field(formData, "email", 200) || null;
  let contactPhone: string | null = field(formData, "phone", 60) || null;
  const contact = field(formData, "contact", 200);
  if (contact) {
    if (EMAIL_RE.test(contact)) contactEmail = contactEmail ?? contact;
    else contactPhone = contactPhone ?? contact;
  }

  const result = await createPlayerFromSignup({
    firstName,
    lastName,
    city: field(formData, "city", 100) || null,
    ageGroup: field(formData, "age_group", 20) || null,
    club: field(formData, "club", 150) || null,
    positionRaw: field(formData, "position", 150) || null,
    note: field(formData, "why_you", 2000) || null,
    contactEmail,
    contactPhone,
    instagram: field(formData, "instagram", 80) || null,
    tiktok: field(formData, "tiktok", 80) || null,
    source: field(formData, "crm_source", 60) || "public-signup",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not save signup" }, { status: 500, headers: CORS_HEADERS });
  }
  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
