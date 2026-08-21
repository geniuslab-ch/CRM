import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { ContentBoard } from "@/components/content/content-board";
import { ContentCalendar } from "@/components/content/content-calendar";
import { ContentIdeaGenerator } from "@/components/content/content-idea-generator";
import { getContentIdeas } from "@/lib/supabase/repository";
import { formatNumber } from "@/lib/utils";
import { Eye, TrendingUp, Clapperboard, CalendarClock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const { data: contentOpportunities, source } = await getContentIdeas();

  const published = contentOpportunities.filter((c) => c.status === "PUBLISHED");
  const scheduled = contentOpportunities.filter((c) => c.status === "SCHEDULED");
  const totalViews = published.reduce((sum, c) => sum + (c.performance?.views ?? 0), 0);
  const avgEngagement =
    published.filter((c) => c.performance).length > 0
      ? Math.round(
          (published.reduce((sum, c) => sum + (c.performance?.engagementRate ?? 0), 0) /
            published.filter((c) => c.performance).length) *
            10
        ) / 10
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Command Center"
        description="The Content Agent turns a real event trigger into a ready-to-publish idea — hook, caption, CTA and sponsor integration included."
        action={<DataSourceBadge source={source} />}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Content ideas" value={String(contentOpportunities.length)} icon={Clapperboard} />
        <KpiCard label="Scheduled" value={String(scheduled.length)} icon={CalendarClock} />
        <KpiCard
          label="Total views"
          value={formatNumber(totalViews)}
          icon={Eye}
          sublabel={`${published.length} published · entered manually`}
        />
        <KpiCard label="Avg. engagement" value={`${avgEngagement}%`} icon={TrendingUp} />
      </div>

      <ContentIdeaGenerator />
      <ContentCalendar />
      <ContentBoard opportunities={contentOpportunities} />
    </div>
  );
}
