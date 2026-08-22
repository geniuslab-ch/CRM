"use client";

import { useState } from "react";
import { Download, Sparkles, Send, Pencil, Check, AlertTriangle, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Club } from "@/types";
import { clubRegistrationUrl } from "@/lib/data/registration";

const PLACEHOLDER_EMAIL_HINT = /\.example\.[a-z]+$/i;

interface ChallengeEmailDraft {
  subjects: string[];
  email: string;
  posterText: string;
}

export function ClubOutreach({ club }: { club: Club }) {
  const registrationUrl = clubRegistrationUrl(club.name);
  const contacts = club.contacts.length > 0 ? club.contacts : [{ name: club.contactName, email: club.contactEmail, isPrimary: true }];
  const primaryIdx = Math.max(0, contacts.findIndex((c) => c.isPrimary));
  const [sendToIdx, setSendToIdx] = useState(primaryIdx);
  const sendTo = contacts[sendToIdx] ?? contacts[0];

  const [draft, setDraft] = useState<ChallengeEmailDraft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [attachPoster, setAttachPoster] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentVia, setSentVia] = useState<{ mock: boolean } | null>(null);

  const hasNoEmail = !sendTo.email.trim();
  const isPlaceholderEmail = !hasNoEmail && PLACEHOLDER_EMAIL_HINT.test(sendTo.email);

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    setSentVia(null);
    try {
      const res = await fetch("/api/ai/club-challenge-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId: club.id }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
      const result: ChallengeEmailDraft = await res.json();
      setDraft(result);
      setSubjectIdx(0);
      setBody(result.email);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Couldn't generate the challenge email right now.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch("/api/club-poster/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${club.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-recruitment-poster.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Couldn't generate the poster right now.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyPosterText() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.posterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard permission denied — nothing to fall back to, just skip silently
    }
  }

  async function handleSend() {
    if (!draft) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: sendTo.email,
          subject: draft.subjects[subjectIdx],
          message: body,
          logAs: {
            contactName: sendTo.name || club.contactName,
            organization: club.name,
            category: "CLUB",
            relatedId: club.id,
          },
          ...(attachPoster ? { attachClubPoster: { club } } : {}),
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
          <CardTitle>Recruitment outreach</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Challenge {club.name} to find the first Panna League champion — not a partnership pitch.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleDownload} disabled={downloading}>
          <Download className={downloading ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} aria-hidden="true" />
          {downloading ? "Generating…" : "Download poster"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {downloadError && <p className="text-sm text-danger">{downloadError}</p>}
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
          Registration link:{" "}
          <a href={registrationUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            {registrationUrl}
          </a>
        </p>

        <div className="space-y-3 border-t border-border pt-4">
          {!draft && (
            <Button size="sm" onClick={handleGenerate} disabled={generating}>
              <Sparkles className={generating ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} aria-hidden="true" />
              {generating ? "Writing…" : "Generate challenge email"}
            </Button>
          )}
          {genError && <p className="text-sm text-danger">{genError}</p>}

          {draft && (
            <>
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Subject line
                </p>
                <div className="space-y-1.5">
                  {draft.subjects.map((s, i) => (
                    <label
                      key={i}
                      className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <input
                        type="radio"
                        name="subject"
                        checked={subjectIdx === i}
                        onChange={() => setSubjectIdx(i)}
                        className="mt-0.5 accent-primary"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Email</p>
                  <Button variant="secondary" size="sm" onClick={() => setEditing((e) => !e)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    {editing ? "Done" : "Edit"}
                  </Button>
                </div>
                {editing ? (
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={9}
                    className="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                ) : (
                  <p className="whitespace-pre-line text-sm text-foreground/90">{body}</p>
                )}
              </div>

              {draft.posterText && (
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Poster / social caption
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleCopyPosterText}>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <p className="whitespace-pre-line text-sm text-foreground/90">{draft.posterText}</p>
                </div>
              )}

              <Button variant="secondary" size="sm" onClick={handleGenerate} disabled={generating}>
                <Sparkles className={generating ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} aria-hidden="true" />
                {generating ? "Writing…" : "Regenerate"}
              </Button>

              {contacts.length > 1 ? (
                <div>
                  <label htmlFor="co-send-to" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Send to
                  </label>
                  <select
                    id="co-send-to"
                    value={sendToIdx}
                    onChange={(e) => setSendToIdx(Number(e.target.value))}
                    className="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  >
                    {contacts.map((c, i) => (
                      <option key={i} value={i} disabled={!c.email.trim()}>
                        {c.isPrimary ? "★ " : ""}
                        {c.name || "(no name)"} — {c.email.trim() || "no email"}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                !hasNoEmail && (
                  <p className="text-xs text-muted-foreground">
                    Will send to <span className="font-medium text-foreground">{sendTo.email}</span>
                  </p>
                )
              )}
              {hasNoEmail && !sentVia && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-xs text-warning">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  No email on file for this club yet — use Edit to add one before sending.
                </div>
              )}
              {isPlaceholderEmail && !sentVia && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-xs text-warning">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  This looks like a placeholder contact address — update the club&apos;s real email before sending
                  for real.
                </div>
              )}
              {!sentVia && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={attachPoster}
                    onChange={(e) => setAttachPoster(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border accent-primary"
                  />
                  Attach the recruitment poster as a PDF
                </label>
              )}

              {sentVia ? (
                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-2.5 text-sm text-success">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {sentVia.mock ? "Sent (mock — no email configured)" : "Sent"}
                </div>
              ) : (
                <Button size="sm" onClick={handleSend} disabled={sending || hasNoEmail}>
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  {sending ? "Sending…" : "Send"}
                </Button>
              )}
              {sendError && <p className="text-sm text-danger">{sendError}</p>}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
