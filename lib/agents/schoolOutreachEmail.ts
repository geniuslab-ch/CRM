import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { Club } from "@/types";

// School outreach email generator — deliberately a different creative
// brief from clubChallengeEmail.ts, not just a reskin. A school (PE
// teacher / sport coordinator / administration) needs a credible,
// institution-appropriate pitch, not a "does your club have what it
// takes" street challenge aimed at a coach — that tone reads as
// unserious or even inappropriate to a school contact. Keep its
// structure and avoid-list intact when editing.

function isConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
export { isConfigured as isSchoolOutreachEmailConfigured };

function client(): Anthropic {
  return new Anthropic();
}
function model(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
}
function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
function extractJsonObject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return {};
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
function str(v: Record<string, unknown>, key: string): string {
  const val = v[key];
  return typeof val === "string" ? val.trim() : "";
}
function strArray(v: Record<string, unknown>, key: string): string[] {
  const val = v[key];
  if (!Array.isArray(val)) return [];
  return val.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);
}

const REGISTRATION_LINK_TOKEN = "[REGISTRATION_LINK]";

const SYSTEM_PROMPT = [
  "Tu es le responsable marketing et copywriting de PANNA LEAGUE, une nouvelle compétition de Panna Football",
  "(1v1) lancée à Lausanne en 2026.",
  "",
  "CONTEXTE : Panna League organise sa première édition à Lausanne. Objectif : 32 joueurs, 1 seul champion. Il",
  "n'existe encore AUCUN champion — c'est la première édition. Nous contactons des établissements scolaires pour",
  "faire connaître la compétition à leurs élèves — pas des clubs de football. Chaque établissement reçoit un lien",
  "d'inscription personnalisé — les inscriptions provenant de ce lien sont automatiquement rattachées à",
  "l'établissement. Une affiche avec QR code est jointe au mail, à afficher dans le préau, la salle de sport ou le",
  "couloir.",
  "",
  "DESTINATAIRE : un·e enseignant·e d'éducation physique, un·e coordinateur/coordinatrice sportif/ve, ou la",
  "direction de l'établissement — PAS un coach de club. Le ton doit rester crédible et institutionnellement",
  "approprié : énergique et moderne, mais jamais familier au point de sembler déplacé pour une école. Contrairement",
  "à l'approche utilisée avec les clubs de football (qui évite le mot « partenariat »), ici tu PEUX parler de",
  "collaboration ou de faire connaître l'événement aux élèves — c'est attendu et rassurant pour une école.",
  "",
  "CE QU'ON DEMANDE CONCRÈTEMENT (à choisir/combiner selon ce qui semble le plus naturel) : (a) relayer",
  "l'information à leurs élèves intéressés par le foot/le 1v1, (b) suggérer leurs élèves les plus doués en 1v1 si",
  "un·e enseignant·e en voit, (c) afficher le poster fourni dans la salle de sport ou le préau. AUCUN engagement",
  "n'est demandé, aucune organisation d'événement de la part de l'école, aucune démarche administrative lourde —",
  "précise-le si utile pour lever une objection implicite (« aucune organisation nécessaire de votre part »).",
  "",
  "TON : énergique, moderne, street football premium, mais respectueux du cadre scolaire — pas de provocation, pas",
  "de tutoiement agressif façon « à vous de jouer », pas de langage de challenge compétitif adressé à",
  "l'établissement. Le ton s'adresse à un·e adulte responsable d'élèves, pas à un coach cherchant un champion.",
  "",
  "ÉVITER ABSOLUMENT : jargon administratif lourd (« Nous avons le plaisir de... », « Nous vous prions de bien",
  "vouloir... »), longues explications institutionnelles de Panna League, prétendre qu'il existe déjà un champion,",
  "prétendre que les 32 joueurs sont déjà sélectionnés, ton de challenge sportif agressif adressé à l'école elle-",
  "même, demander un engagement ou une contrepartie financière.",
  "",
  "STRUCTURE DU MAIL : (1) OUVERTURE — une phrase claire qui situe le sujet (nouvelle compétition 1v1 à Lausanne,",
  "première édition) ; (2) POURQUOI CETTE ÉCOLE — 1-2 phrases sur l'intérêt de faire connaître l'opportunité aux",
  "élèves passionnés de foot ; (3) CE QU'ON DEMANDE — clair et minimal (relayer l'info / afficher le poster /",
  "suggérer des élèves doués), en précisant qu'aucune organisation n'est requise de leur part ; (4) LE LIEN —",
  `utilise le jeton exact ${REGISTRATION_LINK_TOKEN} précédé d'un CTA clair (ex. « 👉 Voici le lien à partager ») ;`,
  "(5) mentionner l'affiche jointe avec QR code, à afficher dans la salle de sport ou le préau ; (6) CLÔTURE —",
  "une phrase brève et chaleureuse, disponibilité pour toute question.",
  "",
  `IMPORTANT SUR LE LIEN : utilise TOUJOURS exactement le jeton ${REGISTRATION_LINK_TOKEN} pour représenter le lien`,
  "d'inscription — ne l'invente jamais, ne le modifie jamais, ne l'écris jamais toi-même en toutes lettres (il sera",
  "remplacé automatiquement par le vrai lien après génération).",
  "",
  "MAXIMUM 160-200 mots pour le mail — clair et lisible en moins de 30 secondes, sans être sec ou impersonnel.",
  "",
  "PERSONNALISATION : si une information pertinente sur l'établissement est fournie, utilise-la subtilement — ne",
  "force jamais la personnalisation. NE PAS INVENTER d'information sur l'établissement (nombre d'élèves, filières,",
  "résultats sportifs). Si une donnée (date, lieu précis) n'est pas fournie, ne l'invente pas — omets-la.",
  "",
  "OBJETS : propose exactement 3 objets courts, clairs et professionnels (pas provocateurs comme pour les clubs).",
  "",
  "TEXTE COURT POUR L'AFFICHE / SALLE DE SPORT : plus court que l'email, doit fonctionner affiché seul (style :",
  "« PANNA LEAGUE. Le premier 1v1 de rue à Lausanne. 32 joueurs, 1 champion. Scanne et inscris-toi. »).",
].join("\n");

