"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Conversation, ConversationCategory } from "@/types";
import { cn, initials, timeAgo } from "@/lib/utils";

const TABS: { value: ConversationCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PLAYER", label: "Players" },
  { value: "CLUB", label: "Clubs" },
  { value: "SPONSOR", label: "Sponsors" },
  { value: "MEDIA", label: "Media" },
];

export function Inbox({ conversations }: { conversations: Conversation[] }) {
  const [tab, setTab] = useState<string>("ALL");
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const [statusById, setStatusById] = useState<Record<string, "approved" | "sent">>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () => (tab === "ALL" ? conversations : conversations.filter((c) => c.category === tab)),
    [conversations, tab]
  );

  const selected = conversations.find((c) => c.id === selectedId) ?? filtered[0];

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        <Card className="max-h-[75vh] overflow-y-auto p-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cn(
                "focus-ring flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors",
                selected?.id === c.id ? "bg-surface-2" : "hover:bg-surface-2/60"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold">
                {initials(c.contactName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate text-sm font-medium", c.unread && "font-semibold")}>{c.contactName}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(c.lastMessageAt)}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.organization}</p>
                <p className="mt-1 truncate text-xs text-foreground/80">{c.lastMessagePreview}</p>
                <div className="mt-1.5">
                  <StatusBadge status={c.classification} />
                </div>
              </div>
              {c.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
            </button>
          ))}
          {filtered.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No conversations.</p>}
        </Card>

        {selected ? (
          <Card className="flex max-h-[75vh] flex-col">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <p className="font-semibold">{selected.contactName}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.organization} · {selected.category}
                </p>
              </div>
              <StatusBadge status={selected.classification} />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {selected.messages.map((m) => (
                <div key={m.id} className={cn("flex", m.from === "THEM" ? "justify-start" : "justify-end")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                      m.from === "THEM" ? "bg-surface-2 text-foreground" : "bg-primary/15 text-foreground"
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border p-4">
              <div className="rounded-xl border border-border bg-surface-2 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  AI recommended action
                </p>
                <p className="mt-1 text-sm">{selected.recommendedAction}</p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">AI-generated response</p>
                {editingId === selected.id ? (
                  <textarea
                    value={drafts[selected.id] ?? selected.aiDraftResponse}
                    onChange={(e) => setDrafts((d) => ({ ...d, [selected.id]: e.target.value }))}
                    rows={4}
                    className="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                ) : (
                  <p className="text-sm">{drafts[selected.id] ?? selected.aiDraftResponse}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingId((id) => (id === selected.id ? null : selected.id))}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  {editingId === selected.id ? "Done" : "EDIT"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={statusById[selected.id] === "approved" || statusById[selected.id] === "sent"}
                  onClick={() => setStatusById((s) => ({ ...s, [selected.id]: "approved" }))}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  APPROVE
                </Button>
                <Button
                  size="sm"
                  disabled={statusById[selected.id] === "sent"}
                  onClick={() => setStatusById((s) => ({ ...s, [selected.id]: "sent" }))}
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  {statusById[selected.id] === "sent" ? "SENT (mock)" : "SEND MOCK"}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex items-center justify-center p-10 text-sm text-muted-foreground">
            Select a conversation
          </Card>
        )}
      </div>
    </div>
  );
}
