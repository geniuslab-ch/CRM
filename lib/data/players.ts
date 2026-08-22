import { Player, PlayerStatus } from "@/types";
import { makeRng, SWISS_CITIES } from "./seed";

const FIRST_NAMES = [
  "Lucas", "Noah", "Enzo", "Rayan", "Diego", "Kevin", "Mateo", "Liam",
  "Yanis", "Dario", "Nico", "Tim", "Elias", "Adrian", "Milo", "Luca",
  "Samuel", "Gabriel", "Kylian", "Amir", "Jonas", "Marco", "Leandro", "Igor",
  "Fabio", "Yohan", "Bruno", "Sami", "Timo", "Aleksander", "Rafael", "Dennis",
  "Nathan", "Théo", "Mikael", "Oscar", "Iван", "Selim", "Arda", "Kofi",
  "Julian", "Xavi", "Ronaldo", "Andres", "Ismail", "Karim", "Bilal", "Emre",
  "Stefan", "Pascal",
];

const LAST_NAMES = [
  "Martin", "Dubois", "Rossi", "Keller", "Meyer", "Schmid", "Fernandez",
  "Costa", "Nguyen", "Traoré", "Bernasconi", "Perreira", "Kovac", "Aebischer",
  "Zurcher", "Baumann", "Sancho", "Diallo", "Yilmaz", "Cruz", "Weber",
  "Moreau", "Favre", "Gonzalez", "Berisha", "Odermatt", "Njoku", "Correia",
  "Bianchi", "Lombardi", "Roth", "Steiner", "Da Silva", "Petrov", "Ilic",
  "Camara", "Hodel", "Marti", "Cabral", "Demir", "Alvarez", "Wyss", "Rey",
  "Amato", "Karlsson", "Boubaker", "Freitas", "Lopes", "Herzog", "Pinto",
];

const CLUBS = [
  "FC Lausanne", "Servette FC", "FC Zurich", "Young Boys", "FC Basel",
  "Neuchâtel Xamax", "FC Sion", "Lugano FC", "FC Thun", "Yverdon Sport",
  "Stade Nyonnais", "FC Vevey", "Meyrin FC", "Ecublens FC", null, null,
  "Urban Panna Crew", "Street Kings Geneva", "Freestyle Basel", "FC Bulle",
];

const POSITIONS: Player["position"][] = [
  "Attacker", "Playmaker", "Freestyler", "Defender", "All-Round",
];

const STATUS_WEIGHTS: [PlayerStatus, number][] = [
  ["IDENTIFIED", 0.28],
  ["CONTACTED", 0.24],
  ["INTERESTED", 0.22],
  ["CONFIRMED", 0.18],
  ["DECLINED", 0.08],
];

function weightedStatus(rand: () => number): PlayerStatus {
  const r = rand();
  let acc = 0;
  for (const [status, weight] of STATUS_WEIGHTS) {
    acc += weight;
    if (r <= acc) return status;
  }
  return "IDENTIFIED";
}

function recommendationFor(score: number, status: PlayerStatus): { text: string; why: string } {
  if (status === "DECLINED") {
    return {
      text: "Not currently available — revisit next season.",
      why: "Player declined due to schedule conflict with club commitments.",
    };
  }
  if (score >= 88) {
    return {
      text: "High-priority recruitment target.",
      why: "Elite technical score combined with strong local audience — ideal marquee player for launch content.",
    };
  }
  if (score >= 75) {
    return {
      text: "Strong recruitment candidate.",
      why: "Solid all-round profile with competitive experience and reasonable social reach.",
    };
  }
  if (score >= 60) {
    return {
      text: "Worth a follow-up call.",
      why: "Promising technical ability; audience and experience still developing.",
    };
  }
  return {
    text: "Low priority — monitor only.",
    why: "Profile does not yet match the competitive bar for the confirmed roster.",
  };
}

export function generatePlayers(count = 50): Player[] {
  const rng = makeRng(1337);
  const players: Player[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name = "";
    do {
      name = `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const technical = rng.int(55, 99);
    const experience = rng.int(40, 98);
    const streetRelevance = rng.int(45, 99);
    const socialAudienceRaw = Math.round(Math.pow(rng.next(), 2.2) * 42000) + rng.int(50, 900);
    const socialAudienceScore = Math.min(100, Math.round(Math.log10(socialAudienceRaw + 1) * 22));
    const localRelevance = rng.int(50, 99);
    const competitivePotential = rng.int(50, 99);

    const playerScore = Math.round(
      technical * 0.25 +
        experience * 0.18 +
        streetRelevance * 0.22 +
        socialAudienceScore * 0.15 +
        localRelevance * 0.1 +
        competitivePotential * 0.1
    );

    const status = weightedStatus(rng.next);
    const { text, why } = recommendationFor(playerScore, status);

    players.push({
      id: `player-${i + 1}`,
      name,
      age: rng.int(17, 34),
      city: rng.pick([...SWISS_CITIES]),
      club: rng.pick(CLUBS),
      position: rng.pick(POSITIONS),
      playerScore,
      scoreBreakdown: {
        technical,
        experience,
        streetRelevance,
        socialAudience: socialAudienceScore,
        localRelevance,
        competitivePotential,
      },
      socialAudience: socialAudienceRaw,
      status,
      lastContact: status === "IDENTIFIED" ? null : rng.daysAgoISO(45, 0),
      aiRecommendation: text,
      aiWhy: why,
      avatarSeed: `${i}-${name}`,
      ageGroup: null,
      contactEmail: null,
      contactPhone: null,
      instagram: null,
      tiktok: null,
      signupNote: null,
      signupSource: null,
      positionNote: null,
    });
  }

  return players.sort((a, b) => b.playerScore - a.playerScore);
}

export const players = generatePlayers(50);
