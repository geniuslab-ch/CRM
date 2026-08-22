"use client";

import { useState } from "react";
import { Download, Send, Pencil, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Club } from "@/types";
import { clubRegistrationUrl } from "@/lib/data/registration";

const PLACEHOLDER_EMAIL_HINT = /\.example\.[a-z]+$/i;

function defaultSubject(): string {
  return `Rejoins la Panna League — partage avec tes joueurs`;
}

function defaultBody(club: Club, registrationUrl: string): string {
  return `Bonjour ${club.contactName || "à vous"},

Merci pour votre intérêt pour la Panna League ! Nous vous invitons à partager ce lien d'inscription avec les joueurs de ${club.name} pour notre premier événement à Lausanne :

${registrationUrl}

Vous trouverez en pièce jointe une affiche prête à imprimer ou à partager sur vos réseaux, avec un QR code menant directement à la page d'inscription — les inscriptions faites via cette affiche seront automatiquement rattachées à ${club.name}.

À bientôt sur le terrain,
L'équipe Panna League`;
}

export function ClubOutreach({ club }: { club: Club }) {
  const registrationUrl = clubRegistrationUrl(club.name);
  const [subject, setSubject] = useState(defaultSubject());
  const [body, setBody] = useState(defaultBody(club, registrationUrl));
  const [editing, setEditing] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [attachPoster, setAttachPoster] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentVia, setSentVia] = useState<{ mock: boolean } | null>(null);

  const isPlaceholderEmail = PLACEHOLDER_EMAIL_HINT.test(club.contactEmail);

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

  async function handleSend() {
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: club.contactEmail,
          subject,
          message: body,
          logAs: {
            contactName: club.contactName,
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
            Share the registration link with {club.name}&apos;s members — as a printable poster, by email, or both.
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
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Subject</p>
              <Button variant="secondary" size="sm" onClick={() => setEditing((e) => !e)}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                {editing ? "Done" : "Edit"}
              </Button>
            </div>
            {editing ? (
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="focus-ring mb-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold"
              />
            ) : (
              <p className="mb-2 font-semibold">{subject}</p>
            )}
            {editing ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
            ) : (
              <p className="whitespace-pre-line text-sm text-foreground/90">{body}</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Will send to <span className="font-medium text-foreground">{club.contactEmail}</span>
          </p>
          {isPlaceholderEmail && !sentVia && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              This looks like a placeholder contact address — update the club&apos;s real email before sending for
              real.
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
            <Button size="sm" onClick={handleSend} disabled={sending}>
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              {sending ? "Sending…" : "Send"}
            </Button>
          )}
          {sendError && <p className="text-sm text-danger">{sendError}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
