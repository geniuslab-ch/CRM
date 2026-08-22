import { NextRequest, NextResponse } from "next/server";
import { getCalendarProvider, CalendarSlot } from "@/lib/integrations/calendar";
import { isGoogleConfigured } from "@/lib/integrations/google-client";
import { logMeeting } from "@/lib/supabase/repository";
import { ConversationCategory } from "@/types";

// Public (see middleware.ts) — reachable both from the authenticated
// Sponsor/Club detail pages (organizer booking on the contact's behalf)
// and from a contact's own public /book/[category]/[id] link (self-serve).
export async function POST(req: NextRequest) {
  let body: {
    slot?: CalendarSlot;
    withName?: string;
    notes?: string;
    attendeeEmail?: string;
    logAs?: { organization: string; category: ConversationCategory; relatedId?: string };
    bookedBy?: "ORGANIZER" | "CONTACT";
    _gotcha?: string; // honeypot, mirrors the public signup forms
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body._gotcha) {
    return NextResponse.json({ confirmed: true, mock: true });
  }

  if (!body.slot || !body.withName) {
    return NextResponse.json({ error: "Missing slot or withName" }, { status: 400 });
  }

  try {
    const provider = getCalendarProvider();
    const result = await provider.bookMeeting(body.slot, body.withName, body.notes, body.attendeeEmail || undefined);

    // Only log a real booking — a mock confirmation (no calendar
    // connected) never actually happened, so it shouldn't create a "real"
    // meeting record.
    if (isGoogleConfigured() && result.confirmed && body.logAs) {
      await logMeeting({
        contactName: body.withName,
        organization: body.logAs.organization,
        category: body.logAs.category,
        relatedId: body.logAs.relatedId,
        startTime: body.slot.startISO,
        endTime: body.slot.endISO,
        notes: body.notes,
        eventLink: result.eventLink,
        bookedBy: body.bookedBy ?? "ORGANIZER",
      });
    }

    return NextResponse.json({ ...result, mock: !isGoogleConfigured() });
  } catch (err) {
    console.error("Failed to book meeting:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to book meeting: ${detail}` }, { status: 502 });
  }
}
