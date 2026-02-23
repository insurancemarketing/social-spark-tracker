import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DMEntry } from "@/lib/types";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface ChatStagesChartProps {
  entries: DMEntry[];
}

export function ChatStagesChart({ entries }: ChatStagesChartProps) {
  // Aggregate stage data across all entries
  const stageData = entries.reduce(
    (acc, entry) => ({
      connect: acc.connect + entry.connectStage,
      qualify: acc.qualify + entry.qualifyStage,
      convert: acc.convert + entry.convertStage,
    }),
    { connect: 0, qualify: 0, convert: 0 }
  );

  const chartData = [
    { name: "CONNECT", value: stageData.connect, fill: "#3b82f6" },
    { name: "QUALIFY", value: stageData.qualify, fill: "#8b5cf6" },
    { name: "CONVERT", value: stageData.convert, fill: "#10b981" },
  ];

  const total = stageData.connect + stageData.qualify + stageData.convert;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Stage Distribution</CardTitle>
        <CardDescription>Where prospects are in your Donkey Kong progression</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Chats",
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>CONNECT</span>
            </div>
            <span className="font-medium">
              {stageData.connect} ({total > 0 ? ((stageData.connect / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span>QUALIFY</span>
            </div>
            <span className="font-medium">
              {stageData.qualify} ({total > 0 ? ((stageData.qualify / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>CONVERT</span>
            </div>
            <span className="font-medium">
              {stageData.convert} ({total > 0 ? ((stageData.convert / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
