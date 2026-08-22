"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from "@/types";

// Real per-agent output — each agent's live metricValue (players
// analyzed, clubs identified, prospects found, companies researched,
// messages sent, replies classified, meetings booked, content ideas —
// all plain counts, so comparable on one axis) computed by
// lib/agents/liveTeam.ts. There's no real per-action task log yet, so
// this replaces the old "tasks completed" chart, which had no backing
// data source at all.
export function AgentProductivityChart({ agents }: { agents: Agent[] }) {
  const data = agents.map((a) => ({ name: a.name, output: Number(a.metricValue) || 0 }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI team output — real counts per agent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="hsl(216 12% 62%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="hsl(216 12% 62%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(220 18% 12%)" }}
                contentStyle={{
                  background: "hsl(220 20% 9%)",
                  border: "1px solid hsl(220 14% 18%)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="output" fill="#a3e635" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
