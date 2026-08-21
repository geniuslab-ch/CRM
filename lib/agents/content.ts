// Content Agent
// Maps event activity triggers to content formats. Templates live in
// lib/data/content.ts (generateContentOpportunities). This module holds
// the trigger → platform mapping used for the live "Run AI Team" and
// future real-time content suggestions.

export const TRIGGER_PLATFORM_MAP: Record<string, string> = {
  "Player wins a panna": "TikTok",
  "Player confirmed for roster": "Instagram",
  "Semi-final confirmed": "Instagram",
  "Sponsor activation": "Instagram",
  "Final result": "YouTube",
  "Player highlight": "TikTok",
  "Behind the scenes": "Instagram",
  "Player challenge": "TikTok",
  "Club partnership announced": "LinkedIn",
  "Tournament day": "Instagram",
};
