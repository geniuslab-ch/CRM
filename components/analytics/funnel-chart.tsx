"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#a3e635", "#38bdf8", "#facc15", "#4ade80", "#f472b6", "#c084fc"];

export function FunnelChart({
  title,
  data,
}: {
  title: string;
  data: { stage: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 12, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" horizontal={false} />
              <XAxis type="number" stroke="hsl(216 12% 62%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="stage"
                stroke="hsl(216 12% 62%)"
                fontSize={12}
                width={110}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(220 18% 12%)" }}
                contentStyle={{
                  background: "hsl(220 20% 9%)",
                  border: "1px solid hsl(220 14% 18%)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
