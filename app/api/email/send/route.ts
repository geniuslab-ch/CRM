import { NextRequest, NextResponse } from "next/server";
import { getEmailProvider } from "@/lib/integrations/email";
import { logConversation } from "@/lib/supabase/repository";
import { ConversationCategory } from "@/types";

export async function POST(req: NextRequest) {
  let body: {
    to?: string;
    subject?: string;
    message?: string;
    logAs?: { contactName: string; organization: string; category: ConversationCategory; relatedId?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.to || !body.subject || !body.message) {
    return NextResponse.json({ error: "Missing to, subject or message" }, { status: 400 });
  }

  try {
    const provider = getEmailProvider();
    const result = await provider.send(body.to, body.subject, body.message);

    // Only log a real send as a real conversation entry — a mock send
    // (no email integration configured) never happened, so it shouldn't
    // create a "real" activity record.
    if (!result.mock && body.logAs) {
      await logConversation({
        contactName: body.logAs.contactName,
        organization: body.logAs.organization,
        category: body.logAs.category,
        relatedId: body.logAs.relatedId,
        message: body.message,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to send email:", err);
    // Surface the underlying reason (e.g. "Gmail API has not been used in
    // project ... before or it is disabled") — this is a single-organizer
    // internal tool, not a public multi-tenant API, so the extra detail is
    // safe and is exactly what's needed to fix a misconfigured integration.
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to send email: ${detail}` }, { status: 502 });
  }
}
