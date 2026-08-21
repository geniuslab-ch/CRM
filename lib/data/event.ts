import { PannaEvent } from "@/types";
import { players } from "./players";
import { clubs } from "./clubs";
import { sponsors } from "./sponsors";

const playersConfirmed = players.filter((p) => p.status === "CONFIRMED").length;
const clubsConfirmed = clubs.filter((c) => c.status === "CONFIRMED" || c.status === "PARTNER").length;
const sponsorsConfirmed = sponsors.filter((s) => s.stage === "WON").length;
const commercialPipeline = sponsors
  .filter((s) => !["LOST", "WON"].includes(s.stage))
  .reduce((sum, s) => sum + s.potentialValue, 0);

export const pannaEvent: PannaEvent = {
  id: "event-lausanne-1",
  name: "Panna League — Lausanne",
  city: "Lausanne",
  date: null,
  venue: null,
  status: "PRE_LAUNCH",
  playerTarget: 32,
  playersConfirmed: Math.max(playersConfirmed, 24),
  clubTarget: 10,
  clubsConfirmed: Math.max(clubsConfirmed, 7),
  sponsorTarget: 8,
  sponsorsConfirmed: Math.max(sponsorsConfirmed, 2),
  digitalAudienceTarget: 10000,
  estimatedReach: 6400,
  commercialPipeline: Math.max(commercialPipeline, 38000),
  checklist: [
    { id: "chk-1", label: "32 players confirmed", done: false },
    { id: "chk-2", label: "Venue confirmed", done: false },
    { id: "chk-3", label: "Insurance secured", done: false },
    { id: "chk-4", label: "Referees booked", done: true },
    { id: "chk-5", label: "Equipment ordered", done: true },
    { id: "chk-6", label: "Sponsors confirmed", done: false },
    { id: "chk-7", label: "Branding finalized", done: true },
    { id: "chk-8", label: "Photographer booked", done: true },
    { id: "chk-9", label: "Videographer booked", done: false },
    { id: "chk-10", label: "Social content pipeline ready", done: true },
    { id: "chk-11", label: "Tournament bracket built", done: false },
    { id: "chk-12", label: "Streaming setup confirmed", done: false },
    { id: "chk-13", label: "Prize secured", done: true },
    { id: "chk-14", label: "Post-event content plan ready", done: false },
  ],
};
