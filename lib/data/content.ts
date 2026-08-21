import { ContentOpportunity, ContentPlatform, ContentStatus } from "@/types";
import { makeRng } from "./seed";
import { players } from "./players";
import { sponsors } from "./sponsors";

interface ContentTemplate {
  trigger: string;
  platform: ContentPlatform;
  titleTemplate: string;
  hook: string;
  caption: string;
  cta: string;
  footage: string;
  sponsorIntegration: boolean;
}

const TEMPLATES: ContentTemplate[] = [
  {
    trigger: "Player wins a panna",
    platform: "TikTok",
    titleTemplate: "{name} nutmegs his way to the top",
    hook: "He didn't even look up.",
    caption: "Panna of the day 🔥 {name} embarrassing defenders at Panna League Switzerland.",
    cta: "Follow for daily pannas.",
    footage: "Slow-motion panna clip + crowd reaction",
    sponsorIntegration: false,
  },
  {
    trigger: "Player confirmed for roster",
    platform: "Instagram",
    titleTemplate: "{name} is in the roster",
    hook: "32 players. One winner.",
    caption: "Welcome {name} to Panna League Switzerland 🇨🇭⚽ The roster is filling up fast.",
    cta: "See who else is playing — link in bio.",
    footage: "Player portrait + club badge overlay",
    sponsorIntegration: false,
  },
  {
    trigger: "Semi-final confirmed",
    platform: "Instagram",
    titleTemplate: "The semi-finals are set",
    hook: "4 players left. 1 trophy.",
    caption: "The road to the final starts now. Who takes it all?",
    cta: "Vote for your favorite in our story poll.",
    footage: "Bracket graphic animation",
    sponsorIntegration: true,
  },
  {
    trigger: "Sponsor activation",
    platform: "Instagram",
    titleTemplate: "{sponsor} x Panna League",
    hook: "When street football meets {sponsor}.",
    caption: "Big thanks to {sponsor} for powering today's activation zone.",
    cta: "Tag a friend who needs to see this.",
    footage: "Branded activation zone b-roll",
    sponsorIntegration: true,
  },
  {
    trigger: "Final result",
    platform: "YouTube",
    titleTemplate: "Panna League Switzerland — Final Recap",
    hook: "One city. One champion.",
    caption: "Full recap of an unforgettable day of street football.",
    cta: "Subscribe for the next event.",
    footage: "Full-day highlight edit, 3–5 minutes",
    sponsorIntegration: true,
  },
  {
    trigger: "Player highlight",
    platform: "TikTok",
    titleTemplate: "{name}'s best moves",
    hook: "This is why {name} made the roster.",
    caption: "Skills for days. {name} bringing the heat at Panna League.",
    cta: "Drop a 🔥 if you'd get pannad by this.",
    footage: "Compilation of best individual clips",
    sponsorIntegration: false,
  },
  {
    trigger: "Behind the scenes",
    platform: "Instagram",
    titleTemplate: "Building the cage",
    hook: "48 hours before kickoff.",
    caption: "Behind the scenes setting up Panna League Switzerland.",
    cta: "Follow along all week.",
    footage: "Time-lapse of venue build",
    sponsorIntegration: false,
  },
  {
    trigger: "Player challenge",
    platform: "TikTok",
    titleTemplate: "Can you panna {name}?",
    hook: "We challenged our #1 seed. It didn't go well.",
    caption: "Street challenge series presented by Panna League.",
    cta: "Comment your prediction.",
    footage: "1v1 challenge mini-game footage",
    sponsorIntegration: true,
  },
  {
    trigger: "Club partnership announced",
    platform: "LinkedIn",
    titleTemplate: "Panna League partners with a leading Swiss club",
    hook: "Grassroots meets professional football.",
    caption: "Proud to announce a new club partnership ahead of Panna League Switzerland.",
    cta: "Read more about our partner program.",
    footage: "Club logo + handshake / signing photo",
    sponsorIntegration: false,
  },
  {
    trigger: "Tournament day",
    platform: "Instagram",
    titleTemplate: "Live from the cage",
    hook: "It's game day.",
    caption: "We're live! Follow our story for real-time results.",
    cta: "Tap the link to watch the stream.",
    footage: "Live stream teaser + venue shots",
    sponsorIntegration: true,
  },
];

const STATUS_WEIGHTS: ContentStatus[] = ["IDEA", "IDEA", "READY", "READY", "SCHEDULED", "PUBLISHED"];

export function generateContentOpportunities(count = 20): ContentOpportunity[] {
  const rng = makeRng(5150);
  const opportunities: ContentOpportunity[] = [];

  for (let i = 0; i < count; i++) {
    const t = TEMPLATES[i % TEMPLATES.length];
    const player = rng.pick(players.slice(0, 20));
    const sponsor = rng.pick(sponsors.filter((s) => s.stage === "WON" || s.stage === "NEGOTIATION"));
    const status = rng.pick(STATUS_WEIGHTS);

    const title = t.titleTemplate.replace("{name}", player.name).replace("{sponsor}", sponsor?.name ?? "our partner");
    const caption = t.caption.replace("{name}", player.name).replace("{sponsor}", sponsor?.name ?? "our partner");
    const hook = t.hook.replace("{name}", player.name).replace("{sponsor}", sponsor?.name ?? "our partner");

    opportunities.push({
      id: `content-${i + 1}`,
      title,
      platform: t.platform,
      trigger: t.trigger,
      hook,
      caption,
      cta: t.cta,
      suggestedFootage: t.footage,
      sponsorIntegration: t.sponsorIntegration && sponsor ? `${sponsor.name} — logo placement + shoutout` : null,
      status,
      scheduledDate: status === "SCHEDULED" || status === "PUBLISHED" ? rng.daysAgoISO(30, -14) : null,
      performance:
        status === "PUBLISHED"
          ? {
              views: rng.int(800, 42000),
              engagementRate: Math.round((rng.int(20, 140) / 10) * 10) / 10,
            }
          : null,
    });
  }

  return opportunities;
}

export const contentOpportunities = generateContentOpportunities(20);

export const CONTENT_CALENDAR = [
  { day: "Monday", title: "Player announcement", platform: "Instagram" as ContentPlatform },
  { day: "Wednesday", title: "Behind the scenes", platform: "Instagram" as ContentPlatform },
  { day: "Friday", title: "Player challenge", platform: "TikTok" as ContentPlatform },
  { day: "Saturday", title: "Tournament day live", platform: "Instagram" as ContentPlatform },
  { day: "Sunday", title: "Highlights recap", platform: "YouTube" as ContentPlatform },
];
