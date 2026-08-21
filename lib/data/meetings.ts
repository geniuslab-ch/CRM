import { Meeting } from "@/types";
import { makeRng } from "./seed";
import { sponsors } from "./sponsors";
import { clubs } from "./clubs";

const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export function generateMeetings(count = 10): Meeting[] {
  const rng = makeRng(7070);
  const meetings: Meeting[] = [];

  const sponsorCandidates = sponsors.filter((s) =>
    ["MEETING", "PROPOSAL", "NEGOTIATION", "WON"].includes(s.stage)
  );
  const clubCandidates = clubs.filter((c) => c.status !== "IDENTIFIED");

  for (let i = 0; i < count; i++) {
    const useSponsor = i < 7 && sponsorCandidates.length > 0;
    const daysOffset = rng.int(-10, 12); // negative = future

    if (useSponsor) {
      const s = rng.pick(sponsorCandidates);
      meetings.push({
        id: `meeting-${i + 1}`,
        withName: s.research.contactPerson.name,
        organization: s.name,
        category: "SPONSOR",
        relatedId: s.id,
        date: rng.daysAgoISO(Math.max(daysOffset, daysOffset), Math.min(daysOffset, daysOffset)),
        time: rng.pick(TIMES),
        durationMinutes: rng.pick([15, 30, 30, 45]),
        status: daysOffset < 0 ? rng.pick(["CONFIRMED", "PROPOSED"]) : rng.pick(["COMPLETED", "CANCELLED", "COMPLETED"]),
        agenda: `Sponsorship discussion — ${s.research.suggestedPackage}`,
      });
    } else {
      const c = rng.pick(clubCandidates);
      meetings.push({
        id: `meeting-${i + 1}`,
        withName: c.contactName,
        organization: c.name,
        category: "CLUB",
        relatedId: c.id,
        date: rng.daysAgoISO(Math.max(daysOffset, daysOffset), Math.min(daysOffset, daysOffset)),
        time: rng.pick(TIMES),
        durationMinutes: rng.pick([15, 30]),
        status: daysOffset < 0 ? rng.pick(["CONFIRMED", "PROPOSED"]) : "COMPLETED",
        agenda: "Player recruitment & roster discussion",
      });
    }
  }

  return meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const meetings = generateMeetings(10);
