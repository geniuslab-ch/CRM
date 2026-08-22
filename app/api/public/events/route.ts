import { NextResponse } from "next/server";
import { getEvents } from "@/lib/supabase/repository";

// Public, unauthenticated — the marketing site's "more cities" list.
// event-info returns only the primary/featured event; this returns every
// real event in the CRM so the site can show upcoming cities beyond the
// one featured in the main card. Excluded from the passcode gate in
// middleware.ts. Read-only: no write path here.
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  // Explicit no-store — a status flip (e.g. PRE_LAUNCH -> ANNOUNCED) needs
  // to reach the marketing site on the next page load, not sit behind a
  // CDN or browser cache with no expiry hint.
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const { data: events } = await getEvents();

  return NextResponse.json(
    {
      events: events.map((e) => ({
        name: e.name,
        city: e.city,
        venue: e.venue,
        date: e.date, // ISO date or null — the marketing site formats/localizes it
        edition: e.edition, // real edition number, or null if not set yet
        playerTarget: e.playerTarget,
        status: e.status,
        isPrimary: e.isPrimary,
      })),
    },
    { headers: CORS_HEADERS }
  );
}
