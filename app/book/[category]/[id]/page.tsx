import { notFound } from "next/navigation";
import { getSponsors, getClubs } from "@/lib/supabase/repository";
import { PublicBookingWidget } from "@/components/booking/public-booking-widget";

export const dynamic = "force-dynamic";

export default async function PublicBookingPage({ params }: { params: { category: string; id: string } }) {
  if (params.category !== "sponsor" && params.category !== "club") notFound();

  let organization: string;
  let defaultName: string;

  if (params.category === "sponsor") {
    const { data: sponsors } = await getSponsors();
    const sponsor = sponsors.find((s) => s.id === params.id);
    if (!sponsor) notFound();
    organization = sponsor.name;
    defaultName = sponsor.research.contactPerson.name;
  } else {
    const { data: clubs } = await getClubs();
    const club = clubs.find((c) => c.id === params.id);
    if (!club) notFound();
    organization = club.name;
    defaultName = club.contactName;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <PublicBookingWidget
        organization={organization}
        category={params.category === "sponsor" ? "SPONSOR" : "CLUB"}
        relatedId={params.id}
        defaultName={defaultName}
      />
    </div>
  );
}
