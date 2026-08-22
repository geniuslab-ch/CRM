import { ContentPlatform } from "@/types";

// Illustrative weekly content cadence shown on the Content Command
// Center as a suggested rhythm — not tied to any specific real content
// idea, so it has no dependency on live data.
export const CONTENT_CALENDAR = [
  { day: "Monday", title: "Player announcement", platform: "Instagram" as ContentPlatform },
  { day: "Wednesday", title: "Behind the scenes", platform: "Instagram" as ContentPlatform },
  { day: "Friday", title: "Player challenge", platform: "TikTok" as ContentPlatform },
  { day: "Saturday", title: "Tournament day live", platform: "Instagram" as ContentPlatform },
  { day: "Sunday", title: "Highlights recap", platform: "YouTube" as ContentPlatform },
];
