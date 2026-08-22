"use client";

import { useState, useTransition } from "react";
import { Sparkles, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/content/platform-badge";
import { saveContentIdea } from "@/lib/supabase/actions";
import { Sponsor, ContentPlatform } from "@/types";

interface DealContentIdea {
  title: string;
  platform: ContentPlatform;
  hook: string;
  caption: string;
  cta: string;
  suggestedFootage: string;
  sponsorIntegration: string | null;
}

export function DealContentIdeas({ sponsor }: { sponsor: Sponsor }) {
  const [ideas, setIdeas] = useState<DealContentIdea[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());
  const [saving, startSaving] = useTransition();

  const isWonNoTerms = sponsor.stage === "WON" && !sponsor.dealTerms?.trim();

  async function generate() {
    setLoading(true);
    setError(null);
    setIdeas(null);
    try {
      const res = await fetch("/api/ai/deal-content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorId: sponsor.id }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
      const result = await res.json();
      setIdeas(result.ideas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate content ideas right now.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave(idx: number, idea: DealContentIdea) {
    startSaving(async () => {
      const result = await saveContentIdea({ ...idea, trigger: `Sponsor deal — ${sponsor.name}` });
      if (result.ok) setSavedIdx((s) => new Set(s).add(idx));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal content ideas</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Suggests content ideas from what was actually agreed with {sponsor.name} — never from the generated
          proposal, which can drift from the real deal.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sponsor.dealTerms ? (
          <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted-foreground">{sponsor.dealTerms}</p>
        ) : isWonNoTerms ? (
          <p className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-warning">
            This sponsor is marked WON — use Edit above to add what was actually agreed, and content ideas can be
            suggested from it.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No deal terms on file yet — use Edit above to add what was actually agreed once this sponsor is confirmed.
          </p>
        )}

        <Button size="sm" onClick={generate} disabled={loading || !sponsor.dealTerms?.trim()}>
          <Sparkles className={loading ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} aria-hidden="true" />
          {loading ? "Thinking…" : ideas ? "Regenerate" : "Suggest content ideas"}
        </Button>
        {error && <p className="text-sm text-danger">{error}</p>}

        {ideas && (
          <div className="space-y-3">
            {ideas.map((idea, idx) => (
              <div key={idx} className="space-y-1.5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{idea.title}</p>
                  <PlatformBadge platform={idea.platform} />
                </div>
                <p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hook: </span>
                  {idea.hook}
                </p>
                <p className="text-muted-foreground">{idea.caption}</p>
                <p className="text-xs text-muted-foreground">CTA: {idea.cta}</p>
                <p className="text-xs text-muted-foreground">Footage: {idea.suggestedFootage}</p>
                <Button size="sm" variant="secondary" onClick={() => handleSave(idx, idea)} disabled={saving || savedIdx.has(idx)}>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {savedIdx.has(idx) ? "Saved" : "Save to board"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
