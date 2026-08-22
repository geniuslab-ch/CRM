"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeEvent } from "@/lib/supabase/actions";

export function DeleteEventButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Remove ${name}? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await removeEvent(id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error ?? "Couldn't delete this event.");
      }
    });
  }

  return (
    <div>
      <Button variant="secondary" size="sm" onClick={handleDelete} disabled={pending}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        {pending ? "Removing…" : "Remove"}
      </Button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
