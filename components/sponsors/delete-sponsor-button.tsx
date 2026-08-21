"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSponsor } from "@/lib/supabase/actions";

export function DeleteSponsorButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove ${name} from the sponsor CRM? This can't be undone.`)) return;
    setPending(true);
    const result = await deleteSponsor(id);
    if (result.ok) {
      router.push("/sponsors");
    } else {
      setPending(false);
      alert(result.error ?? "Couldn't delete this sponsor.");
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleDelete} disabled={pending}>
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      {pending ? "Removing…" : "Remove"}
    </Button>
  );
}
