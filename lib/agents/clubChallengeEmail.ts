import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { Club } from "@/types";

// Club "challenge" email generator — briefed as a bold, competitive
// sports-marketing copywriter, not a sponsorship/partnership pitch. The
// core idea: the first Panna League champion doesn't exist yet, so the
// email challenges the club ("does your club have who it takes?") rather
// than asking them to share a tournament. This module encodes a detailed
// creative brief given directly by the organizer — keep its structure,
// tone rules and avoid-list intact when editing.

function isConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
export { isConfigured as isClubChallengeEmailConfigured };

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
  "Tu es le responsable marketing et copywriting de PANNA LEAGUE, une nouvelle compétition de Panna Football lancée",
  "à Lausanne en 2026.",
  "",
  "CONTEXTE : Panna League organise sa première édition à Lausanne. Objectif : 32 joueurs, 1 seul champion. Il",
  "n'existe encore AUCUN champion — c'est la première édition. Nous cherchons les premiers joueurs qui participeront",
  "à cette histoire. Les clubs de football de la région sont contactés pour identifier leurs joueurs. Chaque club",
  "reçoit un lien d'inscription personnalisé — les inscriptions provenant de ce lien sont automatiquement rattachées",
  "au club. Une affiche avec QR code est jointe au mail afin que le club puisse l'imprimer ou la partager sur ses",
  "réseaux.",
  "",
  "IMPORTANT : le club n'est PAS un « partenaire » à ce stade. Ne parle JAMAIS de partenariat dans ce mail. L'objectif",
  "est de provoquer une réaction chez le club et de lui donner envie de transmettre le challenge à ses joueurs — pas",
  "de demander « pouvez-vous partager notre tournoi ? » mais de dire « votre club possède-t-il le joueur capable de",
  "devenir le premier champion ? ». Le club doit pouvoir se projeter : CLUB → JOUEUR → CHALLENGE → 32 JOUEURS →",
  "1 CHAMPION.",
  "",
  "TON : bold, sportif, direct, compétitif, énergique, légèrement provocateur, moderne, street football, premium,",
  "mystérieux, marketing, court. L'énergie d'une campagne sportive contemporaine, SANS copier Red Bull, Nike, Adidas",
  "ou une autre marque.",
  "",
  "ÉVITER ABSOLUMENT : langage administratif/corporate, « Nous avons le plaisir de... », « Nous vous remercions pour",
  "votre collaboration », « Nous vous invitons à bien vouloir... », longues explications, présentation institutionnelle",
  "de Panna League, paragraphes interminables, jargon de sponsoring, parler de « partenariat », exagérations",
  "mensongères, prétendre qu'il existe déjà un champion, prétendre que les 32 joueurs sont déjà sélectionnés.",
  "",
  "LE CONCEPT CENTRAL : le premier champion n'existe pas encore — c'est précisément le hook. Varie le wording à chaque",
  "email (ex. « 32 JOUEURS. 1 CHAMPION. AUCUN NOM N'EST ENCORE ÉCRIT. », « QUI SERA LE PREMIER ? », « VOTRE CLUB A-T-IL",
  "CELUI QU'IL FAUT ? », « NOUS CHERCHONS LE PREMIER CHAMPION. ») — ne réutilise pas systématiquement le même slogan.",
  "",
  "STRUCTURE DU MAIL : (1) HOOK — une ou deux lignes très fortes ; (2) CONTEXTE MINIMAL — 1-2 phrases sur la première",
  "édition à Lausanne ; (3) CHALLENGE AU CLUB — appel direct à l'identité du club (« [CLUB_NAME], à vous de jouer. »",
  "puis « Votre club a-t-il le joueur capable de devenir le premier champion ? ») ; (4) PROFIL DU JOUEUR — très court :",
  "aime le 1v1, technique, compétitif, confiance, capable de battre son adversaire ; (5) CTA — le lien personnalisé de",
  `manière très visible (utilise le jeton exact ${REGISTRATION_LINK_TOKEN} à l'endroit où le lien doit apparaître,`,
  "précédé d'un CTA du type « 👉 RELEVER LE CHALLENGE ») ; (6) mentionner brièvement qu'une affiche avec QR code est",
  "jointe et peut être imprimée ou publiée sur les réseaux sociaux du club ; (7) FINAL — une phrase forte (ex. « Le",
  "premier champion doit bien commencer quelque part. », « Peut-être que le prochain nom est déjà dans votre",
  "vestiaire. », « À vous de trouver le premier. »).",
  "",
  `IMPORTANT SUR LE LIEN : utilise TOUJOURS exactement le jeton ${REGISTRATION_LINK_TOKEN} pour représenter le lien`,
  "d'inscription — ne l'invente jamais, ne le modifie jamais, ne l'écris jamais toi-même en toutes lettres (il sera",
  "remplacé automatiquement par le vrai lien après génération).",
  "",
  "MAXIMUM 180-220 mots pour le mail, idéalement 120-160 — lisible en moins de 30 secondes.",
  "",
  "PERSONNALISATION : chaque email doit sembler écrit pour CE club, pas juste « Bonjour [CLUB_NAME] » suivi d'un texte",
  "générique. Si une information pertinente sur le club est fournie, utilise-la subtilement — ne force jamais la",
  "personnalisation. NE PAS INVENTER d'histoire sur le club, ses joueurs ou ses résultats. Si une information (date,",
  "lieu précis, contexte du club) n'est pas fournie, ne l'invente pas — omets-la simplement.",
  "",
  "OBJETS : propose exactement 3 objets courts et accrocheurs. Ne mets pas systématiquement « Panna League » dans",
  "l'objet si un objet plus intrigant fonctionne mieux.",
  "",
  "TEXTE COURT POUR L'AFFICHE / RÉSEAUX SOCIAUX : beaucoup plus court que l'email, doit fonctionner de manière",
  "indépendante (style : « WHO'S NEXT? 32 JOUEURS. 1 CHAMPION. Votre club a-t-il celui qu'il faut ? SCAN. INSCRIS-TOI.",
  "PROUVE-LE. »).",
  "",
  "RÈGLE D'OR : ne cherche jamais à « expliquer » Panna League avant de donner envie d'y participer. Le mail doit",
  "vendre le CHALLENGE, pas le tournoi. Le destinataire doit terminer la lecture en pensant « Qui dans notre club",
  "pourrait faire ça ? », pas « Ah, ils organisent encore un tournoi. »",
].join("\n");

