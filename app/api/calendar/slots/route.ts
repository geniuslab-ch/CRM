import { NextResponse } from "next/server";
import { getCalendarProvider } from "@/lib/integrations/calendar";

// GET available meeting slots — real Google Calendar free/busy once
// GOOGLE_REFRESH_TOKEN is set, mock slots otherwise.
// Must stay dynamic: availability changes over time, so it must never be
// cached as static output at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const provider = getCalendarProvider();
    const slots = await provider.getAvailableSlots();
    return NextResponse.json({ slots, live: provider.constructor.name === "GoogleCalendarProvider" });
  } catch (err) {
    console.error("Failed to fetch calendar slots:", err);
    return NextResponse.json({ error: "Failed to fetch calendar slots. Check server logs." }, { status: 502 });
  }
}