export interface SchoolOutreachEmail {
  subjects: string[];
  email: string;
  posterText: string;
}

export async function generateSchoolOutreachEmail(school: Club, registrationUrl: string): Promise<SchoolOutreachEmail> {
  const facts = [`SCHOOL_NAME: ${school.name}`, `CITY: ${school.city}`, "EVENT_LOCATION: Lausanne"];
  if (school.contactName) facts.push(`CONTACT_NAME: ${school.contactName}`);
  const context = school.inquiryMessage;
  if (context) facts.push(`SCHOOL_CONTEXT: ${context}`);
  facts.push("EVENT_DATE: non communiquée — ne pas mentionner de date précise.");

  const user = [
    "Informations disponibles pour cet établissement scolaire :",
    facts.join("\n"),
    "",
    `Utilise ${REGISTRATION_LINK_TOKEN} comme jeton pour le lien d'inscription — ne l'invente pas, ne le modifie pas.`,
    "",
    'Retourne UNIQUEMENT un objet JSON (pas de balises markdown, pas d\'autre texte), de cette forme :',
    `{"subjects": [string, string, string], "email": string, "posterText": string}`,
    `email doit contenir le jeton ${REGISTRATION_LINK_TOKEN} exactement une fois, à l'endroit du CTA.`,
    "email ne doit pas commencer par un placeholder de salutation générique — commence directement par le sujet.",
  ].join("\n");

  const response = await client().messages.create({
    model: model(),
    max_tokens: 1400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: user }],
  });

  const raw = extractJsonObject(extractText(response));
  const subjects = strArray(raw, "subjects");
  const email = str(raw, "email");
  const posterText = str(raw, "posterText");
  if (!email || subjects.length < 3) {
    throw new Error("Couldn't generate a usable outreach email — try again.");
  }

  return {
    subjects: subjects.slice(0, 3),
    email: email.split(REGISTRATION_LINK_TOKEN).join(registrationUrl),
    posterText,
  };
}
