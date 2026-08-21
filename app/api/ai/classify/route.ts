import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";

// Server-only route for the Conversation Manager agent. Not yet wired to a
// UI control (classification is precomputed in demo data), but available
// for a future "reclassify with AI" action without any client-side key.

export async function POST(req: NextRequest) {
  let body: { replyText?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.replyText) {
    return NextResponse.json({ error: "Missing replyText" }, { status: 400 });
  }

  try {
    const ai = getAIProvider();
    const result = await ai.classifyReply(body.replyText);
    return NextResponse.json({ ...result, provider: ai.name, isMock: ai.isMock });
  } catch (err) {
    console.error("AI classification failed:", err);
    return NextResponse.json({ error: "AI classification failed. Check server logs." }, { status: 502 });
  }
}
