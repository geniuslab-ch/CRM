"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Microscope, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResearchButton({ sponsorId }: { sponsorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function run() {
    setLoading(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/ai/research-sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorId }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Research failed");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't complete research.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={run} disabled={loading}>
        <Microscope className={loading ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} aria-hidden="true" />
        {loading ? "Researching…" : "Research this company"}
      </Button>
      {done && (
        <span className="flex items-center gap-1 text-xs text-success">
          <Check className="h-3 w-3" aria-hidden="true" /> Updated with fresh research.
        </span>
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
