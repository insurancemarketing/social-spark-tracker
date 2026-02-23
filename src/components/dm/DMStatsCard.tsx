import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DMStats, DM_PLATFORM_LABELS } from "@/lib/types";
import { Facebook, Instagram, TrendingUp, Phone, Video, DollarSign } from "lucide-react";

interface DMStatsCardProps {
  stats: DMStats;
}

export function DMStatsCard({ stats }: DMStatsCardProps) {
  const Icon = stats.platform === "facebook" ? Facebook : Instagram;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{DM_PLATFORM_LABELS[stats.platform]}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">{stats.totalChatsStarted}</div>
            <p className="text-xs text-muted-foreground">Total Chats Started</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-blue-500" />
                <span className="font-medium">{stats.totalTriageBooked}</span>
              </div>
              <p className="text-xs text-muted-foreground">Triage Booked</p>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Video className="h-3 w-3 text-purple-500" />
                <span className="font-medium">{stats.totalStrategyBooked}</span>
              </div>
              <p className="text-xs text-muted-foreground">Strategy Booked</p>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-green-500" />
                <span className="font-medium">{stats.totalWins}</span>
              </div>
              <p className="text-xs text-muted-foreground">Wins</p>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-orange-500" />
                <span className="font-medium">{stats.conversionRate.toFixed(1)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
