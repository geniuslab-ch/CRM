"use client";

import { useState } from "react";
import { Sparkles, Check, Download, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sponsor } from "@/types";
import { generateProposalTier } from "@/lib/data/proposals";
import { formatCHF } from "@/lib/utils";

export function ProposalGenerator({ sponsor }: { sponsor: Sponsor }) {
  const [generated, setGenerated] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exported, setExported] = useState(false);
  const [tier, setTier] = useState(() => generateProposalTier(sponsor));

  function generate() {
    setTier(generateProposalTier(sponsor));
    setGenerated(true);
    setSaved(false);
    setExported(false);
  }

  function updateBenefit(idx: number, value: string) {
    setTier((t) => ({ ...t, benefits: t.benefits.map((b, i) => (i === idx ? value : b)) }));
  }

  function removeBenefit(idx: number) {
    setTier((t) => ({ ...t, benefits: t.benefits.filter((_, i) => i !== idx) }));
  }

  function addBenefit() {
    setTier((t) => ({ ...t, benefits: [...t.benefits, "New benefit"] }));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Commercial Opportunity Generator</CardTitle>
        {!generated && (
          <Button size="sm" onClick={generate}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Generate Sponsorship Proposal
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!generated ? (
          <p className="text-sm text-muted-foreground">
            Generate a tailored sponsorship proposal for {sponsor.name} based on their research profile and fit score.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  {editing ? (
                    <Input
                      value={tier.name}
                      onChange={(e) => setTier((t) => ({ ...t, name: e.target.value }))}
                      className="mb-1 h-8 w-48"
                    />
                  ) : (
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">{tier.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{tier.tagline}</p>
                </div>
                <p className="font-display text-2xl font-bold">{formatCHF(tier.estimatedValue)}</p>
              </div>

              <ul className="mt-4 space-y-2">
                {tier.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                    {editing ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input value={b} onChange={(e) => updateBenefit(idx, e.target.value)} className="h-8" />
                        <button
                          onClick={() => removeBenefit(idx)}
                          aria-label={`Remove benefit ${b}`}
                          className="focus-ring rounded p-1 text-muted-foreground hover:text-danger"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span>{b}</span>
                    )}
                  </li>
                ))}
              </ul>

              {editing && (
                <button
                  onClick={addBenefit}
                  className="focus-ring mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add benefit
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing((e) => !e)}>
                {editing ? "Done editing" : "EDIT"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSaved(true)}
                disabled={saved}
              >
                {saved ? "Saved" : "SAVE"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setExported(true)}>
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {exported ? "Exported (mock)" : "EXPORT"}
              </Button>
            </div>
            {exported && (
              <p className="text-xs text-muted-foreground">
                Mock export complete — in production this generates a branded PDF via a document-generation integration.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
