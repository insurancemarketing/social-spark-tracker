import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DMEntry, DM_PLATFORM_LABELS } from "@/lib/types";
import { Facebook, Instagram } from "lucide-react";

interface DMEntriesTableProps {
  entries: DMEntry[];
}

export function DMEntriesTable({ entries }: DMEntriesTableProps) {
  // Sort by date descending
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily DM Entries</CardTitle>
        <CardDescription>Detailed breakdown of your daily outreach performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Chats Started</TableHead>
                <TableHead className="text-right">Active</TableHead>
                <TableHead className="text-right">Triage Booked</TableHead>
                <TableHead className="text-right">Triage Show</TableHead>
                <TableHead className="text-right">Strategy Booked</TableHead>
                <TableHead className="text-right">Strategy Show</TableHead>
                <TableHead className="text-right">Wins</TableHead>
                <TableHead className="text-right">Nurture</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.day}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entry.platform === "facebook" ? (
                        <Facebook className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Instagram className="h-4 w-4 text-pink-600" />
                      )}
                      <span className="text-sm">{DM_PLATFORM_LABELS[entry.platform]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{entry.chatsStarted}</TableCell>
                  <TableCell className="text-right">{entry.activeChats}</TableCell>
                  <TableCell className="text-right">{entry.triageBooked}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={entry.triageShowUp >= entry.triageBooked * 0.7 ? "default" : "secondary"}>
                      {entry.triageShowUp}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{entry.strategyBooked}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={entry.strategyShowUp >= entry.strategyBooked * 0.7 ? "default" : "secondary"}>
                      {entry.strategyShowUp}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={entry.wins > 0 ? "default" : "outline"} className="bg-green-600">
                      {entry.wins}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{entry.nurture}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
