"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EventChecklistItem } from "@/types";
import { cn } from "@/lib/utils";

export function EventChecklist({ items }: { items: EventChecklistItem[] }) {
  const [state, setState] = useState(items);
  const done = state.filter((i) => i.done).length;

  function toggle(id: string) {
    setState((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Event readiness checklist</CardTitle>
        <span className="text-sm font-medium text-muted-foreground">
          {done} / {state.length}
        </span>
      </CardHeader>
      <CardContent>
        <Progress value={(done / state.length) * 100} className="mb-4" />
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {state.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-2"
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
      </CardContent>
    </Card>
  );
}
