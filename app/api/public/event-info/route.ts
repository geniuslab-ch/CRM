import { NextResponse } from "next/server";
import { getEvents } from "@/lib/supabase/repository";

// Public, unauthenticated — called cross-origin from the Panna League
// marketing site (geniuslab-ch/panna-league, a separate deployment) to
// show real event details (format, city, venue, date, player target)
// instead of hardcoded placeholder text. Excluded from the passcode gate
// in middleware.ts. Read-only: no write path here.
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  // Explicit no-store — a status/date change needs to reach the marketing
  // site on the next page load, not sit behind a CDN or browser cache.
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const { data: events } = await getEvents();
  const primary = events.find((e) => e.isPrimary) ?? events[0] ?? null;

  if (!primary) {
    return NextResponse.json({ event: null }, { headers: CORS_HEADERS });
  }

  return NextResponse.json(
    {
      event: {
        name: primary.name,
        city: primary.city,
        venue: primary.venue,
        date: primary.date, // ISO date or null — the marketing site formats/localizes it
        edition: primary.edition, // real edition number, or null if not set yet
        playerTarget: primary.playerTarget,
        status: primary.status,
      },
    },
    { headers: CORS_HEADERS }
  );
}
