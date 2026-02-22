import { AppLayout } from "@/components/layout/AppLayout";
import { ContentTable } from "@/components/content/ContentTable";
import { mockContent } from "@/lib/mock-data";

export default function ContentTracker() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Tracker</h1>
          <p className="text-sm text-muted-foreground">All your posts and videos across platforms</p>
        </div>
        <ContentTable data={mockContent} />
      </div>
    </AppLayout>
  );
}
