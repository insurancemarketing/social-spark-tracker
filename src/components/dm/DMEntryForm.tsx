import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DMEntry, DMPlatform } from "@/lib/types";
import { Plus } from "lucide-react";

interface DMEntryFormProps {
  onAdd?: (entry: Omit<DMEntry, "id">) => void;
}

export function DMEntryForm({ onAdd }: DMEntryFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    platform: "facebook" as DMPlatform,
    chatsStarted: "",
    activeChats: "",
    triageBooked: "",
    triageShowUp: "",
    strategyBooked: "",
    strategyShowUp: "",
    wins: "",
    nurture: "",
    connectStage: "",
    qualifyStage: "",
    convertStage: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: Omit<DMEntry, "id"> = {
      date: formData.date,
      day: new Date(formData.date).toLocaleDateString("en-US", { weekday: "long" }),
      platform: formData.platform,
      chatsStarted: parseInt(formData.chatsStarted) || 0,
      activeChats: parseInt(formData.activeChats) || 0,
      triageBooked: parseInt(formData.triageBooked) || 0,
      triageShowUp: parseInt(formData.triageShowUp) || 0,
      strategyBooked: parseInt(formData.strategyBooked) || 0,
      strategyShowUp: parseInt(formData.strategyShowUp) || 0,
      wins: parseInt(formData.wins) || 0,
      nurture: parseInt(formData.nurture) || 0,
      connectStage: parseInt(formData.connectStage) || 0,
      qualifyStage: parseInt(formData.qualifyStage) || 0,
      convertStage: parseInt(formData.convertStage) || 0,
    };

    if (onAdd) {
      onAdd(entry);
    }

    toast({
      title: "Entry Added!",
      description: `DM tracking entry for ${formData.platform} on ${formData.date} has been saved.`,
    });

    // Reset form
    setFormData({
      ...formData,
      chatsStarted: "",
      activeChats: "",
      triageBooked: "",
      triageShowUp: "",
      strategyBooked: "",
      strategyShowUp: "",
      wins: "",
      nurture: "",
      connectStage: "",
      qualifyStage: "",
      convertStage: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Daily DM Entry</CardTitle>
        <CardDescription>Track your daily outreach and chat progression</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value as DMPlatform })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chatsStarted">Chats Started</Label>
              <Input
                id="chatsStarted"
                type="number"
                min="0"
                value={formData.chatsStarted}
                onChange={(e) => setFormData({ ...formData, chatsStarted: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activeChats">Active Chats</Label>
              <Input
                id="activeChats"
                type="number"
                min="0"
                value={formData.activeChats}
                onChange={(e) => setFormData({ ...formData, activeChats: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="triageBooked">Triage Booked</Label>
              <Input
                id="triageBooked"
                type="number"
                min="0"
                value={formData.triageBooked}
                onChange={(e) => setFormData({ ...formData, triageBooked: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="triageShowUp">Triage Show-Up</Label>
              <Input
                id="triageShowUp"
                type="number"
                min="0"
                value={formData.triageShowUp}
                onChange={(e) => setFormData({ ...formData, triageShowUp: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategyBooked">Strategy Booked</Label>
              <Input
                id="strategyBooked"
                type="number"
                min="0"
                value={formData.strategyBooked}
                onChange={(e) => setFormData({ ...formData, strategyBooked: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategyShowUp">Strategy Show-Up</Label>
              <Input
                id="strategyShowUp"
                type="number"
                min="0"
                value={formData.strategyShowUp}
                onChange={(e) => setFormData({ ...formData, strategyShowUp: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wins">Wins/Sales</Label>
              <Input
                id="wins"
                type="number"
                min="0"
                value={formData.wins}
                onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nurture">Nurture/Follow-Up</Label>
              <Input
                id="nurture"
                type="number"
                min="0"
                value={formData.nurture}
                onChange={(e) => setFormData({ ...formData, nurture: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Chat Stage Breakdown</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="connectStage">CONNECT Stage</Label>
                <Input
                  id="connectStage"
                  type="number"
                  min="0"
                  value={formData.connectStage}
                  onChange={(e) => setFormData({ ...formData, connectStage: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifyStage">QUALIFY Stage</Label>
                <Input
                  id="qualifyStage"
                  type="number"
                  min="0"
                  value={formData.qualifyStage}
                  onChange={(e) => setFormData({ ...formData, qualifyStage: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="convertStage">CONVERT Stage</Label>
                <Input
                  id="convertStage"
                  type="number"
                  min="0"
                  value={formData.convertStage}
                  onChange={(e) => setFormData({ ...formData, convertStage: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
