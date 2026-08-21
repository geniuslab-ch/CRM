import { NextRequest, NextResponse } from "next/server";
import { getEmailProvider } from "@/lib/integrations/email";

export async function POST(req: NextRequest) {
  let body: { to?: string; subject?: string; message?: string };
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
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send email. Check server logs." }, { status: 502 });
  }
}
