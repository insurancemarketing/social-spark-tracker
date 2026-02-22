import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformStats, PLATFORM_LABELS } from "@/lib/types";

export function EngagementChart({ stats }: { stats: PlatformStats[] }) {
  const data = stats.map((s) => ({
    name: PLATFORM_LABELS[s.platform],
    Likes: s.totalLikes,
    Comments: s.totalComments,
    Shares: s.totalShares,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Engagement Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Bar dataKey="Likes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Comments" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Shares" fill="hsl(var(--accent-foreground))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
