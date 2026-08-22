import { NextResponse } from "next/server";
import { createClubFromSignup } from "@/lib/supabase/repository";

// Public, unauthenticated lead-intake endpoint — called cross-origin from
// the Panna League marketing site (geniuslab-ch/panna-league, a separate
// deployment) after its club/venue partnership form submits to Formspree.
// Best-effort mirror so real inquiries also become real Club rows here;
// Formspree stays the audited record of every raw submission. Excluded
// from the passcode gate in middleware.ts.
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

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission" }, { status: 400, headers: CORS_HEADERS });
  }

  // Honeypot, mirroring the hidden _gotcha field already on the form.
  if (field(formData, "_gotcha", 200)) {
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  }

  const contactName = field(formData, "name", 100);
  const organisation = field(formData, "organisation", 150);
  const contactEmail = field(formData, "email", 200);
  if (!contactName || !organisation || !contactEmail) {
    return NextResponse.json(
      { error: "name, organisation and email are required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = await createClubFromSignup({
    contactName,
    organisation,
    organisationType: field(formData, "organisation_type", 60) || null,
    contactEmail,
    contactPhone: field(formData, "phone", 60) || null,
    instagram: field(formData, "instagram", 80) || null,
    tiktok: field(formData, "tiktok", 80) || null,
    message: field(formData, "message", 2000) || null,
    source: field(formData, "crm_source", 60) || "public-signup",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not save signup" }, { status: 500, headers: CORS_HEADERS });
  }
  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
