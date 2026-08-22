import { PageHeader } from "@/components/layout/page-header";
import { ClubsTable } from "@/components/clubs/clubs-table";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { AddClubDialog } from "@/components/clubs/add-club-dialog";
import { getClubs } from "@/lib/supabase/repository";

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const { data: clubs, source } = await getClubs();

  return (
    <div>
      <PageHeader
        title="Clubs & Schools"
        description="Football clubs and schools both feed the same player pipeline, but need a different pitch — clubs get a competitive challenge to their coach, schools get a PE-department pitch to nominate students. Toggle below to filter."
        action={
          <div className="flex items-center gap-2">
            <DataSourceBadge source={source} />
            <AddClubDialog />
          </div>
        }
      />
      <ClubsTable clubs={clubs} />
    </div>
  );
}
