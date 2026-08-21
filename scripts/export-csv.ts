// Generates Supabase-import-ready CSVs from the demo data generators —
// an alternative to `npm run supabase:seed` for anyone who'd rather use
// Supabase's Table Editor "Import data from CSV" button than a terminal.
// Column headers match lib/supabase/schema.sql exactly.
//
// Usage:
//   npx tsx scripts/export-csv.ts [outDir]

import fs from "node:fs";
import path from "node:path";
import { players } from "../lib/data/players";
import { clubs } from "../lib/data/clubs";
import { sponsors } from "../lib/data/sponsors";

const outDir = process.argv[2] ?? "csv-export";
fs.mkdirSync(outDir, { recursive: true });

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : JSON.stringify(value);
  if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
  return str;
}

function writeCsv(filename: string, headers: string[], rows: unknown[][]) {
  const lines = [headers.join(","), ...rows.map((row) => row.map(csvCell).join(","))];
  fs.writeFileSync(path.join(outDir, filename), lines.join("\n"), "utf-8");
  console.log(`Wrote ${rows.length} rows to ${path.join(outDir, filename)}`);
}

writeCsv(
  "players.csv",
  [
    "id", "name", "age", "city", "club", "position", "player_score", "score_breakdown",
    "social_audience", "status", "last_contact", "ai_recommendation", "ai_why", "avatar_seed",
  ],
  players.map((p) => [
    p.id, p.name, p.age, p.city, p.club, p.position, p.playerScore, p.scoreBreakdown,
    p.socialAudience, p.status, p.lastContact, p.aiRecommendation, p.aiWhy, p.avatarSeed,
  ])
);

writeCsv(
  "clubs.csv",
  [
    "id", "name", "city", "contact_name", "contact_email", "website", "players_identified",
    "status", "potential", "last_contact", "engagement_type", "ai_note",
  ],
  clubs.map((c) => [
    c.id, c.name, c.city, c.contactName, c.contactEmail, c.website, c.playersIdentified,
    c.status, c.potential, c.lastContact, c.engagementType, c.aiNote,
  ])
);

writeCsv(
  "sponsors.csv",
  [
    "id", "name", "category", "city", "fit", "fit_why", "potential_value", "stage",
    "last_activity", "last_activity_date", "next_action", "research", "ai_recommendation",
  ],
  sponsors.map((s) => [
    s.id, s.name, s.category, s.city, s.fit, s.fitWhy, s.potentialValue, s.stage,
    s.lastActivity, s.lastActivityDate, s.nextAction, s.research, s.aiRecommendation,
  ])
);
