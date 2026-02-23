import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [selectedRange, setSelectedRange] = useState<string>("30");

  const getDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    const { startDate, endDate } = getDateRange(parseInt(value));
    onDateRangeChange(startDate, endDate);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <label className="text-sm font-medium">Date Range</label>
            <p className="text-xs text-muted-foreground">Select time period for analytics</p>
          </div>
          <Select value={selectedRange} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
