export * from "./players";
export * from "./clubs";
export * from "./sponsors";
export * from "./conversations";
export * from "./content";
export * from "./meetings";
export * from "./agents";
export * from "./event";
export * from "./brand";

import { players } from "./players";
import { clubs } from "./clubs";
import { sponsors } from "./sponsors";
import { contentOpportunities } from "./content";
import { meetings } from "./meetings";
import { pannaEvent } from "./event";

export function getDashboardKpis() {
  const sponsorsWon = sponsors.filter((s) => s.stage === "WON").length;
  const sponsorPipeline = sponsors
    .filter((s) => !["LOST", "WON"].includes(s.stage))
    .reduce((sum, s) => sum + s.potentialValue, 0);
  const clubPartners = clubs.filter((c) => c.status === "CONFIRMED" || c.status === "PARTNER").length;
  const publishedContent = contentOpportunities.filter((c) => c.status === "PUBLISHED").length;

  return {
    playersConfirmed: pannaEvent.playersConfirmed,
    playerTarget: pannaEvent.playerTarget,
    sponsorsConfirmed: Math.max(sponsorsWon, pannaEvent.sponsorsConfirmed),
    sponsorPipeline: Math.max(sponsorPipeline, pannaEvent.commercialPipeline),
    clubPartners: Math.max(clubPartners, pannaEvent.clubsConfirmed),
    meetings: meetings.length,
    digitalReach: pannaEvent.estimatedReach,
    digitalTarget: pannaEvent.digitalAudienceTarget,
    contentPublished: Math.max(publishedContent, 12),
    aiHoursSaved: 146,
    playersTotal: players.length,
    clubsTotal: clubs.length,
    sponsorsTotal: sponsors.length,
  };
}
