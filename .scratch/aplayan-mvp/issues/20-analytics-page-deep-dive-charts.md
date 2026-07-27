# 20 — Analytics Page Deep-Dive Charts

**Status:** ready-for-agent

## Problem Statement
The basic status pie chart and 30-day bar chart on the dashboard do not provide job seekers with comprehensive pipeline intelligence, conversion ratios, salary distributions, or response-time metrics needed to optimize their job search strategy.

## Solution
Create a dedicated Analytics page (`/analytics`) featuring 6 deep-dive charts computed server-side via SQL/Eloquent aggregations. The suite includes an Application Funnel, 12-Week Application Volume bar chart, Status Distribution Over Time stacked area chart, Salary Insights comparison, Salary Band Distribution histogram, and Time-to-Response metric chart.

## User Stories
1. As a job seeker, I want to see an Application Funnel chart (Wishlist → Applied → Interviewing → Offer), so that I can identify where applications drop off in my pipeline.
2. As a job seeker, I want a 12-week application volume chart, so that I can track my long-term effort consistency.
3. As a job seeker, I want to view my salary expectations vs offered salaries across salary bands in ₱, so that I can evaluate offer competitiveness.
4. As a job seeker, I want to view average company response times (days from applied to first status change), so that I can set realistic expectations.

## Implementation Decisions
- **Backend Service**: Create `AnalyticsService` in `app/Services/` providing methods for `funnel()`, `weeklyVolume()`, `statusOverTime()`, `salaryInsights()`, `salaryBands()`, and `timeToResponse()`.
- **HTTP Controller**: Create `AnalyticsController` handling `GET /analytics` and passing aggregated arrays via Inertia page props.
- **Frontend Page**: Create `resources/js/pages/analytics/index.tsx` using `recharts` and `shadcn/ui` chart primitives arranged in a responsive 2-column grid layout.
- **Navigation Integration**: Add "Analytics" (`BarChart3` icon) link to `AppLayout` sidebar.
- **Zero-AI Cost**: All chart metrics are derived purely from stored database records without external AI API calls.

## Testing Decisions
- Write Pest feature tests in `tests/Feature/AnalyticsTest.php` asserting that `AnalyticsController` returns HTTP 200 and accurate aggregation arrays for authenticated users.
- Assert that users can only view their own analytics metrics (user scoping).

## Out of Scope
- CSV export from the analytics page (covered by issue 10 Data Export).
- AI text explanations of chart trends.
