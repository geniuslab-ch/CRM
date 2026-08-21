import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";

// Server-only route for the Content Agent. Not yet wired to a UI control
// (content opportunities are precomputed in demo data), but available for
// a future "Generate idea from trigger" action without any client-side key.

export async function POST(req: NextRequest) {
  let body: { trigger?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.trigger) {
    return NextResponse.json({ error: "Missing trigger" }, { status: 400 });
  }

  try {
    const ai = getAIProvider();
    const idea = await ai.generateContentIdea(body.trigger);
    return NextResponse.json({ idea, provider: ai.name, isMock: ai.isMock });
  } catch (err) {
    console.error("AI content idea generation failed:", err);
    return NextResponse.json({ error: "AI content idea generation failed. Check server logs." }, { status: 502 });
  }
}
