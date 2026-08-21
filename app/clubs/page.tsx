import { PageHeader } from "@/components/layout/page-header";
import { ClubsTable } from "@/components/clubs/clubs-table";
import { clubs } from "@/lib/data/clubs";

export default function ClubsPage() {
  return (
    <div>
      <PageHeader
        title="Club Database"
        description="The Club Finder agent identifies clubs that can supply players or become partners. First contact always leads with player recruitment — commercial partnership is only introduced once a relationship is established."
      />
      <ClubsTable clubs={clubs} />
    </div>
  );
}
