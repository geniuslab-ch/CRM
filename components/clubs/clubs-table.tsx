"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Club } from "@/types";
import { formatDate } from "@/lib/utils";
import { SWISS_CITIES } from "@/lib/data/seed";

const STATUSES = ["ALL", "IDENTIFIED", "CONTACTED", "INTERESTED", "PLAYERS_PROPOSED", "CONFIRMED", "PARTNER"];
const POTENTIALS = ["ALL", "LOW", "MEDIUM", "HIGH"];

export function ClubsTable({ clubs }: { clubs: Club[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [city, setCity] = useState("ALL");
  const [potential, setPotential] = useState("ALL");

  const filtered = useMemo(() => {
    return clubs.filter((c) => {
      if (status !== "ALL" && c.status !== status) return false;
      if (city !== "ALL" && c.city !== city) return false;
      if (potential !== "ALL" && c.potential !== potential) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [clubs, query, status, city, potential]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs…"
            className="pl-9"
            aria-label="Search clubs"
          />
        </div>
        <Select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city" className="sm:w-44">
          <option value="ALL">All cities</option>
          {SWISS_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="sm:w-48">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s.replace("_", " ")}
            </option>
          ))}
        </Select>
        <Select value={potential} onChange={(e) => setPotential(e.target.value)} aria-label="Filter by potential" className="sm:w-40">
          {POTENTIALS.map((p) => (
            <option key={p} value={p}>
              {p === "ALL" ? "All potential" : p}
            </option>
          ))}
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {clubs.length} clubs
      </p>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Club</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Players identified</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Engagement</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Potential</th>
                <th className="px-4 py-3 font-medium">Last contact</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <a href={c.website} className="text-xs text-muted-foreground hover:text-primary" target="_blank" rel="noreferrer">
                      {c.website.replace("https://", "")}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.playersIdentified}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{c.contactName}</p>
                    <p className="text-xs text-muted-foreground">{c.contactEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.engagementType === "PLAYER_RECRUITMENT" ? "info" : "accent"}>
                      {c.engagementType === "PLAYER_RECRUITMENT"
                        ? "Player recruitment"
                        : c.engagementType === "BOTH"
                        ? "Recruitment + partnership"
                        : "Commercial partnership"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.potential} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.lastContact)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No clubs match your filters.
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
