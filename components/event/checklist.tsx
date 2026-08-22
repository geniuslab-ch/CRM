"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventChecklistItem } from "@/types";
import { toggleChecklistItem, addChecklistItem } from "@/lib/supabase/actions";
import { cn } from "@/lib/utils";

export function EventChecklist({ eventId, items }: { eventId: string; items: EventChecklistItem[] }) {
  const [pending, startTransition] = useTransition();
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = items.filter((i) => i.done).length;

  function toggle(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await toggleChecklistItem(eventId, id);
      if (!result.ok) setError(result.error ?? "Couldn't update this item.");
    });
  }

  function addItem() {
    if (!newLabel.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addChecklistItem(eventId, newLabel);
      if (result.ok) {
        setNewLabel("");
        inputRef.current?.focus();
      } else {
        setError(result.error ?? "Couldn't add this item.");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Event readiness checklist</CardTitle>
        <span className="text-sm font-medium text-muted-foreground">
          {done} / {items.length}
        </span>
      </CardHeader>
      <CardContent>
        <Progress value={items.length ? (done / items.length) * 100 : 0} className="mb-4" />
        {items.length === 0 && <p className="mb-3 text-sm text-muted-foreground">No checklist items yet — add the first one below.</p>}
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                disabled={pending}
                className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-2 disabled:opacity-60"
                aria-pressed={item.done}
              >
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border",
                    item.done ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {item.done && <Check className="h-3 w-3" />}
                </span>
                <span className={cn(item.done && "text-muted-foreground line-through")}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2 border-t border-border pt-3">
          <Input
            ref={inputRef}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add a checklist item…"
            className="flex-1"
          />
          <Button size="sm" variant="secondary" onClick={addItem} disabled={pending || !newLabel.trim()}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </CardContent>
    </Card>
  );
}
