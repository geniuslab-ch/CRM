"use client";

import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Zap,
  PiggyBank,
  Maximize2,
  Share2,
  Gem,
  Trophy,
  Mail,
  Send,
  Pencil,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ActivationConcept, Sponsor, SponsorshipTier } from "@/types";

const PLACEHOLDER_EMAIL_HINT = /\.example\.[a-z]+$/i;

type Direction = "regenerate" | "guerrilla" | "cheaper" | "bigger" | "social" | "premium" | "sporting";
type EmailKind = "first" | "followup1" | "followup2" | "followup3";

const TRANSFORM_BUTTONS: { direction: Direction; label: string; icon: typeof Wand2 }[] = [
  { direction: "regenerate", label: "Regenerate idea", icon: Wand2 },
  { direction: "guerrilla", label: "More guerrilla", icon: Zap },
  { direction: "cheaper", label: "Cheaper", icon: PiggyBank },
  { direction: "bigger", label: "Bigger", icon: Maximize2 },
  { direction: "social", label: "More social", icon: Share2 },
  { direction: "premium", label: "More premium", icon: Gem },
  { direction: "sporting", label: "More sporting", icon: Trophy },
];

const DIFFICULTY_TONE: Record<string, string> = {
  LOW: "text-success",
  MEDIUM: "text-warning",
  HIGH: "text-danger",
};

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-center">
      <p className="font-display text-sm font-bold text-primary">{value}</p>
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

