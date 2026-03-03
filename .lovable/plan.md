

# Integrate Automated DMs into DM Pipeline Page

## Problem
The DM Pipeline page only shows manually entered data from the "Add Entry" form. The `automated_dms` table (populated via Make.com webhooks) has actual Instagram/Facebook DM data, but it's not surfaced anywhere on this page. The Chat Stages chart and Conversion Funnel are empty because no manual entries have been logged.

## Solution
Merge the automated DMs data into the DM Pipeline page so the user can see their real Instagram and Facebook DM activity alongside (or instead of) manual entries.

### Changes

**1. `src/pages/DMPipelineWithSupabase.tsx`**
- Import and display the `AutomatedDMsList` component as a new tab alongside "View Entries" and "Add Entry"
- Add a new "Automated DMs" tab that shows the webhook-captured DMs with their status (new/responded/archived)
- Pull `getDMStats()` from `automated-dms-service` and show automated DM counts (total Instagram DMs, total Facebook DMs) in the top stats grid
- Add cards for "Instagram DMs Received" and "Facebook DMs Received" sourced from the automated_dms table

**2. `src/components/dm/ChatStagesChart.tsx`**
- Accept an optional `automatedStats` prop with counts from `automated_dms` (new, responded, archived)
- When no manual stage entries exist, use the automated DM statuses as a proxy for the pie chart: new = CONNECT, responded = QUALIFY, archived = CONVERT
- This way the chart shows real distribution even without manual entry

**3. `src/components/dm/DMFunnelChart.tsx`**
- Accept optional `automatedDMCount` prop
- When manual entries have 0 chats started, use automated DM total as the "Chats Started" top-of-funnel number so the funnel isn't completely empty

**4. `src/lib/types.ts`** (if needed)
- Ensure `DMPlatform` type includes `'instagram'` (it likely already does)

## File Summary

| File | Change |
|------|--------|
| `src/pages/DMPipelineWithSupabase.tsx` | Add Automated DMs tab, show automated DM stats in header cards |
| `src/components/dm/ChatStagesChart.tsx` | Fall back to automated DM status distribution when no manual stage data |
| `src/components/dm/DMFunnelChart.tsx` | Use automated DM count as fallback for top-of-funnel |

