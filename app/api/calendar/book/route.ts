import { NextRequest, NextResponse } from "next/server";
import { getCalendarProvider, CalendarSlot } from "@/lib/integrations/calendar";

export async function POST(req: NextRequest) {
  let body: { slot?: CalendarSlot; withName?: string; notes?: string };
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
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to book meeting:", err);
    return NextResponse.json({ error: "Failed to book meeting. Check server logs." }, { status: 502 });
  }
}
