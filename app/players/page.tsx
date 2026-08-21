import { PageHeader } from "@/components/layout/page-header";
import { PlayersTable } from "@/components/players/players-table";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getPlayers } from "@/lib/supabase/repository";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const { data: players, source } = await getPlayers();
  const confirmed = players.filter((p) => p.status === "CONFIRMED").length;

  return (
    <div>
      <PageHeader
        title="Player Database"
        description={`${players.length} scouted players across Switzerland — ${confirmed} confirmed for the roster. The Player Recruiter agent scores every candidate on technical ability, experience, street relevance, audience and local relevance.`}
        action={<DataSourceBadge source={source} />}
      />
      <PlayersTable players={players} />
    </div>
  );
}
