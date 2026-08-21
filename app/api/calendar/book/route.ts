import { NextRequest, NextResponse } from "next/server";
import { getCalendarProvider, CalendarSlot } from "@/lib/integrations/calendar";
import { isGoogleConfigured } from "@/lib/integrations/google-client";
import { logMeeting } from "@/lib/supabase/repository";
import { ConversationCategory } from "@/types";

export async function POST(req: NextRequest) {
  let body: {
    slot?: CalendarSlot;
    withName?: string;
    notes?: string;
    logAs?: { organization: string; category: ConversationCategory; relatedId?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.slot || !body.withName) {
    return NextResponse.json({ error: "Missing slot or withName" }, { status: 400 });
  }

  try {
    const provider = getCalendarProvider();
    const result = await provider.bookMeeting(body.slot, body.withName, body.notes);

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
      });
    }

    return NextResponse.json({ ...result, mock: !isGoogleConfigured() });
  } catch (err) {
    console.error("Failed to book meeting:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to book meeting: ${detail}` }, { status: 502 });
  }
}
