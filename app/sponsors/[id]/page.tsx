import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { Why } from "@/components/ui/why";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { FitBar } from "@/components/sponsors/fit-bar";
import { SponsorWorkspace } from "@/components/sponsors/sponsor-workspace";
import { DeleteSponsorButton } from "@/components/sponsors/delete-sponsor-button";
import { EditSponsorDialog } from "@/components/sponsors/edit-sponsor-dialog";
import { getSponsors, getConversations } from "@/lib/supabase/repository";
import { whyPannaLeague } from "@/lib/agents/sponsorResearcher";
import { formatCHF, timeAgo } from "@/lib/utils";

// No generateStaticParams — sponsors can now come from a live database
// that changes independently of build time, so every request renders
// fresh rather than serving a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function SponsorDetailPage({ params }: { params: { id: string } }) {
  const [{ data: sponsors, source }, { data: allConversations }] = await Promise.all([getSponsors(), getConversations()]);
  const sponsor = sponsors.find((s) => s.id === params.id);
  if (!sponsor) notFound();

  const history = allConversations.filter((c) => c.relatedId === sponsor.id);
  const reasons = whyPannaLeague(sponsor);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/sponsors" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Sponsor CRM
        </Link>
        <div className="flex items-center gap-2">
          <DataSourceBadge source={source} />
          <EditSponsorDialog sponsor={sponsor} />
          <DeleteSponsorButton id={sponsor.id} name={sponsor.name} />
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <ScoreRing score={sponsor.fit.overall} size={72} label="fit" />
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{sponsor.name}</h1>
                <StatusBadge status={sponsor.stage} />
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {sponsor.category} · {sponsor.city}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Potential value</p>
            <p className="font-display text-3xl font-bold text-primary">{formatCHF(sponsor.potentialValue)}</p>
          </div>
        </div>
        <div className="mt-5">
          <Why>{sponsor.fitWhy}</Why>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Company information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{sponsor.research.companyDescription}</p>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Swiss presence</dt>
                  <dd className="mt-0.5">{sponsor.research.swissPresence}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Target audience</dt>
                  <dd className="mt-0.5">{sponsor.research.targetAudience}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Recent marketing activity</dt>
                  <dd className="mt-0.5">{sponsor.research.recentMarketingActivity}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Existing sponsorships</dt>
                  <dd className="mt-0.5">{sponsor.research.existingSponsorships}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why Panna League?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {reasons.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">{sponsor.research.reasonToSponsor}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand alignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FitBar label="Audience fit" value={sponsor.fit.audienceFit} />
              <FitBar label="Activation fit" value={sponsor.fit.activationFit} />
              <FitBar label="Swiss presence" value={sponsor.fit.swissPresence} />
              <FitBar label="Brand positioning" value={sponsor.fit.brandPositioning} />
              <FitBar label="Budget potential" value={sponsor.fit.budgetPotential} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activation opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sponsor.research.activationOpportunities.map((a) => (
                  <li key={a} className="rounded-lg bg-surface-2 px-3 py-2 text-sm">
                    {a}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <SponsorWorkspace sponsor={sponsor} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{sponsor.research.contactPerson.name}</p>
              <p className="text-muted-foreground">{sponsor.research.contactPerson.role}</p>
              <p className="flex items-center gap-1.5 pt-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {sponsor.research.contactPerson.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested package</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{sponsor.research.suggestedPackage}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Next action</p>
              <p className="text-sm">{sponsor.nextAction}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <Why>{sponsor.aiRecommendation}</Why>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication history</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversation logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((c) => (
                    <div key={c.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={c.classification} />
                        <span className="text-xs text-muted-foreground">{timeAgo(c.lastMessageAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">&ldquo;{c.lastMessagePreview}&rdquo;</p>
                      <Link href="/conversations" className="mt-1 inline-block text-xs text-primary hover:underline">
                        View in inbox →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
