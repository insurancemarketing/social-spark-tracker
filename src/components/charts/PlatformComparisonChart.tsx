import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformStats, PLATFORM_LABELS } from "@/lib/types";

const COLORS: Record<string, string> = {
  youtube: "hsl(0, 100%, 50%)",
  tiktok: "hsl(169, 100%, 46%)",
  instagram: "hsl(330, 100%, 50%)",
  facebook: "hsl(220, 46%, 48%)",
};

export function PlatformComparisonChart({ stats }: { stats: PlatformStats[] }) {
  const data = stats.map((s) => ({
    name: PLATFORM_LABELS[s.platform],
    views: s.totalViews,
    fill: COLORS[s.platform],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Platform Comparison (Views)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
              <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                {data.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
