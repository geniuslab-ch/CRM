import { NextRequest, NextResponse } from "next/server";
import { pollInbox } from "@/lib/agents/inboxPoller";

// Fired by Vercel Cron on the schedule in vercel.json. Excluded from the
// passcode gate in middleware.ts (Vercel's own cron dispatcher can't carry
// a session cookie) — authenticated instead by checking the Authorization
// header Vercel automatically attaches when CRON_SECRET is set in the
// project's environment variables. Without CRON_SECRET set, this route
// refuses every request rather than running unauthenticated.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET isn't set on this server." }, { status: 501 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pollInbox();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Inbox poll failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Inbox poll failed: ${detail}` }, { status: 502 });
  }
}
