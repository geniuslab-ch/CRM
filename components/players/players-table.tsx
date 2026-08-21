"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { Player } from "@/types";
import { formatDate, formatNumber, initials } from "@/lib/utils";
import { SWISS_CITIES } from "@/lib/data/seed";

const STATUSES = ["ALL", "IDENTIFIED", "CONTACTED", "INTERESTED", "CONFIRMED", "DECLINED"];

export function PlayersTable({ players }: { players: Player[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [city, setCity] = useState("ALL");

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (status !== "ALL" && p.status !== status) return false;
      if (city !== "ALL" && p.city !== city) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !(p.club ?? "").toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [players, query, status, city]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by player or club…"
            className="pl-9"
            aria-label="Search players"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="sm:w-48">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s}
            </option>
          ))}
        </Select>
        <Select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city" className="sm:w-44">
          <option value="ALL">All cities</option>
          {SWISS_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {players.length} players
      </p>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Age</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Club</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Social audience</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last contact</th>
                <th className="px-4 py-3 font-medium">AI recommendation</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold">
                        {initials(p.name)}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.age}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.club ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-display font-semibold text-primary">{p.playerScore}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatNumber(p.socialAudience)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.lastContact)}</td>
                  <td className="px-4 py-3 max-w-[220px] text-xs text-muted-foreground">{p.aiRecommendation}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No players match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
