# 4. Dashboard Recent Activity Sidebar Architecture

Date: 2026-07-27

## Status
Accepted

## Context
Job seekers track multiple job applications over time, performing updates such as changing application statuses, adding interview notes, marking applications as contacted, and running AI evaluations. Currently, these activities are logged individually inside `job_application_activities`, but there is no centralized, real-time activity stream on the main Dashboard to review recent progress across all applications.

We need a central activity log on the Dashboard that is visually clean, highly visible without excessive scrolling, non-intrusive to key metrics and charts, and fast without introducing N+1 database queries.

## Decision
We adopt a **Right Sidebar Recent Activity Stream Architecture**:

1. **Dashboard Layout Structure (`resources/js/pages/dashboard.tsx`)**:
   - The main Dashboard adopts a multi-column responsive grid on desktop (`grid-cols-1 lg:grid-cols-3` or `lg:grid-cols-4`).
   - The left 2–3 columns host the Action Feed, Metric Cards, and Chart Cards (Status Distribution Pie & 30-Day Trend Bar Chart).
   - The rightmost column hosts the dedicated **Recent Activity Card (`RecentActivityFeed`)**, ensuring recent updates are visible above the fold on desktop and responsive-stacked on mobile.

2. **Activity Event Coverage**:
   - Includes all key application events across the user's pipeline: status updates (`status_update`), application creation (`created`), note updates (`note`), contacted events (`contacted`), and AI evaluations (`ai_evaluated`).
   - Displays relative timestamps (e.g. "2 hours ago"), activity type badges/icons, company name, and description snippet.

3. **Direct Modal Interaction**:
   - Clicking any activity item triggers the `ApplicationDetailModal`, displaying full application details without navigating away from the Dashboard.

4. **Performance & Eager Loading (`ActivityService` / `DashboardController`)**:
   - Fetches the latest 10 activity records belonging to the authenticated user using Eloquent:
     `JobApplicationActivity::whereHas('jobApplication', fn($q) => $q->where('user_id', $user->id))->with('jobApplication')->latest()->take(10)`.
   - Prevents N+1 database queries when transforming activities into Inertia page props.

## Consequences
- **Pros**:
  - High visibility of recent job hunt activity above the fold on desktop.
  - One-click access to application details via modal directly from the feed.
  - 0 N+1 query overhead and zero external API dependencies.
- **Cons**:
  - Requires responsive grid adjustment for the Dashboard page layout.
