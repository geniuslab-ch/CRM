import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brandVoice, aiMemory } from "@/lib/data/brand";
import { Brain, MessageSquareOff, Quote } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Brand voice and the shared AI memory every agent draws from — this is what keeps the AI team acting as one organization." />

      <Card>
        <CardHeader>
          <CardTitle>Brand voice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company</p>
            <p className="mt-1 text-sm font-medium">{brandVoice.company}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
            <p className="mt-1 text-sm text-muted-foreground">{brandVoice.description}</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tone</p>
            <div className="flex flex-wrap gap-2">
              {brandVoice.tone.map((t) => (
                <Badge key={t} variant="primary">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <MessageSquareOff className="h-3.5 w-3.5" aria-hidden="true" />
              Avoid
            </p>
            <div className="flex flex-wrap gap-2">
              {brandVoice.avoid.map((t) => (
                <Badge key={t} variant="danger">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Quote className="h-3.5 w-3.5" aria-hidden="true" />
              Preferred CTA
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-primary">&ldquo;{brandVoice.preferredCta}&rdquo;</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" aria-hidden="true" />
            AI Memory — shared knowledge layer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Every agent reads from this shared context before acting — the system behaves as one AI organization with eight
            specialists, not eight disconnected chatbots.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {aiMemory.map((entry) => (
              <div key={entry.key} className="rounded-xl border border-border bg-surface-2 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{entry.label}</p>
                <p className="mt-1 text-sm">{entry.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI mode</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The whole app is gated by a single switch: set{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5">ANTHROPIC_API_KEY</code> in your environment and
            redeploy to go live. It powers reply classification (including real inbound replies, once polling is set
            up below), content idea generation, real web-search prospecting (Run AI Team), the Researcher agent, the
            AI Activation Lab, the Club Challenge Email generator, and suggesting content ideas from a confirmed
            sponsor&apos;s deal terms. Without it, classification and content ideas fall back to a clearly-labeled
            Mock AI, and the rest are disabled outright rather than faked — see the sidebar status below.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Real inbound replies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Conversation Manager polls Gmail for replies from known sponsor/club contacts and classifies them
            automatically (see <code className="rounded bg-surface-2 px-1.5 py-0.5">/api/cron/poll-inbox</code>). It
            needs your Google credentials configured (same ones as Calendar/Gmail sending) plus a{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5">CRON_SECRET</code> environment variable — pick any
            random string, set it, and redeploy. The real 15-minute polling runs for free via a GitHub Actions
            workflow (<code className="rounded bg-surface-2 px-1.5 py-0.5">.github/workflows/poll-inbox.yml</code>)
            — add the same <code className="rounded bg-surface-2 px-1.5 py-0.5">CRON_SECRET</code> value as a repo
            secret on GitHub (Settings → Secrets and variables → Actions) so it can authenticate. Vercel&apos;s own
            cron in <code className="rounded bg-surface-2 px-1.5 py-0.5">vercel.json</code> only runs once a day
            (all the Hobby plan allows) and is kept purely as a fallback in case a GitHub Actions run gets skipped.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
