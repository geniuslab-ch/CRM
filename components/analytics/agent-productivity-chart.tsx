"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agents } from "@/lib/data/agents";

const data = agents.map((a) => ({ name: a.name, tasks: a.tasksCompleted }));

export function AgentProductivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI productivity — tasks completed per agent</CardTitle>
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
              <Bar dataKey="tasks" fill="#a3e635" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
