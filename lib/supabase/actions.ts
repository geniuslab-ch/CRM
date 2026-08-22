"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, isSupabaseConfigured } from "./client";
import {
  createContentIdea,
  updateContentIdeaStatus,
  deleteContentIdea,
  markConversationRead,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventChecklistItem,
  addEventChecklistItem,
  addEventChecklistItems,
} from "./repository";
import { Contact, ContentOpportunity, ContentStatus } from "@/types";

export async function markConversationAsRead(relatedId: string): Promise<void> {
  await markConversationRead(relatedId);
  revalidatePath("/conversations");
}

// Server Actions for adding/removing real CRM records. These are the
// write counterpart to lib/supabase/repository.ts's read-only
// getPlayers()/getClubs()/getSponsors() — together they make the CRM
// pages a working tool, not just a live viewer. Every new record is
// exactly what a human typed in; nothing here fabricates a name, score,
// or contact detail. AI-scoring fields default to a neutral, clearly
// labeled "pending" state rather than a fake number.

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function requireSupabase(): ActionResult | null {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase isn't configured on this server — set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY." };
  }
  return null;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string, fallback = 0): number {
  const v = Number(formData.get(key));
  return Number.isFinite(v) ? v : fallback;
}

function numOrNull(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

// Reads up to 3 contacts (contactName0/contactEmail0[/contactRole0] ..2)
// plus which slot is marked primary (primaryContact, 0-2). A slot with
// neither name nor email is skipped rather than saved empty; if the
// marked-primary slot ended up empty, the first real contact wins
// instead so there's always exactly one primary when any exist.
function readContacts(formData: FormData, withRole: boolean): Contact[] {
  const primarySlot = num(formData, "primaryContact", 0);
  const contacts: Contact[] = [];
  let primaryFound = false;
  for (let i = 0; i < 3; i++) {
    const name = str(formData, `contactName${i}`);
    const email = str(formData, `contactEmail${i}`);
    if (!name && !email) continue;
    const isPrimary = i === primarySlot;
    if (isPrimary) primaryFound = true;
    contacts.push({
      name,
      email,
      ...(withRole ? { role: str(formData, `contactRole${i}`) || undefined } : {}),
      isPrimary,
    });
  }
  if (contacts.length > 0 && !primaryFound) contacts[0].isPrimary = true;
  return contacts;
}

function primaryOf(contacts: Contact[]): Contact | null {
  return contacts.find((c) => c.isPrimary) ?? contacts[0] ?? null;
}

export async function addPlayer(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;

  const name = str(formData, "name");
  const city = str(formData, "city");
  const position = str(formData, "position");
  if (!name || !city || !position) return { ok: false, error: "Name, city and position are required." };

  const id = `player-${crypto.randomUUID()}`;
  const { error } = await getSupabaseServerClient()
    .from("players")
    .insert({
      id,
      name,
      age: num(formData, "age", 20),
      city,
      club: str(formData, "club") || null,
      position,
      player_score: 50,
      score_breakdown: {
        technical: 50,
        experience: 50,
        streetRelevance: 50,
        socialAudience: 50,
        localRelevance: 50,
        competitivePotential: 50,
      },
      social_audience: num(formData, "socialAudience", 0),
      status: "IDENTIFIED",
      last_contact: null,
      ai_recommendation: "Pending AI evaluation.",
      ai_why: "Manually added by the organizer — the Player Recruiter agent hasn't scored this player yet.",
      avatar_seed: id,
    });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/players");
  return { ok: true };
}

export async function updatePlayerStatus(id: string, status: string): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const { error } = await getSupabaseServerClient()
    .from("players")
    .update({ status, last_contact: status === "IDENTIFIED" ? null : new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/players");
  return { ok: true };
}

export async function deletePlayer(id: string): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const { error } = await getSupabaseServerClient().from("players").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/players");
  return { ok: true };
}

export async function addClub(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;

  const name = str(formData, "name");
  const city = str(formData, "city");
  const contacts = readContacts(formData, false);
  const primary = primaryOf(contacts);
  if (!name || !city || !primary?.name || !primary?.email) {
    return { ok: false, error: "Club name, city, and at least one contact name and email are required." };
  }

  const id = `club-${crypto.randomUUID()}`;
  const { error } = await getSupabaseServerClient()
    .from("clubs")
    .insert({
      id,
      name,
      kind: str(formData, "kind") === "SCHOOL" ? "SCHOOL" : "CLUB",
      city,
      contact_name: primary.name,
      contact_email: primary.email,
      contacts,
      website: str(formData, "website") || "",
      players_identified: num(formData, "playersIdentified", 0),
      status: "IDENTIFIED",
      potential: "MEDIUM",
      last_contact: null,
      engagement_type: "PLAYER_RECRUITMENT",
      ai_note: "Manually added by the organizer — queued for player recruitment outreach.",
    });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/clubs");
  return { ok: true };
}

export async function updateClub(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;

  const id = str(formData, "id");
  const name = str(formData, "name");
  const city = str(formData, "city");
  const contacts = readContacts(formData, false);
  const primary = primaryOf(contacts);
  if (!id) return { ok: false, error: "Missing club id." };
  if (!name || !city || !primary?.name || !primary?.email) {
    return { ok: false, error: "Club name, city, and at least one contact name and email are required." };
  }

  const { error } = await getSupabaseServerClient()
    .from("clubs")
    .update({
      name,
      kind: str(formData, "kind") === "SCHOOL" ? "SCHOOL" : "CLUB",
      city,
      contact_name: primary.name,
      contact_email: primary.email,
      contacts,
      website: str(formData, "website") || "",
      players_identified: num(formData, "playersIdentified", 0),
      status: str(formData, "status") || "IDENTIFIED",
      potential: str(formData, "potential") || "MEDIUM",
      engagement_type: str(formData, "engagementType") || "PLAYER_RECRUITMENT",
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/clubs");
  return { ok: true };
}

export async function deleteClub(id: string): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const { error } = await getSupabaseServerClient().from("clubs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clubs");
  return { ok: true };
}

export async function addSponsor(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;

  const name = str(formData, "name");
  const category = str(formData, "category");
  const city = str(formData, "city");
  const contacts = readContacts(formData, true);
  const primary = primaryOf(contacts);
  if (!name || !category || !city || !primary?.name || !primary?.email) {
    return { ok: false, error: "Company name, category, city, and at least one contact name and email are required." };
  }

  const id = `sponsor-${crypto.randomUUID()}`;
  const description = str(formData, "description");
  const { error } = await getSupabaseServerClient()
    .from("sponsors")
    .insert({
      id,
      name,
      category,
      city,
      fit: {
        overall: 50,
        audienceFit: 50,
        activationFit: 50,
        swissPresence: 50,
        brandPositioning: 50,
        budgetPotential: 50,
      },
      fit_why: "Pending research — fit score not yet evaluated.",
      potential_value: num(formData, "potentialValue", 5000),
      stage: "PROSPECT",
      last_activity: "Manually added by the organizer",
      last_activity_date: new Date().toISOString(),
      next_action: "Assign to Researcher for company deep-dive.",
      research: {
        companyDescription: description || "Not yet researched.",
        industry: category,
        swissPresence: "Not yet researched.",
        targetAudience: "Not yet researched.",
        recentMarketingActivity: "Not yet researched.",
        existingSponsorships: "Not yet researched.",
        reasonToSponsor: "Not yet researched.",
        activationOpportunities: [],
        suggestedPackage: "TBD",
        contactPerson: {
          name: primary.name,
          role: primary.role || "Contact",
          email: primary.email,
        },
      },
      contacts,
      ai_recommendation: "Newly added — not yet scored.",
    });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/sponsors");
  return { ok: true };
}

export async function updateSponsor(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;

  const id = str(formData, "id");
  const name = str(formData, "name");
  const category = str(formData, "category");
  const city = str(formData, "city");
  const contacts = readContacts(formData, true);
  const primary = primaryOf(contacts);
  if (!id) return { ok: false, error: "Missing sponsor id." };
  if (!name || !category || !city || !primary?.name || !primary?.email) {
    return { ok: false, error: "Company name, category, city, and at least one contact name and email are required." };
  }

  const supabase = getSupabaseServerClient();
  const { data: existing, error: fetchError } = await supabase
    .from("sponsors")
    .select("research")
    .eq("id", id)
    .single();
  if (fetchError || !existing) return { ok: false, error: fetchError?.message ?? "Sponsor not found." };

  const existingResearch = (existing.research ?? {}) as Record<string, unknown>;
  const description = str(formData, "description");
  const research = {
    ...existingResearch,
    ...(description ? { companyDescription: description } : {}),
    contactPerson: {
      name: primary.name,
      role: primary.role || "Contact",
      email: primary.email,
    },
  };

  const fitWhy = str(formData, "fitWhy");
  const dealTerms = str(formData, "dealTerms");

  const { error } = await supabase
    .from("sponsors")
    .update({
      contacts,
      name,
      category,
      city,
      potential_value: num(formData, "potentialValue", 0),
      stage: str(formData, "stage") || "PROSPECT",
      research,
      ...(fitWhy ? { fit_why: fitWhy } : {}),
      deal_terms: dealTerms || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/sponsors");
  revalidatePath(`/sponsors/${id}`);
  return { ok: true };
}

export async function deleteSponsor(id: string): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const { error } = await getSupabaseServerClient().from("sponsors").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/sponsors");
  revalidatePath(`/sponsors/${id}`);
  return { ok: true };
}

export async function saveContentIdea(
  idea: Omit<ContentOpportunity, "id" | "status" | "scheduledDate" | "performance">
): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const result = await createContentIdea(idea);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/content");
  return { ok: true };
}

export async function setContentIdeaStatus(id: string, status: ContentStatus): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const result = await updateContentIdeaStatus(id, status);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/content");
  return { ok: true };
}

export async function removeContentIdea(id: string): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const result = await deleteContentIdea(id);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/content");
  return { ok: true };
}

