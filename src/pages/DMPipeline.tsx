import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DMEntryForm } from "@/components/dm/DMEntryForm";
import { DMStatsCard } from "@/components/dm/DMStatsCard";
import { DMFunnelChart } from "@/components/dm/DMFunnelChart";
import { ChatStagesChart } from "@/components/dm/ChatStagesChart";
import { DMEntriesTable } from "@/components/dm/DMEntriesTable";
import { mockDMEntries, mockDMStats } from "@/lib/dm-mock-data";
import { DMEntry } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, TrendingUp } from "lucide-react";

export default function DMPipeline() {
  const [entries, setEntries] = useState<DMEntry[]>(mockDMEntries);

  const handleAddEntry = (newEntry: Omit<DMEntry, "id">) => {
    const entry: DMEntry = {
      ...newEntry,
      id: Date.now().toString(),
    };
    setEntries([entry, ...entries]);
  };

  // Calculate overall totals
  const totalChatsStarted = entries.reduce((sum, e) => sum + e.chatsStarted, 0);
  const totalWins = entries.reduce((sum, e) => sum + e.wins, 0);
  const overallWinRate = totalChatsStarted > 0 ? (totalWins / totalChatsStarted) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DM Pipeline Tracker</h1>
            <p className="text-sm text-muted-foreground">Track your Facebook & Instagram outreach progression</p>
          </div>
        </div>

        {/* Chat Flow Reference Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Donkey Kong Chat Progression
            </CardTitle>
            <CardDescription>Your 3-stage chat flow model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="font-semibold text-blue-600 dark:text-blue-400">1️⃣ CONNECT</div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Appear</li>
                  <li>• Opener</li>
                  <li>• This or That</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-purple-600 dark:text-purple-400">2️⃣ QUALIFY</div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• GAP</li>
                  <li>• NEED</li>
                  <li>• HELP</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-green-600 dark:text-green-400">3️⃣ CONVERT</div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• SUGGEST</li>
                  <li>• OFFER</li>
                  <li>• CONFIRM</li>
                  <li>• SMOKE BOMB</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium">💡 The Three A's (between every response):</p>
              <p className="text-sm text-muted-foreground">ACKNOWLEDGE → ADD → ASK</p>
            </div>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chats Started</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChatsStarted}</div>
              <p className="text-xs text-muted-foreground">All platforms combined</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalWins}</div>
              <p className="text-xs text-muted-foreground">Sales closed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallWinRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Conversion rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goal: 10% Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {overallWinRate >= 10 ? "✅ Crushing it!" : `${(10 - overallWinRate).toFixed(1)}% to go`}
              </div>
              <p className="text-xs text-muted-foreground">Track your progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          {mockDMStats.map((stats) => (
            <DMStatsCard key={stats.platform} stats={stats} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <DMFunnelChart stats={mockDMStats} />
          <ChatStagesChart entries={entries} />
        </div>

        {/* Tabs for Entry Form and Table */}
        <Tabs defaultValue="entries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="entries">View Entries</TabsTrigger>
            <TabsTrigger value="add">Add Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="entries">
            <DMEntriesTable entries={entries} />
          </TabsContent>

          <TabsContent value="add">
            <DMEntryForm onAdd={handleAddEntry} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
