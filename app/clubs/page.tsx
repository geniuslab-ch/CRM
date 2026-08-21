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
        title="Club Database"
        description="The Club Finder agent identifies clubs that can supply players or become partners. First contact always leads with player recruitment — commercial partnership is only introduced once a relationship is established."
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
