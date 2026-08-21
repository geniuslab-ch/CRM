import { PageHeader } from "@/components/layout/page-header";
import { PlayersTable } from "@/components/players/players-table";
import { players } from "@/lib/data/players";

export default function PlayersPage() {
  const confirmed = players.filter((p) => p.status === "CONFIRMED").length;

  return (
    <div>
      <PageHeader
        title="Player Database"
        description={`${players.length} scouted players across Switzerland — ${confirmed} confirmed for the roster. The Player Recruiter agent scores every candidate on technical ability, experience, street relevance, audience and local relevance.`}
      />
      <PlayersTable players={players} />
    </div>
  );
}
