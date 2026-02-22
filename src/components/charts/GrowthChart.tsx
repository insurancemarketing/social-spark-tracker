import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

export function GrowthChart({ data, timeRange }: Props) {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

  const chartData = useMemo(() => {
    const ytData = data.find((d) => d.platform === "youtube");
    if (!ytData) return [];
    const sliced = ytData.metrics.slice(-days);
    let cumulative = 0;
    return sliced.map((m) => {
      cumulative += m.subscribers || 0;
      return { date: m.date, subscribers: cumulative };
    });
  }, [data, days]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subscriber Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="subscribers" stroke={COLORS.youtube} fill={COLORS.youtube} fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
