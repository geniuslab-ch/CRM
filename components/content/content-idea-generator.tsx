"use client";

import { useState, useTransition } from "react";
import { Sparkles, Check, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlatformBadge } from "./platform-badge";
import { saveContentIdea } from "@/lib/supabase/actions";
import { ContentPlatform } from "@/types";

const TRIGGER_SUGGESTIONS = [
  "Player wins a panna",
  "Player confirmed for roster",
  "Sponsor activation",
  "Club partnership announced",
  "Tournament day",
];

interface Draft {
  title: string;
  platform: ContentPlatform;
  hook: string;
  caption: string;
  cta: string;
  suggestedFootage: string;
  sponsorIntegration: string | null;
}

export function ContentIdeaGenerator() {
  const [trigger, setTrigger] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function generate() {
    if (!trigger.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/ai/content-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
      const result = await res.json();
      setDraft(result.idea);
      setProvider(result.provider);
    } catch {
      setError("Couldn't generate a content idea right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!draft) return;
    setSaveError(null);
    startSaving(async () => {
      const result = await saveContentIdea({ ...draft, trigger });
      if (result.ok) {
        setSaved(true);
        setDraft(null);
        setTrigger("");
      } else {
        setSaveError(result.error ?? "Couldn't save this idea.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate a content idea</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {TRIGGER_SUGGESTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setTrigger(t)}
              className="focus-ring rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-surface"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="What happened? e.g. 'Player wins a panna in Geneva'"
            className="flex-1"
          />
          <Button size="sm" onClick={generate} disabled={loading || !trigger.trim()}>
            <Sparkles className={loading ? "h-4 w-4 animate-pulse" : "h-4 w-4"} aria-hidden="true" />
            {loading ? "Generating…" : "Generate"}
          </Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}

        {draft && (
          <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={draft.platform} />
                {provider && (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground">via {provider}</span>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditing((e) => !e)}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                {editing ? "Done" : "EDIT"}
              </Button>
            </div>
            {editing ? (
              <div className="space-y-2">
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" />
                <Input value={draft.hook} onChange={(e) => setDraft({ ...draft, hook: e.target.value })} placeholder="Hook" />
                <textarea
                  value={draft.caption}
                  onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
                  rows={3}
                  className="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
                <Input value={draft.cta} onChange={(e) => setDraft({ ...draft, cta: e.target.value })} placeholder="CTA" />
              </div>
            ) : (
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold">{draft.title}</p>
                <p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hook: </span>
                  {draft.hook}
                </p>
                <p className="text-muted-foreground">{draft.caption}</p>
                <p className="text-xs text-muted-foreground">CTA: {draft.cta}</p>
                <p className="text-xs text-muted-foreground">Footage: {draft.suggestedFootage}</p>
                {draft.sponsorIntegration && (
                  <span className="inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">
                    {draft.sponsorIntegration}
                  </span>
                )}
              </div>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {saving ? "Saving…" : "Save to board"}
            </Button>
            {saveError && <p className="text-sm text-danger">{saveError}</p>}
          </div>
        )}
        {saved && <p className="text-sm text-success">Saved to the board below.</p>}
      </CardContent>
    </Card>
  );
}