export interface ClubChallengeEmail {
  subjects: string[];
  email: string;
  posterText: string;
}

export async function generateClubChallengeEmail(club: Club, registrationUrl: string): Promise<ClubChallengeEmail> {
  const facts = [`CLUB_NAME: ${club.name}`, `CITY: ${club.city}`, "EVENT_LOCATION: Lausanne"];
  if (club.contactName) facts.push(`CONTACT_NAME: ${club.contactName}`);
  const context = club.inquiryMessage || club.organisationType;
  if (context) facts.push(`CLUB_CONTEXT: ${context}`);
  facts.push("EVENT_DATE: non communiquée — ne pas mentionner de date précise.");

  const user = [
    "Informations disponibles pour ce club :",
    facts.join("\n"),
    "",
    `Utilise ${REGISTRATION_LINK_TOKEN} comme jeton pour le lien d'inscription — ne l'invente pas, ne le modifie pas.`,
    "",
    'Retourne UNIQUEMENT un objet JSON (pas de balises markdown, pas d\'autre texte), de cette forme :',
    `{"subjects": [string, string, string], "email": string, "posterText": string}`,
    `email doit contenir le jeton ${REGISTRATION_LINK_TOKEN} exactement une fois, à l'endroit du CTA.`,
    "email ne doit pas commencer par un placeholder de salutation (\"Bonjour [CLUB_NAME]\") — commence directement par le hook.",
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
    throw new Error("Couldn't generate a usable challenge email — try again.");
  }

  return {
    subjects: subjects.slice(0, 3),
    email: email.split(REGISTRATION_LINK_TOKEN).join(registrationUrl),
    posterText,
  };
}
