import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ContentItem, Platform, ContentType, PLATFORM_LABELS, CONTENT_TYPE_LABELS } from "@/lib/types";
import { FilterBar } from "./FilterBar";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "views" | "likes" | "comments" | "shares" | "publishDate";

const platformBadgeClass: Record<string, string> = {
  youtube: "bg-youtube/15 text-youtube border-youtube/30",
  tiktok: "bg-tiktok/15 text-tiktok border-tiktok/30",
  instagram: "bg-instagram/15 text-instagram border-instagram/30",
  facebook: "bg-facebook/15 text-facebook border-facebook/30",
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function ContentTable({ data }: { data: ContentItem[] }) {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("publishDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    let items = [...data];
    if (search) items = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));
    if (platformFilter !== "all") items = items.filter((i) => i.platform === platformFilter);
    if (contentTypeFilter !== "all") items = items.filter((i) => i.contentType === contentTypeFilter);
    items.sort((a, b) => {
      const av = sortKey === "publishDate" ? new Date(a.publishDate).getTime() : a[sortKey];
      const bv = sortKey === "publishDate" ? new Date(b.publishDate).getTime() : b[sortKey];
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return items;
  }, [data, search, platformFilter, contentTypeFilter, sortKey, sortDir]);

  const SortableHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(sortKeyName)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("h-3 w-3", sortKey === sortKeyName ? "text-foreground" : "text-muted-foreground/50")} />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        platformFilter={platformFilter}
        onPlatformChange={setPlatformFilter}
        contentTypeFilter={contentTypeFilter}
        onContentTypeChange={setContentTypeFilter}
      />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Title</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Type</TableHead>
              <SortableHeader label="Views" sortKeyName="views" />
              <SortableHeader label="Likes" sortKeyName="likes" />
              <SortableHeader label="Comments" sortKeyName="comments" />
              <SortableHeader label="Shares" sortKeyName="shares" />
              <SortableHeader label="Date" sortKeyName="publishDate" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No content found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", platformBadgeClass[item.platform])}>
                      {PLATFORM_LABELS[item.platform]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{CONTENT_TYPE_LABELS[item.contentType]}</TableCell>
                  <TableCell>{formatNumber(item.views)}</TableCell>
                  <TableCell>{formatNumber(item.likes)}</TableCell>
                  <TableCell>{formatNumber(item.comments)}</TableCell>
                  <TableCell>{formatNumber(item.shares)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.publishDate}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} items</p>
    </div>
  );
}
