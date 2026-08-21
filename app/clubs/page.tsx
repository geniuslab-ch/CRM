import { PageHeader } from "@/components/layout/page-header";
import { ClubsTable } from "@/components/clubs/clubs-table";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getClubs } from "@/lib/supabase/repository";

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const { data: clubs, source } = await getClubs();

  return (
    <div>
      <PageHeader
        title="Club Database"
        description="The Club Finder agent identifies clubs that can supply players or become partners. First contact always leads with player recruitment — commercial partnership is only introduced once a relationship is established."
        action={<DataSourceBadge source={source} />}
      />
      <ClubsTable clubs={clubs} />
    </div>
  );
}
