import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import { OutreachRequest } from "@/lib/ai/provider";

// Server-only route. Client components (e.g. OutreachComposer) POST here
// instead of importing lib/ai directly, so the Anthropic API key never
// reaches the browser bundle. Runs on the Node.js runtime (default) so
// ANTHROPIC_API_KEY is readable from process.env.

export async function POST(req: NextRequest) {
  let body: Partial<OutreachRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { targetName, organization, researchInsight, personalizationAngle, category } = body;
  if (!targetName || !organization || !researchInsight || !personalizationAngle || !category) {
    return NextResponse.json({ error: "Missing required outreach fields" }, { status: 400 });
  }

  try {
    const ai = getAIProvider();
    const result = await ai.generateOutreach({
      targetName,
      organization,
      researchInsight,
      personalizationAngle,
      category,
    });
    return NextResponse.json({ ...result, provider: ai.name, isMock: ai.isMock });
  } catch (err) {
    console.error("AI outreach generation failed:", err);
    return NextResponse.json({ error: "AI outreach generation failed. Check server logs." }, { status: 502 });
  }
}
