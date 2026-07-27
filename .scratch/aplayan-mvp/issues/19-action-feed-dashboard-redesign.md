# 19 — Smart Action Feed & Dashboard Redesign

**Status:** ready-for-agent

## Problem Statement
Job seekers open their dashboard looking for direction, but static metric cards and charts only tell them what already happened. They lack immediate, actionable guidance on what specific applications require follow-ups, interview preparation, or AI match evaluation today.

## Solution
Redesign the authenticated Dashboard to place a server-side Smart Action Feed front-and-center. The feed dynamically surface 6 priority-ranked action items (stale follow-ups, upcoming interviews, high-match wishlist items, missing AI evaluations, salary negotiation opportunities, and rejection momentum checks) calculated with 0 recurring AI API costs.

## User Stories
1. As a job seeker, I want to see a prioritized action feed at the top of my dashboard, so that I immediately know what tasks to perform today.
2. As a job seeker, I want stale applications (applied > 7 days ago with no updates) flagged as urgent follow-ups, so that opportunities do not go cold.
3. As a job seeker, I want upcoming interviews flagged with a direct link to generated prep notes, so that I am prepared.
4. As a job seeker, I want high-match wishlist items flagged, so that I can prioritize submitting applications to roles I am qualified for.
5. As a job seeker, I want action items to automatically clear when I update the application, so that my action feed remains honest and accurate.

## Implementation Decisions
- **Backend Service Layer**: Build `ActionFeedService` in `app/Services/` that queries user applications via Eloquent and returns a structured collection of action items.
- **Data Model Seams**: Query `JobApplication` records using existing timestamps (`last_contacted_at`, `interview_date`, `ai_evaluated_at`, `created_at`).
- **Dashboard Props**: Inject `ActionFeedService` into `DashboardController` and pass `action_items` as Inertia page props.
- **Frontend UI**: Update `resources/js/pages/dashboard.tsx` with a top Action Feed section rendering cards with priority badges (Urgent/Moderate/Low), company badges, and quick-action trigger buttons.
- **Zero-AI Cost**: All feed item calculations run strictly server-side using pure database logic with 0 external API calls.

## Testing Decisions
- Write Pest feature tests verifying that `ActionFeedService` returns correct action items when applications meet trigger conditions (e.g. `last_contacted_at` older than 7 days).
- Verify that updating an application's status or `last_contacted_at` automatically removes it from the action feed response.

## Out of Scope
- Manual dismissal buttons (items are auto-clearing only).
- Background queue workers or email notification dispatchers.
