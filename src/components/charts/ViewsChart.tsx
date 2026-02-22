import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformDailyData, TimeRange } from "@/lib/types";
import { useMemo } from "react";

const COLORS: Record<string, string> = {
  youtube: "hsl(0, 100%, 50%)",
  tiktok: "hsl(169, 100%, 46%)",
  instagram: "hsl(330, 100%, 50%)",
  facebook: "hsl(220, 46%, 48%)",
};

interface Props {
  data: PlatformDailyData[];
  timeRange: TimeRange;
}

export function ViewsChart({ data, timeRange }: Props) {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

  const chartData = useMemo(() => {
    const merged: Record<string, any> = {};
    data.forEach(({ platform, metrics }) => {
      const sliced = metrics.slice(-days);
      sliced.forEach((m) => {
        if (!merged[m.date]) merged[m.date] = { date: m.date };
        merged[m.date][platform] = m.views;
      });
    });
    return Object.values(merged).sort((a, b) => a.date.localeCompare(b.date));
  }, [data, days]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Views Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend />
              {data.map(({ platform }) => (
                <Line key={platform} type="monotone" dataKey={platform} stroke={COLORS[platform]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
