import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DMStats } from "@/lib/types";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface DMFunnelChartProps {
  stats: DMStats[];
}

export function DMFunnelChart({ stats }: DMFunnelChartProps) {
  // Aggregate all platforms
  const combined = stats.reduce(
    (acc, stat) => ({
      chatsStarted: acc.chatsStarted + stat.totalChatsStarted,
      triageBooked: acc.triageBooked + stat.totalTriageBooked,
      triageShowUp: acc.triageShowUp + stat.totalTriageShowUp,
      strategyBooked: acc.strategyBooked + stat.totalStrategyBooked,
      strategyShowUp: acc.strategyShowUp + stat.totalStrategyShowUp,
      wins: acc.wins + stat.totalWins,
    }),
    {
      chatsStarted: 0,
      triageBooked: 0,
      triageShowUp: 0,
      strategyBooked: 0,
      strategyShowUp: 0,
      wins: 0,
    }
  );

  const funnelData = [
    { stage: "Chats Started", count: combined.chatsStarted, fill: "hsl(var(--chart-1))" },
    { stage: "Triage Booked", count: combined.triageBooked, fill: "hsl(var(--chart-2))" },
    { stage: "Triage Show", count: combined.triageShowUp, fill: "hsl(var(--chart-3))" },
    { stage: "Strategy Booked", count: combined.strategyBooked, fill: "hsl(var(--chart-4))" },
    { stage: "Strategy Show", count: combined.strategyShowUp, fill: "hsl(var(--chart-5))" },
    { stage: "Wins", count: combined.wins, fill: "hsl(142.1 76.2% 36.3%)" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>Pipeline progression from outreach to win</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Count",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={120} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {combined.triageBooked > 0 ? ((combined.triageShowUp / combined.triageBooked) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Triage Show Rate</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">
              {combined.strategyBooked > 0 ? ((combined.strategyShowUp / combined.strategyBooked) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Strategy Show Rate</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {combined.chatsStarted > 0 ? ((combined.wins / combined.chatsStarted) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Overall Win Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
