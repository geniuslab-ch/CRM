"use client";

import { useState } from "react";
import { ArrowDown, Check, Pencil, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sponsor } from "@/types";
import { getAIProvider } from "@/lib/ai";
import { buildPersonalizationAngle } from "@/lib/agents/outreach";

export function OutreachComposer({ sponsor }: { sponsor: Sponsor }) {
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "generated" | "approved" | "sent">("idle");
  const [editing, setEditing] = useState(false);

  async function generate() {
    const ai = getAIProvider();
    const result = await ai.generateOutreach({
      targetName: sponsor.research.contactPerson.name,
      organization: sponsor.name,
      researchInsight: sponsor.research.recentMarketingActivity,
      personalizationAngle: buildPersonalizationAngle(sponsor.category),
      category: "SPONSOR",
    });
    setMessage(result.message);
    setStatus("generated");
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Outreach Agent</CardTitle>
        {!message && (
          <Button size="sm" onClick={generate}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Generate outreach
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!message ? (
          <p className="text-sm text-muted-foreground">
            Generate a personalized message for {sponsor.research.contactPerson.name} ({sponsor.research.contactPerson.role})
            using this company&apos;s research profile — never a generic template.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Research insight</p>
              <p className="mt-1 text-sm">{sponsor.research.recentMarketingActivity}</p>
            </div>
            <div className="flex justify-center">
              <ArrowDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Personalization</p>
              <p className="mt-1 text-sm">{buildPersonalizationAngle(sponsor.category)}</p>
            </div>
            <div className="flex justify-center">
              <ArrowDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Generated message</p>
              {editing ? (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              ) : (
                <p className="whitespace-pre-line text-sm text-foreground/90">{message}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing((e) => !e)}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                {editing ? "Done" : "EDIT"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStatus("approved")}
                disabled={status === "approved" || status === "sent"}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                APPROVE
              </Button>
              <Button size="sm" onClick={() => setStatus("sent")} disabled={status === "sent"}>
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                {status === "sent" ? "SENT (mock)" : "SEND — MOCK"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
