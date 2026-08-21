import { Sponsor, SponsorshipTier } from "@/types";

export function generateProposalTier(sponsor: Sponsor): SponsorshipTier {
  const tierName =
    sponsor.potentialValue >= 15000 ? "Title Sponsor" : sponsor.potentialValue >= 8000 ? "Co-Sponsor" : "Activation Partner";

  return {
    id: `${sponsor.id}-proposal`,
    name: tierName,
    tagline: `Official Panna League ${tierName === "Title Sponsor" ? "Partner" : "Sponsor"}`,
    benefits:
      tierName === "Title Sponsor"
        ? [
            "Naming rights on event branding",
            "Premium brand visibility on-site and online",
            "Social media integration across all channels",
            "Dedicated player content collaboration",
            "On-site activation zone",
            "Digital content package (Reels, TikToks, recap video)",
            "Priority audience exposure across the launch campaign",
          ]
        : tierName === "Co-Sponsor"
        ? [
            "Co-branded event signage",
            "Social media shoutouts across launch campaign",
            "Activation zone at the event",
            "Inclusion in recap and highlight content",
            "Logo placement on livestream",
          ]
        : [
            "On-site activation zone",
            "Logo placement in select content",
            "Mention in event recap content",
          ],
    estimatedValue: sponsor.potentialValue,
  };
}
