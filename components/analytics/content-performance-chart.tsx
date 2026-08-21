"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentOpportunities } from "@/lib/data/content";
import { ContentPlatform } from "@/types";

const PLATFORMS: ContentPlatform[] = ["Instagram", "TikTok", "YouTube", "LinkedIn"];
const COLORS: Record<ContentPlatform, string> = {
  Instagram: "#38bdf8",
  TikTok: "#f472b6",
  YouTube: "#f87171",
  LinkedIn: "#4ade80",
};

const data = contentOpportunities
  .filter((c) => c.status === "PUBLISHED" && c.performance)
  .map((c, idx) => ({
    index: idx + 1,
    [c.platform]: c.performance!.views,
  }));

export function ContentPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content performance — views by platform</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" vertical={false} />
              <XAxis dataKey="index" stroke="hsl(216 12% 62%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(216 12% 62%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(220 20% 9%)",
                  border: "1px solid hsl(220 14% 18%)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {PLATFORMS.map((p) => (
                <Line key={p} type="monotone" dataKey={p} stroke={COLORS[p]} strokeWidth={2} dot={false} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
