

# Social Media Analytics Dashboard — Live API Approach

## Overview

Build a frontend-only analytics dashboard that pulls live data from platform APIs and displays it with rich filtering, sorting, and charts. No database or authentication needed.

**Phase 1 (now):** Full UI for all 4 platforms + live YouTube API integration
**Phase 2 (later):** Connect TikTok, Instagram, Facebook APIs as you get developer access

---

## Architecture

- **No backend/database** — all data comes from APIs in real-time
- **YouTube Data API v3** — live data for your channel (videos, views, watch time, subscribers)
- **TikTok, Instagram, Facebook** — UI built with placeholder/mock data, ready to connect when API access is available
- **API key stored securely** — YouTube API key will be used client-side (it's a public/restricted key, which is fine for YouTube Data API)

---

## What Gets Built

### Pages & Navigation
- **Dashboard** — overview cards, charts, time range selector
- **Content Tracker** — table of all posts/videos with filtering and sorting
- **Platform Pages** — YouTube, TikTok, Instagram, Facebook each get a dedicated page
- **Settings** — API key configuration

### Dashboard Features
- Total views, subscribers, engagement across platforms
- Trend indicators (up/down arrows)
- Time range selector (7d, 30d, 90d)
- Platform breakdown cards

### Content Tracker
- Sortable/filterable table of posts
- Filter by: platform, date range, content type
- Sort by: views, likes, engagement rate, date
- Search by title

### Charts (using Recharts, already installed)
- Views over time (line chart)
- Engagement breakdown (bar chart)
- Platform comparison
- Subscriber/follower growth trends

### YouTube Integration (live data)
- Fetches your channel stats and recent videos via YouTube Data API v3
- Shows: views, likes, comments, watch time, subscriber count
- Pulls video-level analytics

### Other Platforms (mock data for now)
- Full UI identical to YouTube pages
- Uses realistic mock data so the layout is ready
- Easy to swap in real API calls later

---

## Technical Details

### File Structure
```text
src/
  pages/
    Dashboard.tsx
    ContentTracker.tsx
    YouTubePage.tsx
    TikTokPage.tsx
    InstagramPage.tsx
    FacebookPage.tsx
    Settings.tsx
  components/
    layout/
      AppSidebar.tsx
      AppLayout.tsx
    dashboard/
      StatsCard.tsx
      TimeRangeSelector.tsx
      PlatformCard.tsx
    content/
      ContentTable.tsx
      FilterBar.tsx
      SortControls.tsx
    charts/
      ViewsChart.tsx
      EngagementChart.tsx
      PlatformComparisonChart.tsx
      GrowthChart.tsx
  hooks/
    useYouTubeData.ts
  lib/
    youtube-api.ts
    mock-data.ts
    types.ts
```

### YouTube API Integration
- Uses YouTube Data API v3 (channels.list, search.list, videos.list endpoints)
- API key entered in Settings page, stored in localStorage
- Custom React Query hooks for caching and refetching

### Filtering & Sorting
- Client-side filtering on the fetched data
- Filter controls: platform chips, date picker, content type dropdown
- Sort: clickable column headers in the content table

