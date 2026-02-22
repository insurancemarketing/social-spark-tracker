import { Platform, ContentType, PLATFORM_LABELS, CONTENT_TYPE_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  platformFilter: Platform | "all";
  onPlatformChange: (v: Platform | "all") => void;
  contentTypeFilter: ContentType | "all";
  onContentTypeChange: (v: ContentType | "all") => void;
}

const platformColorClass: Record<string, string> = {
  youtube: "bg-youtube/10 text-youtube border-youtube/30",
  tiktok: "bg-tiktok/10 text-tiktok border-tiktok/30",
  instagram: "bg-instagram/10 text-instagram border-instagram/30",
  facebook: "bg-facebook/10 text-facebook border-facebook/30",
};

export function FilterBar({ search, onSearchChange, platformFilter, onPlatformChange, contentTypeFilter, onContentTypeChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search content..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
        {search && (
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2" onClick={() => onSearchChange("")}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant={platformFilter === "all" ? "default" : "outline"}
          size="sm"
          className="h-8 text-xs"
          onClick={() => onPlatformChange("all")}
        >
          All
        </Button>
        {(Object.keys(PLATFORM_LABELS) as Platform[]).map((p) => (
          <Button
            key={p}
            variant="outline"
            size="sm"
            className={cn("h-8 text-xs border", platformFilter === p ? platformColorClass[p] : "")}
            onClick={() => onPlatformChange(p === platformFilter ? "all" : p)}
          >
            {PLATFORM_LABELS[p]}
          </Button>
        ))}
      </div>

      <Select value={contentTypeFilter} onValueChange={(v) => onContentTypeChange(v as ContentType | "all")}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Content type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((ct) => (
            <SelectItem key={ct} value={ct}>{CONTENT_TYPE_LABELS[ct]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
