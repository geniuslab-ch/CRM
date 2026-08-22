import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { EditClubDialog } from "@/components/clubs/edit-club-dialog";
import { DeleteClubButton } from "@/components/clubs/delete-club-button";
import { ClubOutreach } from "@/components/clubs/club-outreach";
import { BookingWidget } from "@/components/booking/booking-widget";
import { getClubs } from "@/lib/supabase/repository";
import { timeAgo } from "@/lib/utils";

// No generateStaticParams — clubs come from a live database that
// changes independently of build time, so every request renders fresh.
export const dynamic = "force-dynamic";

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const { data: clubs, source } = await getClubs();
  const club = clubs.find((c) => c.id === params.id);
  if (!club) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/clubs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Club Database
        </Link>
        <div className="flex items-center gap-2">
          <DataSourceBadge source={source} />
          <EditClubDialog club={club} />
          <DeleteClubButton id={club.id} name={club.name} />
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{club.name}</h1>
              <StatusBadge status={club.status} />
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {club.city}
              {club.organisationType ? ` · ${club.organisationType}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Potential</p>
            <StatusBadge status={club.potential} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Club information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Engagement</dt>
                  <dd className="mt-0.5">
                    <Badge variant={club.engagementType === "PLAYER_RECRUITMENT" ? "info" : "accent"}>
                      {club.engagementType === "PLAYER_RECRUITMENT"
                        ? "Player recruitment"
                        : club.engagementType === "BOTH"
                        ? "Recruitment + partnership"
                        : "Commercial partnership"}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Players identified</dt>
                  <dd className="mt-0.5">{club.playersIdentified}</dd>
                </div>
                {club.website && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Website</dt>
                    <dd className="mt-0.5">
                      <a href={club.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {club.website.replace("https://", "")}
                      </a>
                    </dd>
                  </div>
                )}
                {club.instagram && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Instagram</dt>
                    <dd className="mt-0.5">{club.instagram}</dd>
                  </div>
                )}
                {club.tiktok && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">TikTok</dt>
                    <dd className="mt-0.5">{club.tiktok}</dd>
                  </div>
                )}
              </dl>
              {club.inquiryMessage && (
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Their message</p>
                  <p className="mt-1 rounded-lg bg-surface-2 px-3 py-2">&ldquo;{club.inquiryMessage}&rdquo;</p>
                </div>
              )}
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">AI note</p>
                <p className="mt-1">{club.aiNote}</p>
              </div>
            </CardContent>
          </Card>

          <ClubOutreach club={club} />
          <BookingWidget
            contactName={club.contactName}
            contactEmail={club.contactEmail}
            organization={club.name}
            category="CLUB"
            relatedId={club.id}
            bookingCategory="club"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{club.contactName}</p>
              <p className="flex items-center gap-1.5 pt-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {club.contactEmail}
              </p>
              {club.contactPhone && (
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {club.contactPhone}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Last contact</p>
              <p>{club.lastContact ? timeAgo(club.lastContact) : "Not yet contacted"}</p>
              {club.signupSource && (
                <>
                  <p className="pt-2 text-xs uppercase tracking-wide text-muted-foreground">Source</p>
                  <p>{club.signupSource}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
