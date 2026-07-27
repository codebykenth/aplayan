# 2. Zero-AI-Cost Job Search Intelligence and Analytics Architecture

Date: 2026-07-27

## Status
Accepted

## Context
Aplayan provides daily actionable guidance, pipeline analytics, and goal tracking for job seekers in the Philippines. Recurring AI token costs from LLM API calls could make the platform expensive or unsustainable to host for free on Vercel. We need an architecture that delivers high-value job search intelligence, deep pipeline analytics, and goal tracking without incurring recurring AI API costs on every page view or daily login.

## Decision
We adopt a **Zero-AI-Cost Job Search Intelligence Architecture** powered entirely by server-side PHP Eloquent queries:

1. **Server-Side Smart Action Feed (`ActionFeedService`)**:
   - The Dashboard surfaces 6 priority-ranked action items (Stale Follow-ups, Upcoming Interviews, High-Match Unactioned, Missing AI Analysis, Salary Negotiation Opportunities, Rejection Momentum Check).
   - All rules and triggers are evaluated using pure SQL / Eloquent queries in `ActionFeedService`. Zero AI API calls are made to construct the feed.

2. **Dedicated Analytics Suite (`AnalyticsService`)**:
   - Analytics charts are moved from the Dashboard into a dedicated `/analytics` page.
   - Includes 6 deep-dive charts: Application Funnel, 12-Week Application Volume, Status Distribution Over Time, Salary Insights (expected vs offered), Salary Band Distribution (Histogram), and Time-to-Response.
   - All aggregations are performed via database queries in `AnalyticsService`.

3. **Manual Goals with Pure Math Benchmarking**:
   - Users set their own weekly application targets (e.g. 10/week).
   - Benchmark suggestions (e.g. "Your 4-week average is 8/week") and streak counters are calculated via PHP math and past `date_applied` counts. Zero AI calls are used.

4. **Strictly On-Demand AI Triggers**:
   - Google Gemini API calls remain strictly on-demand via explicit button clicks (AI Resume Match, Salary Reality Check, Follow-Up Email Draft, Interview Prep).

## Consequences
- **Pros**:
  - $0 recurring AI token cost for daily usage, dashboard views, and analytics exploration.
  - Sub-millisecond response times for action feed and analytics rendering.
  - Deterministic, predictable behavior without LLM halluncination risks.
- **Cons**:
  - Requires writing robust SQL/Eloquent aggregation logic in service classes.
