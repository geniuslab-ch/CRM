import { NextResponse } from "next/server";
import { isProspectingConfigured, researchPlayers, researchClubs, researchSponsors } from "@/lib/agents/prospectResearch";
import { getPlayers, getClubs, getSponsors, createPlayerFromResearch, createClubFromResearch, createSponsorFromResearch } from "@/lib/supabase/repository";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { AgentId } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

type RunEvent =
  | { type: "log"; agentId: AgentId; message: string }
  | { type: "error"; message: string }
  | { type: "done"; summary: { newPlayers: number; newClubs: number; newSponsors: number } };

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

export async function POST() {
  if (!isProspectingConfigured()) {
    return NextResponse.json(
      { error: "Claude isn't configured on this server — set ANTHROPIC_API_KEY to enable real prospecting." },
      { status: 501 }
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase isn't configured — set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY so new leads can be saved." },
      { status: 501 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      function send(event: RunEvent) {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      }

      let newPlayers = 0;
      let newClubs = 0;
      let newSponsors = 0;

      try {
        const [players, clubs, sponsors] = await Promise.all([getPlayers(), getClubs(), getSponsors()]);
        const existingPlayerNames = new Set(players.data.map((p) => normalize(p.name)));
        const existingClubNames = new Set(clubs.data.map((c) => normalize(c.name)));
        const existingSponsorNames = new Set(sponsors.data.map((s) => normalize(s.name)));

        // Player Recruiter
        send({ type: "log", agentId: "player-recruiter", message: "Player Recruiter is searching the web for real street-football candidates in Switzerland…" });
        try {
          const found = await researchPlayers(players.data.map((p) => p.name));
          const fresh = found.filter((c) => !existingPlayerNames.has(normalize(c.name)));
          if (fresh.length === 0) {
            send({ type: "log", agentId: "player-recruiter", message: "No new verifiable player candidates found this run." });
          }
          for (const c of fresh) {
            const result = await createPlayerFromResearch(c);
            if (result.ok) {
              newPlayers++;
              send({ type: "log", agentId: "player-recruiter", message: `Added ${c.name} (${c.city}) as a new player lead — ${c.sources.length} source(s) cited.` });
            } else {
              send({ type: "log", agentId: "player-recruiter", message: `Found ${c.name} but couldn't save it: ${result.error}` });
            }
          }
        } catch (err) {
          send({ type: "log", agentId: "player-recruiter", message: `Player Recruiter hit an error and was skipped: ${err instanceof Error ? err.message : String(err)}` });
        }

        // Club Finder
        send({ type: "log", agentId: "club-finder", message: "Club Finder is searching the web for real Swiss clubs to approach…" });
        try {
          const found = await researchClubs(clubs.data.map((c) => c.name));
          const fresh = found.filter((c) => !existingClubNames.has(normalize(c.name)));
          if (fresh.length === 0) {
            send({ type: "log", agentId: "club-finder", message: "No new verifiable clubs found this run." });
          }
          for (const c of fresh) {
            const result = await createClubFromResearch(c);
            if (result.ok) {
              newClubs++;
              send({ type: "log", agentId: "club-finder", message: `Added ${c.name} (${c.city}) as a new club lead — ${c.sources.length} source(s) cited.` });
            } else {
              send({ type: "log", agentId: "club-finder", message: `Found ${c.name} but couldn't save it: ${result.error}` });
            }
          }
        } catch (err) {
          send({ type: "log", agentId: "club-finder", message: `Club Finder hit an error and was skipped: ${err instanceof Error ? err.message : String(err)}` });
        }

        // Sponsor Finder
        send({ type: "log", agentId: "sponsor-finder", message: "Sponsor Finder is searching the web for real sponsorship prospects…" });
        try {
          const found = await researchSponsors(sponsors.data.map((s) => s.name));
          const fresh = found.filter((c) => !existingSponsorNames.has(normalize(c.name)));
          if (fresh.length === 0) {
            send({ type: "log", agentId: "sponsor-finder", message: "No new verifiable sponsor prospects found this run." });
          }
          for (const c of fresh) {
            const result = await createSponsorFromResearch(c);
            if (result.ok) {
              newSponsors++;
              send({ type: "log", agentId: "sponsor-finder", message: `Added ${c.name} (${c.category}) as a new sponsor prospect — ${c.sources.length} source(s) cited.` });
            } else {
              send({ type: "log", agentId: "sponsor-finder", message: `Found ${c.name} but couldn't save it: ${result.error}` });
            }
          }
        } catch (err) {
          send({ type: "log", agentId: "sponsor-finder", message: `Sponsor Finder hit an error and was skipped: ${err instanceof Error ? err.message : String(err)}` });
        }

        send({ type: "done", summary: { newPlayers, newClubs, newSponsors } });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