export function ActivationLab({ sponsor, proposalTier }: { sponsor: Sponsor; proposalTier: SponsorshipTier | null }) {
  const [activation, setActivation] = useState<ActivationConcept | null>(sponsor.activation);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [transformLoading, setTransformLoading] = useState<Direction | null>(null);

  const [emailKind, setEmailKind] = useState<EmailKind>("first");
  const [email, setEmail] = useState<{ subject: string; body: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);

  const [attachProposal, setAttachProposal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentVia, setSentVia] = useState<{ mock: boolean } | null>(null);

  const contactEmail = sponsor.research.contactPerson.email;
  const isPlaceholderEmail = PLACEHOLDER_EMAIL_HINT.test(contactEmail);

  async function callActivation(direction?: Direction) {
    if (direction) setTransformLoading(direction);
    else setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/ai/activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorId: sponsor.id, direction }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
      const result = await res.json();
      setActivation(result.activation);
      setEmail(null);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Couldn't generate an activation right now.");
    } finally {
      setGenerating(false);
      setTransformLoading(null);
    }
  }

  async function generateEmail() {
    setEmailLoading(true);
    setEmailError(null);
    setSentVia(null);
    try {
      const res = await fetch("/api/ai/activation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorId: sponsor.id, kind: emailKind }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
      const draft = await res.json();
      setEmail(draft);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Couldn't generate the email right now.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleSend() {
    if (!email) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: contactEmail,
          subject: email.subject,
          message: email.body,
          logAs: {
            contactName: sponsor.research.contactPerson.name,
            organization: sponsor.name,
            category: "SPONSOR",
            relatedId: sponsor.id,
          },
          ...(attachProposal && proposalTier ? { attachProposal: { sponsor, tier: proposalTier } } : {}),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Send failed");
      const result = await res.json();
      setSentVia({ mock: result.mock });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Couldn't send — please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>AI Activation Lab</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Finds what this brand already cares about and turns it into a Panna League activation — not a generic
            sponsorship pitch.
          </p>
        </div>
        {!activation && (
          <Button size="sm" onClick={() => callActivation()} disabled={generating}>
            <Sparkles className={generating ? "h-4 w-4 animate-pulse" : "h-4 w-4"} aria-hidden="true" />
            {generating ? "Thinking…" : "Generate activation"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!activation && !generating && (
          <p className="text-sm text-muted-foreground">
            Researches {sponsor.name}&apos;s real brand territory, current campaigns and objectives, then designs one
            specific activation idea — not a template.
          </p>
        )}
        {genError && <p className="text-sm text-danger">{genError}</p>}

        {activation && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <ScorePill label="Sponsor fit" value={activation.sponsorshipFit} />
              <ScorePill label="Guerrilla" value={activation.guerrillaPotential} />
              <div className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-center">
                <p className={`font-display text-sm font-bold ${DIFFICULTY_TONE[activation.executionDifficulty]}`}>
                  {activation.executionDifficulty}
                </p>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Complexity</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-center">
                <p className="font-display text-sm font-bold text-primary">{activation.sources.length}</p>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Sources cited</p>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
              <Field label="Brand insight">
                <p className="font-medium">{activation.brandTerritory}</p>
                <p className="mt-0.5 text-muted-foreground">{activation.currentCampaign}</p>
              </Field>
              <Field label="Panna opportunity">{activation.pannaConnection}</Field>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Recommended activation
                </p>
                <p className="font-display text-base font-bold">{activation.activationName}</p>
                <p className="mt-1 text-sm text-foreground/90">{activation.activationDescription}</p>
              </div>
              <Field label="Why it works">
                <p>{activation.whyTheyWouldCare}</p>
                <p className="mt-1 text-muted-foreground">{activation.whyPeopleWouldCare}</p>
              </Field>
              <Field label="Potential content">{activation.contentPotential}</Field>
              <Field label="Potential deliverables">
                <ul className="mt-1 space-y-1">
                  {activation.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-1.5">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
              </Field>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TRANSFORM_BUTTONS.map(({ direction, label, icon: Icon }) => (
                <Button
                  key={direction}
                  variant="secondary"
                  size="sm"
                  onClick={() => callActivation(direction)}
                  disabled={transformLoading !== null || generating}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {transformLoading === direction ? "…" : label}
                </Button>
              ))}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={emailKind} onChange={(e) => setEmailKind(e.target.value as EmailKind)} className="w-auto">
                  <option value="first">First email</option>
                  <option value="followup1">Follow-up 1 (add value)</option>
                  <option value="followup2">Follow-up 2 (curiosity)</option>
                  <option value="followup3">Follow-up 3 (close politely)</option>
                </Select>
                <Button size="sm" onClick={generateEmail} disabled={emailLoading}>
                  <Mail className={emailLoading ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} aria-hidden="true" />
                  {emailLoading ? "Writing…" : email ? "Regenerate email" : "Generate email"}
                </Button>
              </div>
              {emailError && <p className="text-sm text-danger">{emailError}</p>}

              {email && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Subject</p>
                      <Button variant="secondary" size="sm" onClick={() => setEditingEmail((e) => !e)}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        {editingEmail ? "Done" : "Edit"}
                      </Button>
                    </div>
                    {editingEmail ? (
                      <input
                        value={email.subject}
                        onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                        className="focus-ring mb-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold"
                      />
                    ) : (
                      <p className="mb-2 font-semibold">{email.subject}</p>
                    )}
                    {editingEmail ? (
                      <textarea
                        value={email.body}
                        onChange={(e) => setEmail({ ...email, body: e.target.value })}
                        rows={7}
                        className="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                      />
                    ) : (
                      <p className="whitespace-pre-line text-sm text-foreground/90">{email.body}</p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Will send to <span className="font-medium text-foreground">{contactEmail}</span>
                  </p>
                  {isPlaceholderEmail && !sentVia && (
                    <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-xs text-warning">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      This looks like a placeholder contact address — update the sponsor&apos;s real email before
                      sending for real.
                    </div>
                  )}
                  {proposalTier && !sentVia && (
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={attachProposal}
                        onChange={(e) => setAttachProposal(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-border accent-primary"
                      />
                      Attach the generated sponsorship proposal as a PDF
                    </label>
                  )}

                  {sentVia ? (
                    <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-2.5 text-sm text-success">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      {sentVia.mock ? "Sent (mock — no email configured)" : "Sent"}
                    </div>
                  ) : (
                    <Button size="sm" onClick={handleSend} disabled={sending}>
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      {sending ? "Sending…" : "Send"}
                    </Button>
                  )}
                  {sendError && <p className="text-sm text-danger">{sendError}</p>}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