export async function addEvent(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;

  const name = str(formData, "name");
  const city = str(formData, "city");
  if (!name || !city) return { ok: false, error: "Event name and city are required." };

  const result = await createEvent({
    name,
    city,
    venue: str(formData, "venue") || null,
    date: str(formData, "date") || null,
    edition: numOrNull(formData, "edition"),
    playerTarget: num(formData, "playerTarget", 32),
    clubTarget: num(formData, "clubTarget", 10),
    sponsorTarget: num(formData, "sponsorTarget", 8),
    digitalAudienceTarget: num(formData, "digitalAudienceTarget", 10000),
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/event");
  revalidatePath("/");
  return { ok: true };
}

export async function updateEventAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;

  const id = str(formData, "id");
  const name = str(formData, "name");
  const city = str(formData, "city");
  if (!id) return { ok: false, error: "Missing event id." };
  if (!name || !city) return { ok: false, error: "Event name and city are required." };

  const result = await updateEvent(id, {
    name,
    city,
    venue: str(formData, "venue") || null,
    date: str(formData, "date") || null,
    edition: numOrNull(formData, "edition"),
    status: str(formData, "status") || "PRE_LAUNCH",
    playerTarget: num(formData, "playerTarget", 32),
    clubTarget: num(formData, "clubTarget", 10),
    sponsorTarget: num(formData, "sponsorTarget", 8),
    digitalAudienceTarget: num(formData, "digitalAudienceTarget", 10000),
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/event");
  revalidatePath("/");
  return { ok: true };
}

export async function removeEvent(id: string): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const result = await deleteEvent(id);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/event");
  return { ok: true };
}

export async function toggleChecklistItem(eventId: string, itemId: string): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const result = await toggleEventChecklistItem(eventId, itemId);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/event");
  return { ok: true };
}

export async function addChecklistItem(eventId: string, label: string): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  if (!label.trim()) return { ok: false, error: "Checklist item can't be empty." };
  const result = await addEventChecklistItem(eventId, label.trim());
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/event");
  return { ok: true };
}

export async function seedEventChecklist(eventId: string, labels: string[]): Promise<ActionResult> {
  const guard = requireSupabase();
  if (guard) return guard;
  const result = await addEventChecklistItems(eventId, labels);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/event");
  return { ok: true };
}
