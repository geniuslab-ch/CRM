import { NextRequest, NextResponse } from "next/server";
import { Sponsor, SponsorshipTier } from "@/types";
import { renderProposalPdf } from "@/lib/pdf/render";

export async function POST(req: NextRequest) {
  let body: { sponsor?: Sponsor; tier?: SponsorshipTier };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.sponsor || !body.tier) {
    return NextResponse.json({ error: "Missing sponsor or tier" }, { status: 400 });
  }

  try {
    const pdf = await renderProposalPdf(body.sponsor, body.tier);
    const filename = `${body.sponsor.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-proposal.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Failed to render proposal PDF:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to generate PDF: ${detail}` }, { status: 500 });
  }
}
