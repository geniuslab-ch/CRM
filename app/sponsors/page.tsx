import { PageHeader } from "@/components/layout/page-header";
import { SponsorKanban } from "@/components/sponsors/sponsor-kanban";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { AddSponsorDialog } from "@/components/sponsors/add-sponsor-dialog";
import { getSponsors } from "@/lib/supabase/repository";
import { formatCHF } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const { data: sponsors, source } = await getSponsors();
  const pipeline = sponsors.filter((s) => !["LOST", "WON"].includes(s.stage)).reduce((sum, s) => sum + s.potentialValue, 0);
  const won = sponsors.filter((s) => s.stage === "WON").length;

  return (
    <div>
      <PageHeader
        title="Sponsor CRM"
        description={`${sponsors.length} sponsor prospects across the pipeline — ${won} confirmed, ${formatCHF(
          pipeline
        )} in open opportunities. Drag-free Kanban view, click any card for the full research and outreach history.`}
        action={
          <div className="flex items-center gap-2">
            <DataSourceBadge source={source} />
            <AddSponsorDialog />
          </div>
        }
      />
      <SponsorKanban sponsors={sponsors} />
    </div>
  );
}
