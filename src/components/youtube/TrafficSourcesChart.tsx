import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrafficSource } from "@/lib/youtube-analytics-service";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TrafficSourcesChartProps {
  sources: TrafficSource[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

const SOURCE_EXPLANATIONS: Record<string, string> = {
  'YouTube Search': 'People found your video by searching on YouTube. High = good SEO/keywords.',
  'Suggested Videos': 'Your video was recommended by YouTube algorithm. High = good retention.',
  'Subscribers': 'Your subscribers clicked from their feed. Shows loyal audience.',
  'Playlists': 'From playlists (yours or others). Good for watch time.',
  'External Websites': 'Shared on other websites/social media. Shows virality.',
  'Browse Features': 'From YouTube homepage, trending, or subscriptions feed.',
  'Notifications': 'Clicked from notification bell. Shows engaged subscribers.',
  'Other YouTube Features': 'From comments, community posts, etc.',
};

export function TrafficSourcesChart({ sources }: TrafficSourcesChartProps) {
  const chartData = sources.map((source, index) => ({
    name: source.source,
    value: source.views,
    percentage: source.percentage,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your views are coming from</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Understanding Traffic Sources:</p>
                <p className="text-xs">This shows how people find your videos. Use this to optimize:</p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• High Search = Good titles/keywords</li>
                  <li>• High Suggested = Good retention</li>
                  <li>• High Browse = YouTube is promoting you</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Views",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 space-y-2">
          {sources.map((source, index) => (
            <TooltipProvider key={source.source}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between text-sm p-2 rounded hover:bg-accent cursor-help">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{source.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{source.views.toLocaleString()} views</span>
                      <span className="text-muted-foreground">({source.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    {SOURCE_EXPLANATIONS[source.source] || 'Traffic from this source.'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
