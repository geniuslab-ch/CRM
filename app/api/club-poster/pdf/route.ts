import { NextRequest, NextResponse } from "next/server";
import { Club } from "@/types";
import { renderClubPosterPdf } from "@/lib/pdf/render";

export async function POST(req: NextRequest) {
  let body: { club?: Club };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.club) {
    return NextResponse.json({ error: "Missing club" }, { status: 400 });
  }

  try {
    const pdf = await renderClubPosterPdf(body.club);
    const filename = `${body.club.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-recruitment-poster.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Failed to render club poster PDF:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to generate PDF: ${detail}` }, { status: 500 });
  }
}
