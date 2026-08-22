import { Club, ClubPotential, ClubStatus } from "@/types";
import { makeRng, SWISS_CITIES } from "./seed";

const CLUB_NAMES = [
  "FC Lausanne-Sport", "Servette FC", "FC Zurich", "BSC Young Boys",
  "FC Basel 1893", "Neuchâtel Xamax FCS", "FC Sion", "FC Lugano",
  "FC Thun", "Yverdon Sport FC", "Stade Nyonnais", "FC Vevey Sports",
  "Meyrin FC", "Ecublens FC", "FC Fribourg", "FC Bulle",
  "Urban Panna Crew Geneva", "Street Kings Basel", "Freestyle Zurich",
  "FC Montreux Sports", "Old Boys Basel", "FC Wohlen", "Rapperswil-Jona FC",
  "FC Schaffhausen", "Kriens FC",
];

const STATUS_FLOW: ClubStatus[] = [
  "IDENTIFIED", "CONTACTED", "INTERESTED", "PLAYERS_PROPOSED", "CONFIRMED", "PARTNER",
];

const CONTACT_FIRST = ["Sandra", "Marc", "Julie", "David", "Elena", "Patrick", "Nadia", "Thomas", "Chiara", "Reto"];
const CONTACT_LAST = ["Keller", "Rochat", "Meier", "Blanc", "Huber", "Perret", "Gerber", "Vogel", "Widmer", "Cattaneo"];

export function generateClubs(count = 20): Club[] {
  const rng = makeRng(2024);
  const usedNames = rng.pickMultiple(CLUB_NAMES, Math.min(count, CLUB_NAMES.length));
  const clubs: Club[] = [];

  for (let i = 0; i < count; i++) {
    const name = usedNames[i] ?? `${rng.pick(SWISS_CITIES)} Panna Club`;
    const statusIdx = Math.min(
      STATUS_FLOW.length - 1,
      Math.floor(Math.pow(rng.next(), 1.4) * STATUS_FLOW.length)
    );
    const status = STATUS_FLOW[statusIdx];
    const potential: ClubPotential = rng.pick(["LOW", "MEDIUM", "HIGH", "HIGH", "MEDIUM"]);
    const city = rng.pick([...SWISS_CITIES]);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");

    clubs.push({
      id: `club-${i + 1}`,
      name,
      city,
      contactName: `${rng.pick(CONTACT_FIRST)} ${rng.pick(CONTACT_LAST)}`,
      contactEmail: `marketing@${slug || "club"}.ch`,
      website: `https://www.${slug || "club"}.ch`,
      playersIdentified: rng.int(1, 9),
      status,
      potential,
      lastContact: status === "IDENTIFIED" ? null : rng.daysAgoISO(60, 0),
      engagementType:
        status === "PARTNER" || status === "CONFIRMED"
          ? rng.pick(["BOTH", "COMMERCIAL_PARTNERSHIP", "BOTH"])
          : "PLAYER_RECRUITMENT",
      aiNote:
        status === "IDENTIFIED"
          ? "Not yet contacted — queued for player scouting outreach."
          : status === "CONTACTED"
          ? "Awaiting response on player recruitment introduction."
          : status === "INTERESTED"
          ? "Open to proposing players — sequencing candidate shortlist."
          : status === "PLAYERS_PROPOSED"
          ? "Candidate players shared — awaiting club confirmation."
          : status === "CONFIRMED"
          ? "Players confirmed for the roster. Commercial conversation not yet opened."
          : "Full club partner — commercial + player pipeline both active.",
      contactPhone: null,
      organisationType: null,
      instagram: null,
      tiktok: null,
      inquiryMessage: null,
      signupSource: null,
    });
  }

  return clubs;
}

export const clubs = generateClubs(20);
