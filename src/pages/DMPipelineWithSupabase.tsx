import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DMEntryForm } from "@/components/dm/DMEntryForm";
import { DMStatsCard } from "@/components/dm/DMStatsCard";
import { DMFunnelChart } from "@/components/dm/DMFunnelChart";
import { ChatStagesChart } from "@/components/dm/ChatStagesChart";
import { DMEntriesTable } from "@/components/dm/DMEntriesTable";
import { AutomatedDMsList } from "@/components/dm/AutomatedDMsList";
import { DMEntry, DMStats } from "@/lib/types";
import { fetchDMEntries, addDMEntry, calculateDMStats } from "@/lib/dm-service";
import { getDMStats } from "@/lib/automated-dms-service";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp, Loader2, Instagram, Facebook, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DMPipeline() {
  const [entries, setEntries] = useState<DMEntry[]>([]);
  const [stats, setStats] = useState<DMStats[]>([]);
  const [automatedStats, setAutomatedStats] = useState({ total: 0, new: 0, responded: 0, archived: 0, instagram: 0, facebook: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleSyncDMs = async () => {
    try {
      setSyncing(true);
      const { data, error } = await supabase.functions.invoke('poll-instagram-dms');
      if (error) throw error;
      toast({
        title: "DMs Synced!",
        description: `Checked ${data.conversations_checked} conversations, synced ${data.messages_synced} new messages.`,
      });
      await loadData();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Could not sync Instagram DMs. Make sure your account is connected with messaging permissions.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Load entries on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, statsData, autoStats] = await Promise.all([
        fetchDMEntries(),
        calculateDMStats(),
        getDMStats(),
      ]);
      setEntries(entriesData);
      setStats(statsData);
      setAutomatedStats(autoStats);
    } catch (error) {
      console.error('Error loading DM data:', error);
      toast({
        title: "Error",
        description: "Failed to load DM tracking data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (newEntry: Omit<DMEntry, "id">) => {
    try {
      const entry = await addDMEntry(newEntry);
      setEntries([entry, ...entries]);

      // Recalculate stats
      const newStats = await calculateDMStats();
      setStats(newStats);

      toast({
        title: "Entry Added!",
        description: `DM tracking entry for ${newEntry.platform} on ${newEntry.date} has been saved.`,
      });
    } catch (error) {
      console.error('Error adding entry:', error);
      toast({
        title: "Error",
        description: "Failed to add entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate overall totals
  const totalChatsStarted = entries.reduce((sum, e) => sum + e.chatsStarted, 0);
  const totalWins = entries.reduce((sum, e) => sum + e.wins, 0);
  const effectiveChats = totalChatsStarted || automatedStats.total;
  const overallWinRate = effectiveChats > 0 ? (totalWins / effectiveChats) * 100 : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading your DM tracking data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DM Pipeline Tracker</h1>
            <p className="text-sm text-muted-foreground">Track your Facebook & Instagram outreach progression</p>
          </div>
          <Button onClick={handleSyncDMs} disabled={syncing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync DMs Now'}
          </Button>
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
              <div className="text-2xl font-bold">{totalChatsStarted || automatedStats.total}</div>
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
              <CardTitle className="text-sm font-medium">Instagram DMs</CardTitle>
              <Instagram className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{automatedStats.instagram}</div>
              <p className="text-xs text-muted-foreground">Received via automation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facebook DMs</CardTitle>
              <Facebook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{automatedStats.facebook}</div>
              <p className="text-xs text-muted-foreground">Received via automation</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((platformStats) => (
            <DMStatsCard key={platformStats.platform} stats={platformStats} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <DMFunnelChart stats={stats} automatedDMCount={automatedStats.total} />
          <ChatStagesChart entries={entries} automatedStats={automatedStats} />
        </div>

        {/* Tabs for Entry Form and Table */}
        <Tabs defaultValue="automated" className="space-y-4">
          <TabsList>
            <TabsTrigger value="automated">Automated DMs</TabsTrigger>
            <TabsTrigger value="entries">Manual Entries</TabsTrigger>
            <TabsTrigger value="add">Add Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="automated">
            <AutomatedDMsList />
          </TabsContent>

          <TabsContent value="entries">
            {entries.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-2">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No entries yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start tracking your DM outreach by adding your first entry!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <DMEntriesTable entries={entries} />
            )}
          </TabsContent>

          <TabsContent value="add">
            <DMEntryForm onAdd={handleAddEntry} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
