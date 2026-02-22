

# Social Media Analytics Dashboard

A full-featured analytics tracker for **YouTube, TikTok, Instagram, Facebook** (and extensible to more platforms) with a database backend, rich filtering/sorting, and data visualization.

## Core Features

### 1. Dashboard Overview
- At-a-glance stats across all platforms: total views, subscribers/followers gained, average retention, top-performing content
- Platform-specific cards showing key metrics with trend indicators (up/down vs last period)
- Time range selector (7d, 30d, 90d, custom)

### 2. Content Tracker (Per-Post Analytics)
- Log individual posts/videos with: title, platform, publish date, views, likes, comments, shares, watch time/retention, subscriber/follower impact
- Manual entry form with platform-specific fields (e.g., "view duration" for YouTube, "saves" for Instagram)
- CSV upload to bulk-import analytics exports from each platform
- Edit and update stats over time as numbers change

### 3. Advanced Filtering & Sorting
- Filter by platform (YouTube, TikTok, Instagram, Facebook)
- Filter by date range, content type (video, reel, story, post), performance tier
- Sort by views, engagement rate, retention, subscriber gain, date posted
- Save custom filter presets for quick access

### 4. Charts & Visualizations
- Views over time (line chart, per platform or combined)
- Engagement breakdown (bar chart: likes, comments, shares)
- Platform comparison charts
- Growth trends for subscribers/followers
- Retention/watch time distribution

### 5. Platform Pages
- Dedicated page per platform with platform-specific metrics and insights
- YouTube: view duration, CTR, subscriber delta
- TikTok: completion rate, shares, profile views
- Instagram: saves, reach, story views
- Facebook: reach, reactions, shares

### 6. Database & Authentication
- Supabase backend to persist all data
- User authentication (login/signup) so your data is private and accessible from any device
- All content entries linked to your account

## Data Input
- **Manual entry**: Quick form to add a new post's stats
- **CSV upload**: Bulk import from platform analytics exports
- **YouTube API** (future phase): Auto-pull video stats from your channel

## Design
- Clean, modern dark/light mode dashboard
- Responsive — works on desktop and mobile
- Card-based layout with clear data hierarchy

